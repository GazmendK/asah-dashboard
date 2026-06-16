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
import { DEFAULT_PARAMS, VITAL_PARAMS } from './constants'
import type { Filters } from './types'
import { theme } from './theme'
import { AppHeader } from './components/AppHeader'
import { FilterPanel } from './components/FilterPanel'
import { StatusBar } from './components/StatusBar'
import { PatientSummaryPanel } from './components/PatientSummaryPanel'
import { ChartPlaceholder } from './components/ChartPlaceholder'
import { OverviewDetailChart } from './components/OverviewDetailChart'

const PARAM_LOOKUP = Object.fromEntries(VITAL_PARAMS.map((p) => [p.key, p]))

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

  useEffect(() => {
    fetchPatients()
      .then((list) => {
        setPatients(list)
        const ages = list.map((p) => p.age).filter((a): a is number => a != null)
        if (ages.length) {
          setFilters((f) => ({ ...f, ageRange: [Math.min(...ages), Math.max(...ages)] }))
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

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
      />

      <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
        <Box
          component="aside"
          sx={{
            width: 280,
            flexShrink: 0,
            p: 2,
            borderRight: 1,
            borderColor: 'divider',
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
          }}
        >
          <FilterPanel
            filters={filters}
            onFilters={setFilters}
            ageBounds={ageBounds}
            selectedParams={selectedParams}
            onParams={setSelectedParams}
          />
        </Box>

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
                <>
                  <OverviewDetailChart caseId={selected.caseId} param={selectedParams[0]} />
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: 2,
                    }}
                  >
                    {selectedParams.map((key) => {
                      const def = PARAM_LOOKUP[key]
                      return (
                        <ChartPlaceholder
                          key={key}
                          title={def ? `${def.label} (${def.unit})` : key}
                          height={140}
                          note="Detail-Chart folgt (Phase 4)"
                        />
                      )
                    })}
                  </Box>
                </>
              ) : (
                <Alert severity="info">Keine Parameter ausgewählt.</Alert>
              )}

              {summaryLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={20} />
                  <Typography>Lade Patientendaten…</Typography>
                </Box>
              )}

              {summary && (
                <>
                  <StatusBar summary={summary} />
                  <PatientSummaryPanel summary={summary} />
                </>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
