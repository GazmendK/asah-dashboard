export type Lang = 'de' | 'en'

type Dict = Record<string, string>

const de: Dict = {
  'app.title': 'aSAB-Verlaufsdashboard',

  'filter.title': 'Filter & Auswahl',
  'filter.reset': 'Zurücksetzen',
  'filter.age': 'Alter',
  'filter.showParams': 'Parameter anzeigen',
  'score.fisher': 'Fisher-Grad',
  'score.mFisher': 'mFisher-Grad',
  'score.wfns': 'WFNS',
  'score.location': 'Aneurysma-Lokalisation',

  'param.HF': 'Herzfrequenz',
  'param.BPSystolic': 'Blutdruck systolisch',
  'param.BPDiastolic': 'Blutdruck diastolisch',
  'param.BPMean': 'Blutdruck mittel (MAP)',
  'param.ICP': 'Intrakranieller Druck',
  'param.CPP': 'Zerebraler Perfusionsdruck',
  'param.SPO2': 'Sauerstoffsättigung',
  'param.RR': 'Atemfrequenz',
  'param.T': 'Temperatur',

  'complication.vasospasm': 'Vasospasmus',
  'complication.dci': 'DCI',
  'complication.delayedInfarction': 'Verzögerter Infarkt',
  'complication.epilepsy': 'Epilepsie',
  'complication.myocardialInfarction': 'Myokardinfarkt',
  'complication.hydrocephalus': 'Hydrozephalus',
  'complication.infections': 'Infektionen',

  'sex.female': 'weiblich',
  'sex.male': 'männlich',

  'wfns.good': 'gut',
  'wfns.poor': 'schlecht',

  'location.anterior': 'anterior',
  'location.posterior': 'posterior',

  'status.title': 'Komplikations-Status & Aufnahme-Scores',
  'common.yes': 'ja',
  'common.no': 'nein',

  'summary.title': 'Patient-Zusammenfassung',
  'summary.sex': 'Geschlecht',
  'summary.age': 'Alter',
  'summary.intervention': 'Intervention',
  'summary.location': 'Lokalisation',
  'summary.fisher': 'Fisher',
  'summary.mFisher': 'mFisher',
  'summary.wfns': 'WFNS',
  'summary.stay': 'Aufenthalt',
  'summary.mortalityDischarge': 'Mortalität (Entl.)',
  'summary.mortality6m': 'Mortalität (6 M.)',
  'summary.functionalDischarge': 'Funkt. Outcome (Entl.)',
  'summary.functional6m': 'Funkt. Outcome (6 M.)',
  'summary.days': '{n} Tage',
  'mortality.deceased': 'verstorben',
  'mortality.survived': 'überlebt',
  'functional.favorable': 'günstig',
  'functional.unfavorable': 'ungünstig',

  'vitals.title': 'Vitalverläufe',
}

const en: Dict = {
  'app.title': 'aSAH Course Dashboard',

  'filter.title': 'Filters & Selection',
  'filter.reset': 'Reset',
  'filter.age': 'Age',
  'filter.showParams': 'Show parameters',
  'score.fisher': 'Fisher grade',
  'score.mFisher': 'Modified Fisher grade',
  'score.wfns': 'WFNS',
  'score.location': 'Aneurysm location',

  'param.HF': 'Heart rate',
  'param.BPSystolic': 'Systolic blood pressure',
  'param.BPDiastolic': 'Diastolic blood pressure',
  'param.BPMean': 'Mean arterial pressure (MAP)',
  'param.ICP': 'Intracranial pressure',
  'param.CPP': 'Cerebral perfusion pressure',
  'param.SPO2': 'Oxygen saturation',
  'param.RR': 'Respiratory rate',
  'param.T': 'Temperature',

  'complication.vasospasm': 'Vasospasm',
  'complication.dci': 'DCI',
  'complication.delayedInfarction': 'Delayed infarction',
  'complication.epilepsy': 'Epilepsy',
  'complication.myocardialInfarction': 'Myocardial infarction',
  'complication.hydrocephalus': 'Hydrocephalus',
  'complication.infections': 'Infections',

  'sex.female': 'female',
  'sex.male': 'male',

  'wfns.good': 'good',
  'wfns.poor': 'poor',

  'location.anterior': 'anterior',
  'location.posterior': 'posterior',

  'status.title': 'Complication status & admission scores',
  'common.yes': 'yes',
  'common.no': 'no',

  'summary.title': 'Patient Summary',
  'summary.sex': 'Sex',
  'summary.age': 'Age',
  'summary.intervention': 'Intervention',
  'summary.location': 'Location',
  'summary.fisher': 'Fisher',
  'summary.mFisher': 'mFisher',
  'summary.wfns': 'WFNS',
  'summary.stay': 'Length of stay',
  'summary.mortalityDischarge': 'Mortality (discharge)',
  'summary.mortality6m': 'Mortality (6 mo.)',
  'summary.functionalDischarge': 'Functional outcome (discharge)',
  'summary.functional6m': 'Functional outcome (6 mo.)',
  'summary.days': '{n} days',
  'mortality.deceased': 'deceased',
  'mortality.survived': 'survived',
  'functional.favorable': 'favorable',
  'functional.unfavorable': 'unfavorable',

  'vitals.title': 'Vital sign trends',
}

export const translations: Record<Lang, Dict> = { de, en }
