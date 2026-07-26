import { Box, CircularProgress, Typography } from '@mui/material'
import { VegaEmbed } from 'react-vega'
import type { VisualizationSpec } from 'vega-embed'

import { useLanguage } from '../i18n'
import { ChartCard } from './ChartCard'

export interface SeriesPoint {
  t: number
  value: number | null
}

interface Threshold {
  high?: number
  low?: number
}

interface Props {
  title: string
  caption?: string
  unit?: string | null
  valueLabel: string
  threshold?: Threshold
  points: SeriesPoint[] | null
  error?: string | null
}

function buildSpec(
  points: SeriesPoint[],
  width: number,
  expanded: boolean,
  unit: string | null | undefined,
  valueLabel: string,
  threshold: Threshold | undefined,
  dayLabel: string,
  xTitle: string,
): VisualizationSpec {
  const tests: string[] = []
  if (threshold?.high != null) tests.push(`datum.value > ${threshold.high}`)
  if (threshold?.low != null) tests.push(`datum.value < ${threshold.low}`)
  const test = tests.join(' || ')

  const detailLayer: Record<string, unknown>[] = [
    { mark: { type: 'line', color: '#1f4e79', strokeWidth: 1.4 } },
    {
      mark: { type: 'point', filled: true, size: expanded ? 42 : 22 },
      encoding: {
        color: test
          ? { condition: { test, value: '#c0392b' }, value: '#1f4e79' }
          : { value: '#1f4e79' },
        tooltip: [
          { field: 't', type: 'quantitative', title: dayLabel, format: '.2f' },
          { field: 'value', type: 'quantitative', title: valueLabel, format: '.2f' },
        ],
      },
    },
  ]
  if (threshold?.high != null) {
    detailLayer.push({ mark: { type: 'rule', color: '#c0392b', strokeDash: [4, 4] }, encoding: { y: { datum: threshold.high } } })
  }
  if (threshold?.low != null) {
    detailLayer.push({ mark: { type: 'rule', color: '#c0392b', strokeDash: [4, 4] }, encoding: { y: { datum: threshold.low } } })
  }

  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: points },
    spacing: 4,
    vconcat: [
      {
        width,
        height: expanded ? 56 : 32,
        mark: { type: 'line', color: '#7a98b8' },
        params: [{ name: 'brush', select: { type: 'interval', encodings: ['x'] } }],
        encoding: {
          x: { field: 't', type: 'quantitative', title: null, axis: { labels: false, ticks: false, domain: false } },
          y: { field: 'value', type: 'quantitative', title: null, axis: { tickCount: 2, labelFontSize: 9 } },
        },
      },
      {
        width,
        height: expanded ? 430 : 160,
        layer: detailLayer,
        encoding: {
          x: {
            field: 't',
            type: 'quantitative',
            title: xTitle,
            scale: { domain: { param: 'brush' } },
          },
          y: { field: 'value', type: 'quantitative', title: unit ?? null, axis: { labelFontSize: 10 } },
        },
      },
    ],
    config: { view: { stroke: null }, axis: { titleFontSize: 11 } },
  }
  return spec as unknown as VisualizationSpec
}

export function SeriesChart({ title, caption, unit, valueLabel, threshold, points, error }: Props) {
  const { t } = useLanguage()
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 3 }}>
          <CircularProgress size={18} />
          <Typography variant="body2">{t('chart.loading')}</Typography>
        </Box>
      )
    }
    if (points.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          {t('chart.noData')}
        </Typography>
      )
    }
    return (
      <VegaEmbed
        spec={buildSpec(
          points,
          width,
          expanded,
          unit,
          valueLabel,
          threshold,
          t('chart.day'),
          t('chart.daySinceAdmission'),
        )}
        options={{ actions: false }}
      />
    )
  }

  return (
    <ChartCard title={title} caption={caption}>
      {render}
    </ChartCard>
  )
}
