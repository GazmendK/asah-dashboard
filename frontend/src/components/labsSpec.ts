import type { VisualizationSpec } from 'vega-embed'

import type { LabPoint } from '../api'

export function buildLabsSpec(points: LabPoint[], width: number, analytes: string[]): VisualizationSpec {
  const unitOf: Record<string, string> = {}
  points.forEach((p) => {
    if (p.unit) unitOf[p.analyte] = p.unit
  })
  const present = analytes.filter((a) => points.some((p) => p.analyte === a))

  const charts = present.map((analyte, i) => {
    const last = i === present.length - 1
    return {
      width,
      height: 78,
      title: { text: unitOf[analyte] ? `${analyte} (${unitOf[analyte]})` : analyte, anchor: 'start', fontSize: 11 },
      transform: [{ filter: `datum.analyte === ${JSON.stringify(analyte)}` }],
      layer: [
        { mark: { type: 'line', color: '#9aa7b4', strokeWidth: 1, opacity: 0.6 } },
        {
          mark: { type: 'point', filled: true, size: 26, color: '#1f4e79' },
          encoding: {
            tooltip: [
              { field: 't', type: 'quantitative', title: 'Tag', format: '.2f' },
              { field: 'value', type: 'quantitative', title: analyte, format: '.2f' },
            ],
          },
        },
      ],
      encoding: {
        x: {
          field: 't',
          type: 'quantitative',
          title: last ? 'Tag seit Aufnahme' : null,
          axis: last ? { labelFontSize: 10 } : { labels: false, ticks: false },
        },
        y: { field: 'value', type: 'quantitative', title: null, axis: { tickCount: 4, labelFontSize: 9 } },
      },
    }
  })

  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: points },
    spacing: 6,
    vconcat: charts,
    config: { view: { stroke: null }, axis: { titleFontSize: 11 } },
  }
  return spec as unknown as VisualizationSpec
}
