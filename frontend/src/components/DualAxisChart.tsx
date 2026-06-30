import { useEffect, useState } from 'react'
import { Box, CircularProgress, Paper, Typography } from '@mui/material'
import { VegaEmbed } from 'react-vega'
import type { VisualizationSpec } from 'vega-embed'

import { fetchTimeseries, type TimeseriesPoint } from '../api'
import { THRESHOLDS } from '../constants'
import { useChartWidth } from '../useChartWidth'

function buildSpec(points: TimeseriesPoint[], width: number): VisualizationSpec {
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
          { field: 't', type: 'quantitative', title: 'Tag', format: '.2f' },
          { field: 'value', type: 'quantitative', title: 'ICP', format: '.1f' },
        ],
      },
    },
  ]
  if (icpHigh != null) {
    icpLayer.push({ mark: { type: 'rule', color: '#c0392b', strokeDash: [4, 4] }, encoding: { y: { datum: icpHigh } } })
  }

  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: points },
    width,
    height: 230,
    encoding: { x: { field: 't', type: 'quantitative', title: 'Tag seit Aufnahme' } },
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
            { field: 't', type: 'quantitative', title: 'Tag', format: '.2f' },
            { field: 'value', type: 'quantitative', title: 'MAP', format: '.1f' },
          ],
        },
      },
      {
        transform: [{ filter: "datum.param === 'ICP'" }],
        layer: icpLayer,
      },
    ],
    resolve: { scale: { y: 'independent' } },
    config: { view: { stroke: null }, axis: { labelFontSize: 10, titleFontSize: 11 } },
  }
  return spec as unknown as VisualizationSpec
}

interface Props {
  caseId: number
}

export function DualAxisChart({ caseId }: Props) {
  const { ref, width } = useChartWidth()
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

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        MAP &amp; ICP - Dual-Axis
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Zerebraler Perfusionsdruck (CPP = MAP − ICP)
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
            <Typography variant="body2">Lade MAP/ICP…</Typography>
          </Box>
        )}
        {points && points.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Keine MAP-/ICP-Daten für diesen Patienten.
          </Typography>
        )}
        {points && points.length > 0 && (
          <VegaEmbed spec={buildSpec(points, width)} options={{ actions: false }} />
        )}
      </div>
    </Paper>
  )
}
