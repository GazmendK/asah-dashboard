import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'

import { uploadDataset, type DatasetFiles } from '../api'

interface Props {
  open: boolean
  onClose: () => void
  onLoaded: () => void
}

type Slot = 'clinical' | 'physiological' | 'laboratory' | 'complications' | 'outcome'

const SLOTS: { key: Slot; label: string; required: boolean }[] = [
  { key: 'clinical', label: 'Klinische Daten (clinical)', required: true },
  { key: 'physiological', label: 'Physiologische Zeitreihen', required: false },
  { key: 'laboratory', label: 'Laborwerte', required: false },
  { key: 'complications', label: 'Komplikationen', required: false },
  { key: 'outcome', label: 'Outcome / Mortalität', required: false },
]

export function DatasetUploadDialog({ open, onClose, onLoaded }: Props) {
  const [files, setFiles] = useState<Record<Slot, File | null>>({
    clinical: null,
    physiological: null,
    laboratory: null,
    complications: null,
    outcome: null,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pick = (slot: Slot, file: File | null) => setFiles((f) => ({ ...f, [slot]: file }))

  const submit = () => {
    if (!files.clinical) return
    setBusy(true)
    setError(null)
    const payload: DatasetFiles = {
      clinical: files.clinical,
      physiological: files.physiological,
      laboratory: files.laboratory,
      complications: files.complications,
      outcome: files.outcome,
    }
    uploadDataset(payload)
      .then(() => {
        setBusy(false)
        onLoaded()
        onClose()
      })
      .catch((e: unknown) => {
        setBusy(false)
        setError(e instanceof Error ? e.message : String(e))
      })
  }

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Eigene Daten laden</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Lade die CSV-Dateien hoch. Die klinische Datei ist erforderlich, die übrigen sind optional.
          (keine dauerhafte Speicherung)
        </DialogContentText>
        <Stack spacing={1.5}>
          {SLOTS.map((slot) => (
            <Box key={slot.key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button component="label" variant="outlined" size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
                Datei wählen
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={(e) => pick(slot.key, e.target.files?.[0] ?? null)}
                />
              </Button>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {slot.label}
                  {slot.required ? ' *' : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap component="div">
                  {files[slot.key]?.name ?? 'keine Datei'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {busy && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Daten werden hochgeladen und aufbereitet. Das kann einen Moment dauern
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Abbrechen
        </Button>
        <Button onClick={submit} variant="contained" disabled={!files.clinical || busy}>
          {busy ? <CircularProgress size={20} /> : 'Hochladen'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
