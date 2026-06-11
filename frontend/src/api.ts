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
