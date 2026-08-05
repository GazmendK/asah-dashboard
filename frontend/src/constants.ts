import type { Complications } from './api'

// Fachliche Festlegungen der Oberflaeche an einer Stelle
export interface VitalParamDef {
  key: string
  unit: string
}

// CPP steht mit in der Liste, obwohl er nicht gemessen, sondern vom Backend
// aus MAP und ICP abgeleitet wird. Fuer die Anzeige verhaelt er sich gleich.
export const VITAL_PARAMS: VitalParamDef[] = [
  { key: 'HF', unit: 'bpm' },
  { key: 'BPSystolic', unit: 'mmHg' },
  { key: 'BPDiastolic', unit: 'mmHg' },
  { key: 'BPMean', unit: 'mmHg' },
  { key: 'ICP', unit: 'mmHg' },
  { key: 'CPP', unit: 'mmHg' },
  { key: 'SPO2', unit: '%' },
  { key: 'RR', unit: '/min' },
  { key: 'T', unit: '°C' },
]

// Vorauswahl beim Start, bewusst klein gehalten statt aller neun Parameter
export const DEFAULT_PARAMS = ['HF', 'BPMean', 'ICP', 'SPO2']

// Auspraegungen der Filterhistogramme
export const FISHER_GRADES = [1, 2, 3, 4]
export const MFISHER_GRADES = [0, 1, 2, 3, 4]
export const WFNS_CATEGORIES = ['good', 'poor']
export const LOCATIONS = ['anterior', 'posterior']

// Reihenfolge der Kurzmarken in der Statusleiste
export const COMPLICATION_KEYS: (keyof Complications)[] = [
  'vasospasm',
  'dci',
  'delayedInfarction',
  'epilepsy',
  'myocardialInfarction',
  'hydrocephalus',
  'infections',
]

// Alarmgrenzen fuer die farbliche Hervorhebung
export const THRESHOLDS: Record<string, { high?: number; low?: number }> = {
  ICP: { high: 22 },
  SPO2: { low: 90 },
  CPP: { low: 60 },
  T: { high: 38.3 },
}
