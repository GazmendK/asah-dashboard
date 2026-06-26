from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from .. import config as C
from .. import data_loader as dl
from ..models import (
    Complications,
    LabResponse,
    Outcome,
    PatientListItem,
    PatientSummary,
    TimeseriesResponse,
)

router = APIRouter(prefix="/patients", tags=["patients"])


def _require_patient(case_id: int) -> None:
    if not dl.patient_exists(case_id):
        raise HTTPException(status_code=404, detail=f"Patient {case_id} nicht gefunden.")


def _split(csv: str | None) -> list[str]:
    if not csv:
        return []
    return [s.strip() for s in csv.split(",") if s.strip()]


@router.get("", response_model=list[PatientListItem])
def get_patients():
    return dl.list_patients()


@router.get("/{case_id}", response_model=PatientSummary)
def get_patient(case_id: int):
    _require_patient(case_id)
    return dl.patient_summary(case_id)


@router.get("/{case_id}/timeseries", response_model=TimeseriesResponse)
def get_timeseries(
    case_id: int,
    params: str | None = Query(default=None, description="Komma-Liste, z. B. HF,ICP,CPP."),
    resolution: str = Query(default=C.DEFAULT_RESOLUTION, description="raw | hour | day"),
):
    _require_patient(case_id)
    if resolution not in C.RESOLUTIONS:
        raise HTTPException(status_code=400, detail=f"resolution muss in {C.RESOLUTIONS} sein.")
    requested = _split(params) or list(C.VITAL_PARAMS)
    points = dl.timeseries(case_id, requested, resolution)
    return {"caseId": case_id, "resolution": resolution, "params": requested, "points": points}


@router.get("/{case_id}/labs", response_model=LabResponse)
def get_labs(
    case_id: int,
    analytes: str | None = Query(default=None, description="Komma-Liste von Analyten."),
):
    _require_patient(case_id)
    requested = _split(analytes) or None
    points = dl.labs(case_id, requested)
    used = sorted({p["analyte"] for p in points}) if requested is None else requested
    return {"caseId": case_id, "analytes": used, "points": points}


@router.get("/{case_id}/labs/available", response_model=list[str])
def get_available_labs(case_id: int):
    _require_patient(case_id)
    return dl.available_labs(case_id)


@router.get("/{case_id}/complications", response_model=Complications)
def get_complications(case_id: int):
    _require_patient(case_id)
    return dl.complications(case_id)


@router.get("/{case_id}/outcome", response_model=Outcome)
def get_outcome(case_id: int):
    _require_patient(case_id)
    return dl.outcome(case_id)
