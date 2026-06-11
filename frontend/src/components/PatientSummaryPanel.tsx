import type { ReactNode } from 'react'
import { Box, Paper, Typography } from '@mui/material'

import type { PatientSummary } from '../api'
import { SEX_LABELS } from '../constants'

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" noWrap>
        {label}
      </Typography>
      <Typography variant="h6" noWrap>
        {value}
      </Typography>
    </Box>
  )
}

function mortality(value: number | null) {
  if (value == null) return '–'
  return value === 1 ? 'verstorben' : 'überlebt'
}

function functional(value: number | null) {
  if (value == null) return '–'
  return value === 1 ? 'günstig' : 'ungünstig'
}

export function PatientSummaryPanel({ summary }: { summary: PatientSummary }) {
  const cells: { label: string; value: ReactNode }[] = [
    { label: 'Geschlecht', value: summary.sex ? (SEX_LABELS[summary.sex] ?? summary.sex) : '–' },
    { label: 'Alter', value: summary.age ?? '–' },
    { label: 'Intervention', value: summary.intervention ?? '–' },
    { label: 'Lokalisation', value: summary.aneurysmLocation ?? '–' },
    { label: 'Fisher', value: summary.fisher ?? '–' },
    { label: 'mFisher', value: summary.mFisher ?? '–' },
    { label: 'WFNS', value: summary.wfns ?? '–' },
    { label: 'Aufenthalt', value: summary.stayDays != null ? `${Math.ceil(summary.stayDays)} Tage` : '–' },
    { label: 'Mortalität (Entl.)', value: mortality(summary.outcome.mortalityDischarge) },
    { label: 'Mortalität (6 M.)', value: mortality(summary.outcome.mortality6M) },
    { label: 'Funkt. Outcome (Entl.)', value: functional(summary.outcome.functionalOutcomeDischarge) },
    { label: 'Funkt. Outcome (6 M.)', value: functional(summary.outcome.functionalOutcome6M) },
  ]

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Patient-Summary
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 1,
        }}
      >
        {cells.map((cell) => (
          <Stat key={cell.label} label={cell.label} value={cell.value} />
        ))}
      </Box>
    </Paper>
  )
}
