import { useEffect, useState } from 'react'
import { Stack, Typography } from '@mui/material'

import { fetchTimeseries, type TimeseriesPoint } from '../api'
import { THRESHOLDS, VITAL_PARAMS } from '../constants'
import { useLanguage } from '../i18n'
import { SeriesChart } from './SeriesChart'

const PARAMS = Object.fromEntries(VITAL_PARAMS.map((p) => [p.key, p]))

interface Props {
  caseId: number
  params: string[]
}

// Small Multiples der Vitalverlaeufe
export function VitalsPanel({ caseId, params }: Props) {
  const { t } = useLanguage()
  const [points, setPoints] = useState<TimeseriesPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verhindert, dass die Antwort eines vorherigen Patienten die Anzeige
    // des inzwischen gewaehlten ueberschreibt.
    let active = true
    setPoints(null)
    setError(null)
    fetchTimeseries(caseId, params, 'hour')
      .then((r) => {
        if (active) setPoints(r.points)
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      active = false
    }
  }, [caseId, params])

  return (
    <Stack spacing={2}>
      <Typography variant="overline" color="text.secondary">
        {t('vitals.title')}
      </Typography>
      {params.map((param) => {
        const def = PARAMS[param]
        const label = t(`param.${param}`)
        const series = points
          ? points.filter((p) => p.param === param).map((p) => ({ t: p.t, value: p.value }))
          : null
        return (
          <SeriesChart
            key={param}
            title={def ? `${label} (${def.unit})` : label}
            valueLabel={label}
            unit={def?.unit}
            threshold={THRESHOLDS[param]}
            points={series}
            error={error}
          />
        )
      })}
    </Stack>
  )
}
