import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  CssBaseline,
  Stack,
  ThemeProvider,
  Typography,
} from '@mui/material'

import {
  fetchPatientSummary,
  fetchPatients,
  type Patient,
  type PatientSummary,
} from './api'
import { DEFAULT_PARAMS } from './constants'
import type { Filters } from './types'
import { theme } from './theme'
import { AppHeader } from './components/AppHeader'
import { SidePanel } from './components/SidePanel'
import { FilterPanel } from './components/FilterPanel'
import { StatusBar } from './components/StatusBar'
import { PatientSummaryPanel } from './components/PatientSummaryPanel'
import { VitalsPanel } from './components/VitalsPanel'
import { DualAxisChart } from './components/DualAxisChart'
import { LabsPanel } from './components/LabsPanel'

const INITIAL_FILTERS: Filters = {
  ageRange: [0, 120],
  fisher: [],
  mFisher: [],
  wfns: [],
  location: [],
}

function applyFilters(patients: Patient[], f: Filters): Patient[] {
  return patients.filter((p) => {
    if (p.age != null && (p.age < f.ageRange[0] || p.age > f.ageRange[1])) return false
    if (f.fisher.length && (p.fisher == null || !f.fisher.includes(p.fisher))) return false
    if (f.mFisher.length && (p.mFisher == null || !f.mFisher.includes(p.mFisher))) return false
    if (f.wfns.length && (p.wfns == null || !f.wfns.includes(p.wfns))) return false
    if (f.location.length && (p.aneurysmLocation == null || !f.location.includes(p.aneurysmLocation)))
      return false
    return true
  })
}

function App() {
  const [patients, setPatients] = useState<Patient[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Patient | null>(null)
  const [summary, setSummary] = useState<PatientSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const [selectedParams, setSelectedParams] = useState<string[]>(DEFAULT_PARAMS)
  const [reloadKey, setReloadKey] = useState(0)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [leftWidth, setLeftWidth] = useState(280)
  const [rightWidth, setRightWidth] = useState(320)

  useEffect(() => {
    setPatients(null)
    setError(null)
    fetchPatients()
      .then((list) => {
        setPatients(list)
        const ages = list.map((p) => p.age).filter((a): a is number => a != null)
        if (ages.length) {
          setFilters((f) => ({ ...f, ageRange: [Math.min(...ages), Math.max(...ages)] }))
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
  }, [reloadKey])

  useEffect(() => {
    if (!selected) {
      setSummary(null)
      return
    }
    let active = true
    setSummaryLoading(true)
    fetchPatientSummary(selected.caseId)
      .then((s) => {
        if (active) setSummary(s)
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => {
        if (active) setSummaryLoading(false)
      })
    return () => {
      active = false
    }
  }, [selected])

  const ageBounds = useMemo<[number, number]>(() => {
    const ages = (patients ?? []).map((p) => p.age).filter((a): a is number => a != null)
    return ages.length ? [Math.min(...ages), Math.max(...ages)] : [0, 120]
  }, [patients])

  const options = useMemo(() => {
    const filtered = applyFilters(patients ?? [], filters)
    if (selected && !filtered.some((p) => p.caseId === selected.caseId)) {
      return [selected, ...filtered]
    }
    return filtered
  }, [patients, filters, selected])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppHeader
        patients={options}
        selected={selected}
        onSelect={setSelected}
        stayDays={selected?.stayDays ?? null}
        onDatasetLoaded={() => {
          setSelected(null)
          setSummary(null)
          setReloadKey((k) => k + 1)
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
        <SidePanel
          side="left"
          collapsed={leftCollapsed}
          onToggle={() => setLeftCollapsed((v) => !v)}
          width={leftWidth}
          onWidth={setLeftWidth}
        >
          <FilterPanel
            filters={filters}
            onFilters={setFilters}
            ageBounds={ageBounds}
            selectedParams={selectedParams}
            onParams={setSelectedParams}
            patients={patients ?? []}
            selected={selected}
          />
        </SidePanel>

        <Box
          component="main"
          sx={{ flexGrow: 1, p: 2, height: 'calc(100vh - 64px)', overflowY: 'auto' }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!patients && !error && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={20} />
              <Typography>Lade Patienten…</Typography>
            </Box>
          )}

          {patients && !selected && (
            <Alert severity="info">Bitte oben einen Patienten auswählen.</Alert>
          )}

          {selected && (
            <Stack spacing={2}>
              {selectedParams.length > 0 ? (
                <VitalsPanel caseId={selected.caseId} params={selectedParams} />
              ) : (
                <Alert severity="info">Keine Parameter ausgewählt.</Alert>
              )}

              <DualAxisChart caseId={selected.caseId} />

              <LabsPanel caseId={selected.caseId} />
            </Stack>
          )}
        </Box>

        {selected && (
          <SidePanel
            side="right"
            collapsed={rightCollapsed}
            onToggle={() => setRightCollapsed((v) => !v)}
            width={rightWidth}
            onWidth={setRightWidth}
          >
            {summaryLoading && !summary && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Lade Patientendaten…</Typography>
              </Box>
            )}
            {summary && (
              <Stack spacing={2}>
                <StatusBar summary={summary} />
                <PatientSummaryPanel summary={summary} />
              </Stack>
            )}
          </SidePanel>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default App
