import { useEffect, useState } from 'react'
import { Stack, Typography } from '@mui/material'

import { fetchTimeseries, type TimeseriesPoint } from '../api'
import { THRESHOLDS, VITAL_PARAMS } from '../constants'
import { SeriesChart } from './SeriesChart'

const PARAMS = Object.fromEntries(VITAL_PARAMS.map((p) => [p.key, p]))

interface Props {
  caseId: number
  params: string[]
}

export function VitalsPanel({ caseId, params }: Props) {
  const [points, setPoints] = useState<TimeseriesPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
        Vitalverläufe
      </Typography>
      {params.map((param) => {
        const def = PARAMS[param]
        const series = points
          ? points.filter((p) => p.param === param).map((p) => ({ t: p.t, value: p.value }))
          : null
        return (
          <SeriesChart
            key={param}
            title={def ? `${def.label} (${def.unit})` : param}
            valueLabel={def?.label ?? param}
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
