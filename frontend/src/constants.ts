import type { Complications } from './api'

export interface VitalParamDef {
  key: string
  label: string
  unit: string
}

export const VITAL_PARAMS: VitalParamDef[] = [
  { key: 'HF', label: 'Herzfrequenz', unit: 'bpm' },
  { key: 'BPSystolic', label: 'Blutdruck systolisch', unit: 'mmHg' },
  { key: 'BPDiastolic', label: 'Blutdruck diastolisch', unit: 'mmHg' },
  { key: 'BPMean', label: 'Blutdruck mittel (MAP)', unit: 'mmHg' },
  { key: 'ICP', label: 'Intrakranieller Druck', unit: 'mmHg' },
  { key: 'CPP', label: 'Zerebraler Perfusionsdruck', unit: 'mmHg' },
  { key: 'SPO2', label: 'Sauerstoffsättigung', unit: '%' },
  { key: 'RR', label: 'Atemfrequenz', unit: '/min' },
  { key: 'T', label: 'Temperatur', unit: '°C' },
]

export const DEFAULT_PARAMS = ['HF', 'BPMean', 'ICP', 'SPO2']

export const FISHER_GRADES = [1, 2, 3, 4]
export const MFISHER_GRADES = [0, 1, 2, 3, 4]
export const WFNS_CATEGORIES = ['good', 'poor']
export const LOCATIONS = ['anterior', 'posterior']

export const COMPLICATION_LABELS: { key: keyof Complications; label: string }[] = [
  { key: 'vasospasm', label: 'Vasospasmus' },
  { key: 'dci', label: 'DCI' },
  { key: 'delayedInfarction', label: 'Verzögerter Infarkt' },
  { key: 'epilepsy', label: 'Epilepsie' },
  { key: 'myocardialInfarction', label: 'Myokardinfarkt' },
  { key: 'hydrocephalus', label: 'Hydrozephalus' },
  { key: 'infections', label: 'Infektionen' },
]

export const SEX_LABELS: Record<string, string> = {
  female: 'weiblich',
  male: 'männlich',
}

export const THRESHOLDS: Record<string, { high?: number; low?: number }> = {
  ICP: { high: 22 },
  SPO2: { low: 90 },
  CPP: { low: 60 },
}
