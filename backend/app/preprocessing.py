from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd

from . import config as C

CLINICAL_RENAME = {
    "CaseId": "case_id", "Age": "age", "Sex": "sex", "Intervention": "intervention",
    "AneurysmLocation": "aneurysm_location", "WFNSCategory": "wfns",
    "Fisher": "fisher", "mFisher": "m_fisher",
}

COMP_RENAME = {
    "CaseId": "case_id", "Vasospasm": "vasospasm", "DCI": "dci",
    "DelayedInfarction": "delayed_infarction", "Epilepsy": "epilepsy",
    "MyocardialInfarction": "myocardial_infarction", "Hydrocephalus": "hydrocephalus",
    "Infections": "infections",
}

OUTCOME_RENAME = {
    "CaseId": "case_id", "MortalityDischarge": "mortality_discharge",
    "Mortality6M": "mortality_6m", "FunctionalOutcomeDischarge": "functional_outcome_discharge",
    "FunctionalOutcome6M": "functional_outcome_6m",
}

EXPECTED_PATIENT_COLUMNS = [
    "case_id", "age", "sex", "intervention", "aneurysm_location", "wfns",
    "fisher", "m_fisher", "stay_days",
    "vasospasm", "dci", "delayed_infarction", "epilepsy",
    "myocardial_infarction", "hydrocephalus", "infections",
    "mortality_discharge", "mortality_6m",
    "functional_outcome_discharge", "functional_outcome_6m",
]

PHYSIO_COLUMNS = ["case_id", "param", "t", "value", "valid"]
LAB_COLUMNS = ["case_id", "analyte", "t", "value", "unit"]


def _read_csv(src, **kw) -> pd.DataFrame:
    if isinstance(src, Path) and not src.exists():
        raise FileNotFoundError(f"Eingabedatei fehlt: {src}.")
    return pd.read_csv(src, encoding=C.CSV_ENCODING, **kw)


def _require_columns(df: pd.DataFrame, required: list[str], name: str) -> None:
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Datei '{name}': erforderliche Spalte(n) {', '.join(missing)} fehlen.")


