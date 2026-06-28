from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from .. import config as C
from ..data_loader import store
from ..preprocessing import build_frames

router = APIRouter(prefix="/dataset", tags=["dataset"])


@router.get("/status")
def get_status():
    return store.info()


@router.post("/upload")
def upload_dataset(
    clinical: UploadFile = File(...),
    physiological: UploadFile | None = File(None),
    laboratory: UploadFile | None = File(None),
    complications: UploadFile | None = File(None),
    outcome: UploadFile | None = File(None),
):
    sources = {
        "clinical": clinical.file,
        "physiological": physiological.file if physiological else None,
        "laboratory": laboratory.file if laboratory else None,
        "complications": complications.file if complications else None,
        "outcome": outcome.file if outcome else None,
    }
    try:
        frames = build_frames(sources)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Verarbeitung fehlgeschlagen: {exc}")
    store.load_frames(frames)
    return store.info()


@router.delete("")
def reset_dataset():
    if C.CLINICAL_CSV.exists() or C.PATIENTS_PARQUET.exists():
        store.load_demo()
    return store.info()
