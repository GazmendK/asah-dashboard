import { Chip, Paper, Stack, Typography } from '@mui/material'

import type { PatientSummary } from '../api'
import { COMPLICATION_LABELS } from '../constants'

function yesNo(value: number | null) {
  if (value == null) return { text: '–', positive: false, missing: true }
  return { text: value === 1 ? 'ja' : 'nein', positive: value === 1, missing: false }
}

export function StatusBar({ summary }: { summary: PatientSummary }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Komplikations-Status &amp; Aufnahme-Scores
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {COMPLICATION_LABELS.map(({ key, label }) => {
          const s = yesNo(summary.complications[key])
          return (
            <Chip
              key={key}
              size="small"
              color={s.positive ? 'warning' : 'default'}
              variant={s.positive ? 'filled' : 'outlined'}
              label={`${label}: ${s.text}`}
            />
          )
        })}
        <Chip size="small" variant="outlined" label={`Fisher: ${summary.fisher ?? '–'}`} />
        <Chip size="small" variant="outlined" label={`mFisher: ${summary.mFisher ?? '–'}`} />
        <Chip size="small" variant="outlined" label={`WFNS: ${summary.wfns ?? '–'}`} />
      </Stack>
    </Paper>
  )
}
