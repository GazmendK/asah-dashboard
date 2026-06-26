const API_BASE: string = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000'

export interface Patient {
  caseId: number
  age: number | null
  sex: string | null
  intervention: string | null
  aneurysmLocation: string | null
  wfns: string | null
  fisher: number | null
  mFisher: number | null
  stayDays: number | null
}

export interface Complications {
  vasospasm: number | null
  dci: number | null
  delayedInfarction: number | null
  epilepsy: number | null
  myocardialInfarction: number | null
  hydrocephalus: number | null
  infections: number | null
}

export interface Outcome {
  mortalityDischarge: number | null
  mortality6M: number | null
  functionalOutcomeDischarge: number | null
  functionalOutcome6M: number | null
}

export interface PatientSummary extends Patient {
  complications: Complications
  outcome: Outcome
}

export interface TimeseriesPoint {
  param: string
  t: number
  value: number | null
}

export interface TimeseriesResponse {
  caseId: number
  resolution: string
  params: string[]
  points: TimeseriesPoint[]
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status} bei ${path}`)
  return res.json() as Promise<T>
}

export function fetchPatients(): Promise<Patient[]> {
  return getJson<Patient[]>('/patients')
}

export function fetchPatientSummary(caseId: number): Promise<PatientSummary> {
  return getJson<PatientSummary>(`/patients/${caseId}`)
}

export function fetchTimeseries(
  caseId: number,
  params: string[],
  resolution: string,
): Promise<TimeseriesResponse> {
  const query = new URLSearchParams({ params: params.join(','), resolution })
  return getJson<TimeseriesResponse>(`/patients/${caseId}/timeseries?${query.toString()}`)
}

export interface LabPoint {
  analyte: string
  t: number
  value: number | null
  unit: string | null
}

export interface LabResponse {
  caseId: number
  analytes: string[]
  points: LabPoint[]
}

export function fetchLabs(caseId: number, analytes?: string[]): Promise<LabResponse> {
  if (analytes && analytes.length) {
    const query = new URLSearchParams({ analytes: analytes.join(',') })
    return getJson<LabResponse>(`/patients/${caseId}/labs?${query.toString()}`)
  }
  return getJson<LabResponse>(`/patients/${caseId}/labs`)
}

export function fetchAvailableLabs(caseId: number): Promise<string[]> {
  return getJson<string[]>(`/patients/${caseId}/labs/available`)
}
