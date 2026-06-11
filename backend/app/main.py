from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import config as C
from .data_loader import store
from .routers import patients


@asynccontextmanager
async def lifespan(app: FastAPI):
    store.load()
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
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(patients.router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "patients": len(store.patients)}


@app.get("/", tags=["meta"])
def root():
    return {"message": "aSAB-Verlaufsdashboard API", "docs": "/docs"}
