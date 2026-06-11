from __future__ import annotations

from pydantic import BaseModel, Field


class PatientListItem(BaseModel):
    case_id: int = Field(alias="caseId")
    age: int | None = None
    sex: str | None = None
    intervention: str | None = None
    aneurysm_location: str | None = Field(default=None, alias="aneurysmLocation")
    wfns: str | None = None
    fisher: int | None = None
    m_fisher: int | None = Field(default=None, alias="mFisher")
    stay_days: float | None = Field(default=None, alias="stayDays")

    model_config = {"populate_by_name": True}


class Complications(BaseModel):
    vasospasm: int | None = None
    dci: int | None = None
    delayed_infarction: int | None = Field(default=None, alias="delayedInfarction")
    epilepsy: int | None = None
    myocardial_infarction: int | None = Field(default=None, alias="myocardialInfarction")
    hydrocephalus: int | None = None
    infections: int | None = None

    model_config = {"populate_by_name": True}


class Outcome(BaseModel):
    mortality_discharge: int | None = Field(default=None, alias="mortalityDischarge")
    mortality_6m: int | None = Field(default=None, alias="mortality6M")
    functional_outcome_discharge: int | None = Field(
        default=None, alias="functionalOutcomeDischarge"
    )
    functional_outcome_6m: int | None = Field(default=None, alias="functionalOutcome6M")

    model_config = {"populate_by_name": True}


class PatientSummary(BaseModel):
    case_id: int = Field(alias="caseId")
    age: int | None = None
    sex: str | None = None
    intervention: str | None = None
    aneurysm_location: str | None = Field(default=None, alias="aneurysmLocation")
    wfns: str | None = None
    fisher: int | None = None
    m_fisher: int | None = Field(default=None, alias="mFisher")
    stay_days: float | None = Field(default=None, alias="stayDays")
    complications: Complications
    outcome: Outcome

    model_config = {"populate_by_name": True}


class TimeseriesPoint(BaseModel):
    param: str
    t: float
    value: float | None = None


class TimeseriesResponse(BaseModel):
    case_id: int = Field(alias="caseId")
    resolution: str
    params: list[str]
    points: list[TimeseriesPoint]

    model_config = {"populate_by_name": True}


class LabPoint(BaseModel):
    analyte: str
    t: float
    value: float | None = None
    unit: str | None = None


class LabResponse(BaseModel):
    case_id: int = Field(alias="caseId")
    analytes: list[str]
    points: list[LabPoint]

    model_config = {"populate_by_name": True}