def _to_int(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce").astype("Int64")


def _load_timeseries(src, value_extra: list[str] | None = None, name: str = "timeseries") -> pd.DataFrame:
    df = _read_csv(src)
    _require_columns(df, ["CaseId", "Timeseries", "Timestamp", "Value"], name)
    cols = {"CaseId": "case_id", "Timeseries": "param", "Timestamp": "timestamp", "Value": "value"}
    if value_extra and "Unit" in value_extra and "Unit" in df.columns:
        cols["Unit"] = "unit"
    df = df.rename(columns=cols)
    df["case_id"] = _to_int(df["case_id"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    df = df.dropna(subset=["case_id", "timestamp"])
    df["case_id"] = df["case_id"].astype("int64")
    return df


def _load_clinical(src) -> pd.DataFrame:
    df = _read_csv(src)
    _require_columns(df, ["CaseId"], "clinical")
    df = df.rename(columns=CLINICAL_RENAME)
    df["case_id"] = df["case_id"].astype("int64")
    for col in ("age", "fisher", "m_fisher"):
        if col in df.columns:
            df[col] = _to_int(df[col])
    return df


def _load_labels(src, mapping: dict, name: str) -> pd.DataFrame:
    df = _read_csv(src)
    _require_columns(df, ["CaseId"], name)
    df = df.rename(columns=mapping)
    df["case_id"] = df["case_id"].astype("int64")
    for col in df.columns:
        if col != "case_id":
            df[col] = _to_int(df[col])
    keep = ["case_id"] + [c for c in mapping.values() if c != "case_id" and c in df.columns]
    return df[keep]


def _mark_plausibility(phys: pd.DataFrame) -> pd.DataFrame:
    # Unplausible Werte werden auf NaN gesetzt statt geloescht
    for param, (lo, hi) in C.PLAUSIBILITY.items():
        mask = phys["param"].eq(param)
        bad = mask & ~phys["value"].between(lo, hi)
        phys.loc[bad, "value"] = np.nan
    phys["valid"] = phys["value"].notna()
    return phys


def _stay_table(phys: pd.DataFrame | None, lab: pd.DataFrame | None):
    # Tag 0 ist der frueheste Messzeitpunkt
    mins, maxs = [], []
    for frame in (phys, lab):
        if frame is not None and not frame.empty:
            mins.append(frame.groupby("case_id")["timestamp"].min())
            maxs.append(frame.groupby("case_id")["timestamp"].max())
    if not mins:
        return pd.Series(dtype="datetime64[ns]"), pd.Series(dtype="datetime64[ns]")
    t0 = pd.concat(mins, axis=1).min(axis=1).rename_axis("case_id")
    t_end = pd.concat(maxs, axis=1).max(axis=1).rename_axis("case_id")
    return t0, t_end


def _rel_days(df: pd.DataFrame, t0: pd.Series) -> pd.Series:
    # Absolute Zeitstempel werden in "Tage seit Aufnahme" umgerechnet
    delta = df["timestamp"] - df["case_id"].map(t0)
    return (delta.dt.total_seconds() / 86400.0).astype("float64")


def build_frames(sources: dict) -> dict:
    if sources.get("clinical") is None:
        raise ValueError("Die klinischen Daten (clinical) sind erforderlich.")
    clin = _load_clinical(sources["clinical"])

    phys = _load_timeseries(sources["physiological"], name="physiological") if sources.get("physiological") is not None else None

    lab = None
    if sources.get("laboratory") is not None:
        lab = _load_timeseries(sources["laboratory"], value_extra=["Unit"], name="laboratory")
        lab = lab.rename(columns={"param": "analyte"})
        if "unit" not in lab.columns:
            lab["unit"] = ""
        lab["unit"] = lab["unit"].fillna("").astype(str).str.strip()

    t0, t_end = _stay_table(phys, lab)

    if phys is not None:
        phys["t"] = _rel_days(phys, t0) if not t0.empty else np.nan
        phys = _mark_plausibility(phys)
        physio_frame = phys[PHYSIO_COLUMNS].sort_values(["case_id", "param", "t"]).reset_index(drop=True)
    else:
        physio_frame = pd.DataFrame(columns=PHYSIO_COLUMNS)

    if lab is not None:
        lab["t"] = _rel_days(lab, t0) if not t0.empty else np.nan
        labs_frame = lab[LAB_COLUMNS].sort_values(["case_id", "analyte", "t"]).reset_index(drop=True)
    else:
        labs_frame = pd.DataFrame(columns=LAB_COLUMNS)

    patients = clin
    if not t0.empty:
        stay = pd.DataFrame({"t0": t0, "t_end": t_end})
        stay["stay_days"] = (stay["t_end"] - stay["t0"]).dt.total_seconds() / 86400.0
        stay = stay.reset_index()[["case_id", "stay_days"]]
        stay["case_id"] = stay["case_id"].astype("int64")
        patients = patients.merge(stay, on="case_id", how="left")
    if sources.get("complications") is not None:
        patients = patients.merge(_load_labels(sources["complications"], COMP_RENAME, "complications"), on="case_id", how="left")
    if sources.get("outcome") is not None:
        patients = patients.merge(_load_labels(sources["outcome"], OUTCOME_RENAME, "outcome"), on="case_id", how="left")

    # reindex verwirft unbekannte Spalten der Rohdatei und ergaenzt fehlende
    # erwartete Spalten als Leerwerte, sodass das Schema immer identisch ist.
    patients = patients.reindex(columns=EXPECTED_PATIENT_COLUMNS).sort_values("case_id").reset_index(drop=True)
    return {"patients": patients, "physio": physio_frame, "labs": labs_frame}


def _demo_sources() -> dict:
    return {
        "clinical": C.CLINICAL_CSV,
        "physiological": C.PHYSIO_CSV if C.PHYSIO_CSV.exists() else None,
        "laboratory": C.LAB_CSV if C.LAB_CSV.exists() else None,
        "complications": C.COMPLICATIONS_CSV if C.COMPLICATIONS_CSV.exists() else None,
        "outcome": C.OUTCOME_CSV if C.OUTCOME_CSV.exists() else None,
    }


def build_cache(force: bool = False) -> None:
    cached = all(p.exists() for p in (C.PATIENTS_PARQUET, C.PHYSIO_PARQUET, C.LAB_PARQUET))
    if cached and not force:
        return
    C.CACHE_DIR.mkdir(parents=True, exist_ok=True)
    print("[preprocessing] Baue Cache aus Roh-CSVs ...")
    frames = build_frames(_demo_sources())
    frames["patients"].to_parquet(C.PATIENTS_PARQUET, index=False)
    frames["physio"].to_parquet(C.PHYSIO_PARQUET, index=False)
    frames["labs"].to_parquet(C.LAB_PARQUET, index=False)
    print(f"[preprocessing] fertig: {len(frames['patients'])} Patienten.")


if __name__ == "__main__":
    build_cache(force="--force" in sys.argv)
