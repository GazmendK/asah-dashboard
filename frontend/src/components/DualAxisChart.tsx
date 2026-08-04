import { useEffect, useState } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { VegaEmbed } from 'react-vega'
import type { VisualizationSpec } from 'vega-embed'

import { fetchTimeseries, type TimeseriesPoint } from '../api'
import { THRESHOLDS } from '../constants'
import { useLanguage } from '../i18n'
import { ChartCard } from './ChartCard'


function insertGapsMulti(points: TimeseriesPoint[]): TimeseriesPoint[] {
  const byParam = new Map<string, TimeseriesPoint[]>()
  for (const p of points) {
    const arr = byParam.get(p.param)
    if (arr) arr.push(p)
    else byParam.set(p.param, [p])
  }
  const out: TimeseriesPoint[] = []
  for (const arr of byParam.values()) {
    arr.sort((a, b) => a.t - b.t)
    const gaps: number[] = []
    for (let i = 1; i < arr.length; i++) gaps.push(arr[i].t - arr[i - 1].t)
    const sorted = [...gaps].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)] || 0
    const maxGap = Math.max(median * 3, 0.25)
    for (let i = 0; i < arr.length; i++) {
      out.push(arr[i])
      const next = arr[i + 1]
      if (next && next.t - arr[i].t > maxGap) out.push({ param: arr[i].param, t: (arr[i].t + next.t) / 2, value: null })
    }
  }
  return out
}

function buildSpec(
  points: TimeseriesPoint[],
  width: number,
  expanded: boolean,
  dayLabel: string,
  xTitle: string,
): VisualizationSpec {
  const icpHigh = THRESHOLDS.ICP?.high

  const icpLayer: Record<string, unknown>[] = [
    {
      mark: { type: 'line', color: '#b8860b', strokeWidth: 1.5 },
      encoding: {
        y: {
          field: 'value',
          type: 'quantitative',
          axis: { title: 'ICP (mmHg)', titleColor: '#b8860b', orient: 'right' },
        },
        tooltip: [
          { field: 't', type: 'quantitative', title: dayLabel, format: '.2f' },
          { field: 'value', type: 'quantitative', title: 'ICP', format: '.1f' },
        ],
      },
    },
  ]
  if (icpHigh != null) {
    icpLayer.push({ mark: { type: 'rule', color: '#c0392b', strokeDash: [4, 4] }, encoding: { y: { datum: icpHigh }, x: { aggregate: 'min', field: 't', type: 'quantitative' }, x2: { aggregate: 'max', field: 't' } } })
  }

  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: insertGapsMulti(points) },
    spacing: 4,
    vconcat: [
      {
        width,
        height: expanded ? 56 : 32,
        transform: [{ filter: "datum.param === 'BPMean'" }],
        mark: { type: 'line', color: '#7a98b8' },
        params: [{ name: 'brush', select: { type: 'interval', encodings: ['x'] } }],
        encoding: {
          x: { field: 't', type: 'quantitative', title: null, axis: { labels: false, ticks: false, domain: false } },
          y: { field: 'value', type: 'quantitative', title: null, axis: { tickCount: 2, labelFontSize: 9 } },
        },
      },
      {
        width,
        height: expanded ? 430 : 230,
        encoding: {
          x: {
            field: 't',
            type: 'quantitative',
            title: xTitle,
            scale: { domain: { param: 'brush' } },
          },
        },
        // MAP und ICP werden ueber je einen gefilterten Layer gezeichnet. Erst dadurch bekommt jede Groesse eine eigene y-Achse
        layer: [
          {
            transform: [{ filter: "datum.param === 'BPMean'" }],
            mark: { type: 'line', color: '#1f4e79', strokeWidth: 1.5 },
            encoding: {
              y: {
                field: 'value',
                type: 'quantitative',
                axis: { title: 'MAP (mmHg)', titleColor: '#1f4e79' },
              },
              tooltip: [
                { field: 't', type: 'quantitative', title: dayLabel, format: '.2f' },
                { field: 'value', type: 'quantitative', title: 'MAP', format: '.1f' },
              ],
            },
          },
          {
            transform: [{ filter: "datum.param === 'ICP'" }],
            layer: icpLayer,
          },
        ],
        // Getrennte y-Skalen Die x-Achse bleibt geteilt.
        resolve: { scale: { y: 'independent' } },
      },
    ],
    config: { view: { stroke: null }, axis: { labelFontSize: 10, titleFontSize: 11 } },
  }
  return spec as unknown as VisualizationSpec
}

interface Props {
  caseId: number
}

export function DualAxisChart({ caseId }: Props) {
  const { t } = useLanguage()
  const [points, setPoints] = useState<TimeseriesPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setPoints(null)
    setError(null)
    fetchTimeseries(caseId, ['BPMean', 'ICP'], 'hour')
      .then((r) => {
        if (active) setPoints(r.points)
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      active = false
    }
  }, [caseId])

  const render = (width: number, expanded: boolean) => {
    if (error) {
      return (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )
    }
    if (!points) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 4 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">{t('dual.loading')}</Typography>
        </Box>
      )
    }
    if (points.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          {t('dual.noData')}
        </Typography>
      )
    }
    return (
      <VegaEmbed
        spec={buildSpec(points, width, expanded, t('chart.day'), t('chart.daySinceAdmission'))}
        options={{ actions: false }}
      />
    )
  }

  return (
    <ChartCard title={t('dual.title')} caption={t('dual.caption')}>
      {render}
    </ChartCard>
  )
}
