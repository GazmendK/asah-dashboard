import { Chip, Paper, Stack, Typography } from '@mui/material'

import type { PatientSummary } from '../api'
import { COMPLICATION_KEYS } from '../constants'
import { useLanguage } from '../i18n'

function status(value: number | null) {
  if (value == null) return { positive: false, missing: true }
  return { positive: value === 1, missing: false }
}

export function StatusBar({ summary }: { summary: PatientSummary }) {
  const { t } = useLanguage()

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {t('status.title')}
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {COMPLICATION_KEYS.map((key) => {
          const s = status(summary.complications[key])
          const text = s.missing ? '–' : s.positive ? t('common.yes') : t('common.no')
          return (
            <Chip
              key={key}
              size="small"
              color={s.positive ? 'warning' : 'default'}
              variant={s.positive ? 'filled' : 'outlined'}
              label={`${t(`complication.${key}`)}: ${text}`}
            />
          )
        })}
        <Chip size="small" variant="outlined" label={`Fisher: ${summary.fisher ?? '–'}`} />
        <Chip size="small" variant="outlined" label={`mFisher: ${summary.mFisher ?? '–'}`} />
        <Chip
          size="small"
          variant="outlined"
          label={`WFNS: ${summary.wfns ? t(`wfns.${summary.wfns}`) : '–'}`}
        />
      </Stack>
    </Paper>
  )
}
