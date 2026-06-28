import { useEffect, useState } from 'react'
import { Autocomplete, Box, CircularProgress, Paper, TextField, Typography } from '@mui/material'
import { VegaEmbed } from 'react-vega'

import { fetchAvailableLabs, fetchLabs, type LabPoint } from '../api'
import { useChartWidth } from '../useChartWidth'
import { buildLabsSpec } from './labsSpec'

interface Props {
  caseId: number
}

export function LabsPanel({ caseId }: Props) {
  const { ref, width } = useChartWidth()
  const [available, setAvailable] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [points, setPoints] = useState<LabPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setPoints(null)
    setError(null)
    Promise.all([fetchAvailableLabs(caseId), fetchLabs(caseId)])
      .then(([avail, labs]) => {
        if (!active) return
        setAvailable(avail)
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

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Laborwerte
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Punktverlauf je Analyt · ohne Referenzband (Normwerte fehlen in den Daten)
      </Typography>
      <Autocomplete
        multiple
        size="small"
        options={available}
        value={selected}
        onChange={(_, value) => changeSelected(value)}
        renderInput={(params) => <TextField {...params} label="Analyte" placeholder="Analyt hinzufügen" />}
        limitTags={6}
        sx={{ mb: 2 }}
      />
      <div ref={ref} style={{ width: '100%' }}>
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        {!points && !error && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 4 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Lade Laborwerte…</Typography>
          </Box>
        )}
        {points && selected.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Keine Analyte ausgewählt.
          </Typography>
        )}
        {points && selected.length > 0 && points.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Keine Messwerte für die gewählten Analyte.
          </Typography>
        )}
        {points && selected.length > 0 && points.length > 0 && (
          <VegaEmbed spec={buildLabsSpec(points, width, selected)} options={{ actions: false }} />
        )}
      </div>
    </Paper>
  )
}
