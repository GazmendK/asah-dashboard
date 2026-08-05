from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CACHE_DIR = DATA_DIR / "cache"

CLINICAL_CSV = DATA_DIR / "clinical_demog_dataset.csv"
PHYSIO_CSV = DATA_DIR / "physiological_dataset.csv"
LAB_CSV = DATA_DIR / "laboratory_dataset.csv"
COMPLICATIONS_CSV = DATA_DIR / "targets_complications.csv"
OUTCOME_CSV = DATA_DIR / "targets_mortality_funcoutcome.csv"

PATIENTS_PARQUET = CACHE_DIR / "patients.parquet"
PHYSIO_PARQUET = CACHE_DIR / "physio.parquet"
LAB_PARQUET = CACHE_DIR / "labs.parquet"

# utf-8-sig entfernt die BOM, die Excel beim Export voranstellt
CSV_ENCODING = "utf-8-sig"

VITAL_PARAMS = ["HF", "SPO2", "BPSystolic", "BPDiastolic", "BPMean", "ICP", "RR", "T"]

# CPP wird zur Laufzeit aus MAP und ICP berechnet
DERIVED_PARAMS = ["CPP"]

# Werte ausserhalb dieser Grenzen werden verworfen.
PLAUSIBILITY = {
    "HF": (10.0, 250.0),
    "SPO2": (40.0, 100.0),
    "BPSystolic": (20.0, 300.0),
    "BPDiastolic": (10.0, 200.0),
    "BPMean": (15.0, 250.0),
    "ICP": (-10.0, 120.0),
    "RR": (3.0, 80.0),
    "T": (28.0, 43.0),
}

# Klinische Alarmgrenzen fuer die farbliche Hervorhebung
THRESHOLDS = {
    "ICP": {"high": 22.0},
    "SPO2": {"low": 90.0},
    "CPP": {"low": 60.0},
    "T": {"high": 38.3},
}

DEFAULT_LABS = ["Na+", "K+", "Ca++", "Glu", "Lac", "pH", "CRP", "tHb", "pO2", "pCO2"]

RESOLUTIONS = ("raw", "hour", "day")
DEFAULT_RESOLUTION = "hour"

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
