from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import config as C
from .data_loader import store
from .routers import dataset, patients


@asynccontextmanager
async def lifespan(app: FastAPI):
    if C.CLINICAL_CSV.exists() or C.PATIENTS_PARQUET.exists():
        store.load_demo()
    yield


app = FastAPI(
    title="aSAB-Verlaufsdashboard API",
    version="0.1.0",
    description="REST-Schnittstelle für klinische Verlaufsdaten (aSAB).",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=C.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(dataset.router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "patients": len(store.patients)}


@app.get("/", tags=["meta"])
def root():
    return {"message": "aSAB-Verlaufsdashboard API", "docs": "/docs"}
