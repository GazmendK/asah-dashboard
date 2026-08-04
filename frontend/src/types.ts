// Zustand des Kohortenfilters. Leere Listen bedeuten "keine Einschraenkung",
// nicht "nichts auswaehlen". Liegt zentral in App.tsx und wird an das
// Filterpanel und die Patientenauswahl weitergereicht.
export interface Filters {
  ageRange: [number, number]
  fisher: number[]
  mFisher: number[]
  wfns: string[]
  location: string[]
}
