import type { Complications } from './api'

export interface VitalParamDef {
  key: string
  unit: string
}

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

export const DEFAULT_PARAMS = ['HF', 'BPMean', 'ICP', 'SPO2']

export const FISHER_GRADES = [1, 2, 3, 4]
export const MFISHER_GRADES = [0, 1, 2, 3, 4]
export const WFNS_CATEGORIES = ['good', 'poor']
export const LOCATIONS = ['anterior', 'posterior']

export const COMPLICATION_KEYS: (keyof Complications)[] = [
  'vasospasm',
  'dci',
  'delayedInfarction',
  'epilepsy',
  'myocardialInfarction',
  'hydrocephalus',
  'infections',
]

export const THRESHOLDS: Record<string, { high?: number; low?: number }> = {
  ICP: { high: 22 },
  SPO2: { low: 90 },
  CPP: { low: 60 },
}
