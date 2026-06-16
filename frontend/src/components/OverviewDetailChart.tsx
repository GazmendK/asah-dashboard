import { useEffect, useRef, useState } from 'react'
import { Box, CircularProgress, Paper, Typography } from '@mui/material'
import { VegaEmbed } from 'react-vega'
import type { VisualizationSpec } from 'vega-embed'

import { fetchTimeseries, type TimeseriesPoint } from '../api'
import { THRESHOLDS, VITAL_PARAMS } from '../constants'

const PARAMS = Object.fromEntries(VITAL_PARAMS.map((p) => [p.key, p]))

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setWidth(Math.max(280, Math.floor(w) - 56))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, width }
}

function buildSpec(
  points: TimeseriesPoint[],
  width: number,
  param: string,
  unit: string,
  label: string,
): VisualizationSpec {
  const th = THRESHOLDS[param]
  const tests: string[] = []
  if (th?.high != null) tests.push(`datum.value > ${th.high}`)
  if (th?.low != null) tests.push(`datum.value < ${th.low}`)
  const test = tests.join(' || ')

  const detail: Record<string, unknown>[] = [
    { mark: { type: 'line', color: '#1f4e79', strokeWidth: 1.5 } },
    {
      mark: { type: 'point', filled: true, size: 28 },
      encoding: {
        color: test
          ? { condition: { test, value: '#c0392b' }, value: '#1f4e79' }
          : { value: '#1f4e79' },
        tooltip: [
          { field: 't', type: 'quantitative', title: 'Tag', format: '.2f' },
          { field: 'value', type: 'quantitative', title: label, format: '.1f' },
        ],
      },
    },
  ]
  if (th?.high != null) {
    detail.push({
      mark: { type: 'rule', color: '#c0392b', strokeDash: [4, 4] },
      encoding: { y: { datum: th.high } },
    })
  }
  if (th?.low != null) {
    detail.push({
      mark: { type: 'rule', color: '#c0392b', strokeDash: [4, 4] },
      encoding: { y: { datum: th.low } },
    })
  }

  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: points },
    vconcat: [
      {
        width,
        height: 64,
        mark: { type: 'line', color: '#7a98b8' },
        params: [{ name: 'brush', select: { type: 'interval', encodings: ['x'] } }],
        encoding: {
          x: { field: 't', type: 'quantitative', title: null },
          y: { field: 'value', type: 'quantitative', title: null },
        },
      },
      {
        width,
        height: 240,
        layer: detail,
        encoding: {
          x: {
            field: 't',
            type: 'quantitative',
            title: 'Tag seit Aufnahme',
            scale: { domain: { param: 'brush' } },
          },
          y: { field: 'value', type: 'quantitative', title: unit },
        },
      },
    ],
    config: { view: { stroke: null }, axis: { labelFontSize: 11, titleFontSize: 12 } },
  }
  return spec as unknown as VisualizationSpec
}

interface Props {
  caseId: number
  param: string
}

export function OverviewDetailChart({ caseId, param }: Props) {
  const { ref, width } = useWidth()
  const [points, setPoints] = useState<TimeseriesPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const def = PARAMS[param]

  useEffect(() => {
    let active = true
    setPoints(null)
    setError(null)
    fetchTimeseries(caseId, [param], 'hour')
      .then((r) => {
        if (active) setPoints(r.points)
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      active = false
    }
  }, [caseId, param])

  const title = def ? `${def.label} (${def.unit})` : param

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Übersicht + Detail — {title}
      </Typography>
      <div ref={ref} style={{ width: '100%' }}>
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        {!points && !error && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 4 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Lade Verlauf…</Typography>
          </Box>
        )}
        {points && points.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
            Keine Messwerte für diesen Parameter.
          </Typography>
        )}
        {points && points.length > 0 && (
          <VegaEmbed
            spec={buildSpec(points, width, param, def?.unit ?? '', def?.label ?? param)}
            options={{ actions: false }}
          />
        )}
      </div>
    </Paper>
  )
}
