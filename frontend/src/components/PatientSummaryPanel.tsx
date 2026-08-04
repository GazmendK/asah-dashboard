import type { ReactNode } from 'react'
import { Box, Paper, Typography } from '@mui/material'

import type { PatientSummary } from '../api'
import { useLanguage } from '../i18n'

// Zusammenfassung der statischen Patientenmerkmale unter der Statusleiste.

// Einzelne Merkmalskachel aus Beschriftung und Wert
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

export function PatientSummaryPanel({ summary }: { summary: PatientSummary }) {
  const { t } = useLanguage()

  // Outcome-Labels binaer kodiert. werden in Klartext uebersetzt, fehlender Wert bleibt als Strich stehen
  const mortality = (value: number | null) =>
    value == null ? '-' : value === 1 ? t('mortality.deceased') : t('mortality.survived')
  const functional = (value: number | null) =>
    value == null ? '-' : value === 1 ? t('functional.favorable') : t('functional.unfavorable')

  const cells: { id: string; label: string; value: ReactNode }[] = [
    { id: 'sex', label: t('summary.sex'), value: summary.sex ? t(`sex.${summary.sex}`) : '-' },
    { id: 'age', label: t('summary.age'), value: summary.age ?? '-' },
    { id: 'intervention', label: t('summary.intervention'), value: summary.intervention ?? '-' },
    {
      id: 'location',
      label: t('summary.location'),
      value: summary.aneurysmLocation ? t(`location.${summary.aneurysmLocation}`) : '-',
    },
    { id: 'fisher', label: t('summary.fisher'), value: summary.fisher ?? '-' },
    { id: 'mFisher', label: t('summary.mFisher'), value: summary.mFisher ?? '-' },
    { id: 'wfns', label: t('summary.wfns'), value: summary.wfns ? t(`wfns.${summary.wfns}`) : '-' },
    {
      id: 'stay',
      label: t('summary.stay'),
      value: summary.stayDays != null ? t('summary.days', { n: Math.ceil(summary.stayDays) }) : '-',
    },
    { id: 'mortD', label: t('summary.mortalityDischarge'), value: mortality(summary.outcome.mortalityDischarge) },
    { id: 'mort6', label: t('summary.mortality6m'), value: mortality(summary.outcome.mortality6M) },
    {
      id: 'funcD',
      label: t('summary.functionalDischarge'),
      value: functional(summary.outcome.functionalOutcomeDischarge),
    },
    { id: 'func6', label: t('summary.functional6m'), value: functional(summary.outcome.functionalOutcome6M) },
  ]

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {t('summary.title')}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 1,
        }}
      >
        {cells.map((cell) => (
          <Stat key={cell.id} label={cell.label} value={cell.value} />
        ))}
      </Box>
    </Paper>
  )
}
