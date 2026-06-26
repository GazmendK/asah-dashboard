import { useEffect, useState } from 'react'
import { Box, CircularProgress, Paper, Typography } from '@mui/material'
import { VegaEmbed } from 'react-vega'
import type { VisualizationSpec } from 'vega-embed'

import { fetchTimeseries, type TimeseriesPoint } from '../api'
import { THRESHOLDS, VITAL_PARAMS } from '../constants'
import { useChartWidth } from '../useChartWidth'

const PARAMS = Object.fromEntries(VITAL_PARAMS.map((p) => [p.key, p]))

function thresholdLayers(param: string): Record<string, unknown>[] {
  const th = THRESHOLDS[param]
  const layers: Record<string, unknown>[] = []
  if (th?.high != null) {
    layers.push({ mark: { type: 'rule', color: '#c0392b', strokeDash: [4, 4] }, encoding: { y: { datum: th.high } } })
  }
  if (th?.low != null) {
    layers.push({ mark: { type: 'rule', color: '#c0392b', strokeDash: [4, 4] }, encoding: { y: { datum: th.low } } })
  }
  return layers
}

function thresholdTest(param: string): string {
  const th = THRESHOLDS[param]
  const tests: string[] = []
  if (th?.high != null) tests.push(`datum.value > ${th.high}`)
  if (th?.low != null) tests.push(`datum.value < ${th.low}`)
  return tests.join(' || ')
}

function buildSpec(points: TimeseriesPoint[], width: number, params: string[]): VisualizationSpec {
  const present = new Set(points.map((p) => p.param))
  const navParam = params.find((p) => present.has(p)) ?? params[0]

  const overview = {
    width,
    height: 58,
    transform: [{ filter: `datum.param === '${navParam}'` }],
    mark: { type: 'line', color: '#7a98b8' },
    params: [{ name: 'brush', select: { type: 'interval', encodings: ['x'] } }],
    encoding: {
      x: { field: 't', type: 'quantitative', title: null, axis: { labels: false, ticks: false, domain: false } },
      y: { field: 'value', type: 'quantitative', title: null, axis: { tickCount: 3, labelFontSize: 9 } },
    },
  }

  const details = params.map((param, i) => {
    const def = PARAMS[param]
    const test = thresholdTest(param)
    const last = i === params.length - 1
    const layer: Record<string, unknown>[] = [
      { mark: { type: 'line', color: '#1f4e79', strokeWidth: 1.3 } },
      {
        mark: { type: 'point', filled: true, size: 16 },
        encoding: {
          color: test
            ? { condition: { test, value: '#c0392b' }, value: '#1f4e79' }
            : { value: '#1f4e79' },
          tooltip: [
            { field: 't', type: 'quantitative', title: 'Tag', format: '.2f' },
            { field: 'value', type: 'quantitative', title: def?.label ?? param, format: '.1f' },
          ],
        },
      },
      ...thresholdLayers(param),
    ]
    return {
      width,
      height: 92,
      title: { text: def ? `${def.label} (${def.unit})` : param, anchor: 'start', fontSize: 11 },
      transform: [{ filter: `datum.param === '${param}'` }],
      layer,
      encoding: {
        x: {
          field: 't',
          type: 'quantitative',
          title: last ? 'Tag seit Aufnahme' : null,
          axis: last ? { labelFontSize: 10 } : { labels: false, ticks: false },
          scale: { domain: { param: 'brush' } },
        },
        y: { field: 'value', type: 'quantitative', title: null, axis: { tickCount: 4, labelFontSize: 9 } },
      },
    }
  })

  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: points },
    spacing: 6,
    vconcat: [overview, ...details],
    config: { view: { stroke: null }, axis: { titleFontSize: 11 } },
  }
  return spec as unknown as VisualizationSpec
}

interface Props {
  caseId: number
  params: string[]
}

export function VitalsPanel({ caseId, params }: Props) {
  const { ref, width } = useChartWidth()
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
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Verlauf — Übersicht &amp; Small Multiples
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Zeitfenster oben aufziehen — alle Diagramme zoomen mit.
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
            <Typography variant="body2">Lade Verläufe…</Typography>
          </Box>
        )}
        {points && points.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
            Keine Messwerte für die gewählten Parameter.
          </Typography>
        )}
        {points && points.length > 0 && (
          <VegaEmbed spec={buildSpec(points, width, params)} options={{ actions: false }} />
        )}
      </div>
    </Paper>
  )
}
