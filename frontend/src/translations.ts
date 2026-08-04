// Zentrales Woerterbuch der Oberflaeche. Jeder sichtbare Text steht hier und
// wird ueber t('schluessel') aufgeloest, damit neue Texte an nur einer Stelle
// gepflegt werden. Die Schluessel sind nach Bereichen benannt, etwa header,
// filter, vitals. Beide Sprachen muessen dieselben Schluessel fuehren, sonst
// faellt die Anzeige auf Deutsch zurueck.
export type Lang = 'de' | 'en'

type Dict = Record<string, string>

const de: Dict = {
  'app.title': 'aSAB-Verlaufsdashboard',
  'app.loadingPatients': 'Lade Patienten...',
  'app.selectPrompt': 'Bitte oben einen Patienten auswählen.',
  'app.noParams': 'Keine Parameter ausgewählt.',
  'app.loadingPatient': 'Lade Patientendaten...',

  'header.selectPatient': 'Patient auswählen',
  'header.case': 'Fall',
  'header.years': 'J.',
  'header.stay': 'Aufenthalt: Tag 0 - Tag {days}',
  'header.stayNone': 'Aufenthalt: -',
  'header.loadData': 'Daten laden',
  'header.language': 'Sprache',

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

  'labs.title': 'Laborwerte - ohne Referenzband (Normwerte fehlen in den Daten)',
  'labs.analytes': 'Analyte',
  'labs.addAnalyte': 'Analyt hinzufügen',

  'chart.daySinceAdmission': 'Tag seit Aufnahme',
  'chart.day': 'Tag',
  'chart.loading': 'Lade...',
  'chart.noData': 'Keine Messwerte für diesen Patienten.',
  'chart.enlarge': 'Vergrößern',
  'chart.shrink': 'Verkleinern',

  'dual.title': 'MAP & ICP - Dual-Axis',
  'dual.caption': 'Zerebraler Perfusionsdruck (CPP = MAP − ICP)',
  'dual.loading': 'Lade MAP/ICP...',
  'dual.noData': 'Keine MAP-/ICP-Daten für diesen Patienten.',

  'panel.collapse': 'Einklappen',
  'panel.expand': 'Ausklappen',

  'upload.title': 'Eigene Daten laden',
  'upload.intro':
    'Lade die CSV-Dateien hoch. Die klinische Datei ist erforderlich, die übrigen sind optional. (keine dauerhafte Speicherung)',
  'upload.slot.clinical': 'Klinische Daten (clinical)',
  'upload.slot.physiological': 'Physiologische Zeitreihen',
  'upload.slot.laboratory': 'Laborwerte',
  'upload.slot.complications': 'Komplikationen',
  'upload.slot.outcome': 'Outcome / Mortalität',
  'upload.chooseFile': 'Datei wählen',
  'upload.noFile': 'keine Datei',
  'upload.busy': 'Daten werden hochgeladen und aufbereitet. Das kann einen Moment dauern',
  'upload.cancel': 'Abbrechen',
  'upload.submit': 'Hochladen',
}

const en: Dict = {
  'app.title': 'aSAH Course Dashboard',
  'app.loadingPatients': 'Loading patients...',
  'app.selectPrompt': 'Please select a patient above.',
  'app.noParams': 'No parameters selected.',
  'app.loadingPatient': 'Loading patient data...',

  'header.selectPatient': 'Select patient',
  'header.case': 'Case',
  'header.years': 'yrs',
  'header.stay': 'Stay: day 0 - day {days}',
  'header.stayNone': 'Stay: -',
  'header.loadData': 'Load data',
  'header.language': 'Language',

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

  'labs.title': 'Laboratory values - no reference range (normal values missing in data)',
  'labs.analytes': 'Analytes',
  'labs.addAnalyte': 'Add analyte',

  'chart.daySinceAdmission': 'Day since admission',
  'chart.day': 'Day',
  'chart.loading': 'Loading...',
  'chart.noData': 'No measurements for this patient.',
  'chart.enlarge': 'Enlarge',
  'chart.shrink': 'Shrink',

  'dual.title': 'MAP & ICP - dual axis',
  'dual.caption': 'Cerebral perfusion pressure (CPP = MAP − ICP)',
  'dual.loading': 'Loading MAP/ICP...',
  'dual.noData': 'No MAP/ICP data for this patient.',

  'panel.collapse': 'Collapse',
  'panel.expand': 'Expand',

  'upload.title': 'Load your own data',
  'upload.intro':
    'Upload the CSV files. The clinical file is required, the others are optional. (no permanent storage)',
  'upload.slot.clinical': 'Clinical data (clinical)',
  'upload.slot.physiological': 'Physiological time series',
  'upload.slot.laboratory': 'Laboratory values',
  'upload.slot.complications': 'Complications',
  'upload.slot.outcome': 'Outcome / mortality',
  'upload.chooseFile': 'Choose file',
  'upload.noFile': 'no file',
  'upload.busy': 'Data is being uploaded and processed. This may take a moment.',
  'upload.cancel': 'Cancel',
  'upload.submit': 'Upload',
}

export const translations: Record<Lang, Dict> = { de, en }
