from __future__ import annotations

import sys

import numpy as np
import pandas as pd

from . import config as C


def _read_csv(path, **kw) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(
            f"Eingabedatei fehlt: {path}. Bitte die CSVs in {C.DATA_DIR} ablegen."
        )
    return pd.read_csv(path, encoding=C.CSV_ENCODING, **kw)


def _to_int(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce").astype("Int64")


def _load_timeseries(path, value_extra: list[str] | None = None) -> pd.DataFrame:
    cols = {"CaseId": "case_id", "Timeseries": "param", "Timestamp": "timestamp", "Value": "value"}
    if value_extra and "Unit" in value_extra:
        cols["Unit"] = "unit"
    df = _read_csv(path).rename(columns=cols)
    df["case_id"] = _to_int(df["case_id"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    df = df.dropna(subset=["case_id", "timestamp"])
    df["case_id"] = df["case_id"].astype("int64")
    return df


def _reference_t0(phys: pd.DataFrame, lab: pd.DataFrame) -> tuple[pd.Series, pd.Series]:
    mins = pd.concat(
        [phys.groupby("case_id")["timestamp"].min(),
         lab.groupby("case_id")["timestamp"].min()],
        axis=1,
    ).min(axis=1)
    maxs = pd.concat(
        [phys.groupby("case_id")["timestamp"].max(),
         lab.groupby("case_id")["timestamp"].max()],
        axis=1,
    ).max(axis=1)
    mins.name, maxs.name = "t0", "t_end"
    return mins, maxs


def _rel_days(df: pd.DataFrame, t0: pd.Series) -> pd.Series:
    delta = df["timestamp"] - df["case_id"].map(t0)
    return (delta.dt.total_seconds() / 86400.0).astype("float64")


def _mark_plausibility(phys: pd.DataFrame) -> pd.DataFrame:
    for param, (lo, hi) in C.PLAUSIBILITY.items():
        mask = phys["param"].eq(param)
        bad = mask & ~phys["value"].between(lo, hi)
        phys.loc[bad, "value"] = np.nan
    phys["valid"] = phys["value"].notna()
    return phys


def build_cache(force: bool = False) -> None:
    cached = all(p.exists() for p in (C.PATIENTS_PARQUET, C.PHYSIO_PARQUET, C.LAB_PARQUET))
    if cached and not force:
        return

    C.CACHE_DIR.mkdir(parents=True, exist_ok=True)
    print("[preprocessing] Baue Cache aus Roh-CSVs ...")

    print("  - physiologische Zeitreihen ...")
    phys = _load_timeseries(C.PHYSIO_CSV)
    print("  - Laborwerte ...")
    lab = _load_timeseries(C.LAB_CSV, value_extra=["Unit"])
    lab.rename(columns={"param": "analyte"}, inplace=True)
    if "unit" in lab.columns:
        lab["unit"] = lab["unit"].fillna("").astype(str).str.strip()

    t0, t_end = _reference_t0(phys, lab)
    phys["t"] = _rel_days(phys, t0)
    lab["t"] = _rel_days(lab, t0)

    phys = _mark_plausibility(phys)

    print("  - Patienten-Index ...")
    clin = _read_csv(C.CLINICAL_CSV).rename(columns={
        "CaseId": "case_id", "Age": "age", "Sex": "sex", "Intervention": "intervention",
        "AneurysmLocation": "aneurysm_location", "WFNSCategory": "wfns",
        "Fisher": "fisher", "mFisher": "m_fisher",
    })
    clin["case_id"] = clin["case_id"].astype("int64")
    for col in ("age", "fisher", "m_fisher"):
        clin[col] = _to_int(clin[col])

    comp = _read_csv(C.COMPLICATIONS_CSV).rename(columns={
        "CaseId": "case_id", "Vasospasm": "vasospasm", "DCI": "dci",
        "DelayedInfarction": "delayed_infarction", "Epilepsy": "epilepsy",
        "MyocardialInfarction": "myocardial_infarction", "Hydrocephalus": "hydrocephalus",
        "Infections": "infections",
    })
    out = _read_csv(C.OUTCOME_CSV).rename(columns={
        "CaseId": "case_id", "MortalityDischarge": "mortality_discharge",
        "Mortality6M": "mortality_6m", "FunctionalOutcomeDischarge": "functional_outcome_discharge",
        "FunctionalOutcome6M": "functional_outcome_6m",
    })
    for frame in (comp, out):
        frame["case_id"] = frame["case_id"].astype("int64")
        for col in frame.columns:
            if col != "case_id":
                frame[col] = _to_int(frame[col])

    stay = pd.DataFrame({"t0": t0, "t_end": t_end})
    stay["stay_days"] = (stay["t_end"] - stay["t0"]).dt.total_seconds() / 86400.0
    stay = stay.reset_index().rename(columns={"index": "case_id"})
    stay["case_id"] = stay["case_id"].astype("int64")

    patients = (
        clin.merge(stay[["case_id", "stay_days"]], on="case_id", how="left")
        .merge(comp, on="case_id", how="left")
        .merge(out, on="case_id", how="left")
    )

    print("  - schreibe Parquet-Cache ...")
    keep_phys = ["case_id", "param", "t", "value", "valid"]
    keep_lab = ["case_id", "analyte", "t", "value", "unit"]
    phys[keep_phys].sort_values(["case_id", "param", "t"]).to_parquet(C.PHYSIO_PARQUET, index=False)
    lab[keep_lab].sort_values(["case_id", "analyte", "t"]).to_parquet(C.LAB_PARQUET, index=False)
    patients.sort_values("case_id").to_parquet(C.PATIENTS_PARQUET, index=False)

    print(f"[preprocessing] fertig: {len(patients)} Patienten, "
          f"{len(phys):,} Vital- und {len(lab):,} Laborpunkte.")


if __name__ == "__main__":
    build_cache(force="--force" in sys.argv)
