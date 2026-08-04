import { useEffect, useState } from 'react'
import { Autocomplete, Stack, TextField, Typography } from '@mui/material'

import { fetchAvailableLabs, fetchLabs, type LabPoint } from '../api'
import { useLanguage } from '../i18n'
import { SeriesChart } from './SeriesChart'

interface Props {
  caseId: number
}

// Laborverlaeufe mit frei waehlbaren Analyten. Anders als bei den Vitalwerten
// ist die Auswahl patientenabhaengig, da nicht bei jedem Fall dieselben der
// 419 Analyten bestimmt wurden.
export function LabsPanel({ caseId }: Props) {
  const { t } = useLanguage()
  const [available, setAvailable] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [points, setPoints] = useState<LabPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // active verhindert spaet eintreffende Antwort eines zuvor gewaehlten Patienten
    let active = true
    setPoints(null)
    setError(null)
    Promise.all([fetchAvailableLabs(caseId), fetchLabs(caseId)])
      .then(([avail, labs]) => {
        if (!active) return
        setAvailable(avail)
        // meldet zurueck, welche voreingestellten Analyten tatsaechlich Werte hatten.
        setSelected(labs.analytes)
        setPoints(labs.points)
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      active = false
    }
  }, [caseId])

  const changeSelected = (next: string[]) => {
    setSelected(next)
    setPoints(null)
    fetchLabs(caseId, next)
      .then((labs) => setPoints(labs.points))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
  }

  // Einheit je Analyt Sie beschriftet spaeter die y-Achse.
  const unitOf: Record<string, string> = {}
  for (const p of points ?? []) {
    if (p.unit) unitOf[p.analyte] = p.unit
  }

  return (
    <Stack spacing={2}>
      <Typography variant="overline" color="text.secondary">
        {t('labs.title')}
      </Typography>
      <Autocomplete
        multiple
        size="small"
        options={available}
        value={selected}
        onChange={(_, value) => changeSelected(value)}
        renderInput={(params) => (
          <TextField {...params} label={t('labs.analytes')} placeholder={t('labs.addAnalyte')} />
        )}
        limitTags={6}
      />
      {selected.map((analyte) => {
        const series = points
          ? points.filter((p) => p.analyte === analyte).map((p) => ({ t: p.t, value: p.value }))
          : null
        return (
          <SeriesChart
            key={analyte}
            title={unitOf[analyte] ? `${analyte} (${unitOf[analyte]})` : analyte}
            valueLabel={analyte}
            unit={unitOf[analyte]}
            points={series}
            error={error}
          />
        )
      })}
    </Stack>
  )
}
