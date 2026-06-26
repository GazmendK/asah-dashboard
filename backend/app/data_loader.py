from __future__ import annotations

import numpy as np
import pandas as pd

from . import config as C
from .preprocessing import build_cache


class _Store:
    def __init__(self) -> None:
        self._patients: pd.DataFrame | None = None
        self._physio: pd.DataFrame | None = None
        self._labs: pd.DataFrame | None = None

    def load(self) -> None:
        build_cache(force=False)
        self._patients = pd.read_parquet(C.PATIENTS_PARQUET)
        self._physio = pd.read_parquet(C.PHYSIO_PARQUET).set_index("case_id").sort_index()
        self._labs = pd.read_parquet(C.LAB_PARQUET).set_index("case_id").sort_index()

    @property
    def patients(self) -> pd.DataFrame:
        if self._patients is None:
            self.load()
        return self._patients
    @property
    def physio(self) -> pd.DataFrame:
        if self._physio is None:
            self.load()
        return self._physio
    @property
    def labs(self) -> pd.DataFrame:
        if self._labs is None:
            self.load()
        return self._labs

store = _Store()


def _na(value):
    if value is None or (isinstance(value, float) and np.isnan(value)) or value is pd.NA:
        return None
    return value


def patient_exists(case_id: int) -> bool:
    return bool((store.patients["case_id"] == case_id).any())


def _patient_row(case_id: int) -> pd.Series:
    return store.patients.loc[store.patients["case_id"] == case_id].iloc[0]


def _slice(df: pd.DataFrame, case_id: int) -> pd.DataFrame:
    if case_id not in df.index:
        return df.iloc[0:0]
    return df.loc[[case_id]]


def list_patients() -> list[dict]:
    cols = ["case_id", "age", "sex", "intervention", "aneurysm_location",
            "wfns", "fisher", "m_fisher", "stay_days"]
    df = store.patients[cols]
    out = []
    for _, r in df.iterrows():
        out.append({
            "caseId": int(r["case_id"]),
            "age": None if _na(r["age"]) is None else int(r["age"]),
            "sex": _na(r["sex"]),
            "intervention": _na(r["intervention"]),
            "aneurysmLocation": _na(r["aneurysm_location"]),
            "wfns": _na(r["wfns"]),
            "fisher": None if _na(r["fisher"]) is None else int(r["fisher"]),
            "mFisher": None if _na(r["m_fisher"]) is None else int(r["m_fisher"]),
            "stayDays": None if _na(r["stay_days"]) is None else round(float(r["stay_days"]), 2),
        })
    return out


def _int_or_none(row: pd.Series, col: str):
    v = _na(row.get(col))
    return None if v is None else int(v)


def patient_summary(case_id: int) -> dict:
    r = _patient_row(case_id)
    return {
        "caseId": int(r["case_id"]),
        "age": _int_or_none(r, "age"),
        "sex": _na(r.get("sex")),
        "intervention": _na(r.get("intervention")),
        "aneurysmLocation": _na(r.get("aneurysm_location")),
        "wfns": _na(r.get("wfns")),
        "fisher": _int_or_none(r, "fisher"),
        "mFisher": _int_or_none(r, "m_fisher"),
        "stayDays": None if _na(r.get("stay_days")) is None else round(float(r["stay_days"]), 2),
        "complications": complications(case_id),
        "outcome": outcome(case_id),
    }


def complications(case_id: int) -> dict:
    r = _patient_row(case_id)
    keys = ["vasospasm", "dci", "delayed_infarction", "epilepsy",
            "myocardial_infarction", "hydrocephalus", "infections"]
    alias = {"delayed_infarction": "delayedInfarction", "myocardial_infarction": "myocardialInfarction"}
    return {alias.get(k, k): _int_or_none(r, k) for k in keys}


def outcome(case_id: int) -> dict:
    r = _patient_row(case_id)
    return {
        "mortalityDischarge": _int_or_none(r, "mortality_discharge"),
        "mortality6M": _int_or_none(r, "mortality_6m"),
        "functionalOutcomeDischarge": _int_or_none(r, "functional_outcome_discharge"),
        "functionalOutcome6M": _int_or_none(r, "functional_outcome_6m"),
    }


def _aggregate(sub: pd.DataFrame, resolution: str) -> pd.DataFrame:
    valid = sub[sub["valid"]].copy()
    if valid.empty:
        return valid.assign(t=[], value=[])
    bin_size = 1.0 / 24.0 if resolution == "hour" else 1.0
    valid["bin"] = np.floor(valid["t"] / bin_size) * bin_size
    agg = (valid.groupby(["param", "bin"], observed=True)["value"]
           .mean().reset_index().rename(columns={"bin": "t"}))
    return agg


def timeseries(case_id: int, params: list[str], resolution: str) -> list[dict]:
    sub = _slice(store.physio, case_id)
    base_params = [p for p in params if p in C.VITAL_PARAMS]
    want_cpp = "CPP" in params

    points: list[dict] = []
    if resolution == "raw":
        sel = sub[sub["param"].isin(base_params)]
        for _, r in sel.iterrows():
            points.append({"param": r["param"], "t": round(float(r["t"]), 5),
                           "value": _na(r["value"])})
    else:
        sel = sub[sub["param"].isin(base_params)]
        agg = _aggregate(sel, resolution)
        for _, r in agg.iterrows():
            points.append({"param": r["param"], "t": round(float(r["t"]), 5),
                           "value": round(float(r["value"]), 3)})
        if want_cpp:
            points.extend(_derive_cpp(sub, resolution))

    return points


def _derive_cpp(sub: pd.DataFrame, resolution: str) -> list[dict]:
    agg = _aggregate(sub[sub["param"].isin(["BPMean", "ICP"])], resolution)
    if agg.empty:
        return []
    wide = agg.pivot(index="t", columns="param", values="value")
    if "BPMean" not in wide or "ICP" not in wide:
        return []
    cpp = (wide["BPMean"] - wide["ICP"]).dropna()
    return [{"param": "CPP", "t": round(float(t), 5), "value": round(float(v), 3)}
            for t, v in cpp.items()]


def available_labs(case_id: int) -> list[str]:
    sub = _slice(store.labs, case_id)
    return sorted(str(a) for a in sub["analyte"].unique())


def labs(case_id: int, analytes: list[str] | None) -> list[dict]:
    sub = _slice(store.labs, case_id)
    if not analytes:
        present = set(sub["analyte"].unique())
        analytes = [a for a in C.DEFAULT_LABS if a in present]
    sel = sub[sub["analyte"].isin(analytes)]
    points = []
    for _, r in sel.iterrows():
        points.append({
            "analyte": r["analyte"],
            "t": round(float(r["t"]), 5),
            "value": _na(r["value"]),
            "unit": _na(r.get("unit")) or None,
        })
    return points
