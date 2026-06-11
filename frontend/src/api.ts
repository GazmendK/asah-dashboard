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

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status} bei ${path}`)
  return res.json() as Promise<T>
}

export function fetchPatients(): Promise<Patient[]> {
  return getJson<Patient[]>('/patients')
}
