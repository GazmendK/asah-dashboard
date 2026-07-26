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
import { useLanguage } from '../i18n'

interface Props {
  open: boolean
  onClose: () => void
  onLoaded: () => void
}

type Slot = 'clinical' | 'physiological' | 'laboratory' | 'complications' | 'outcome'

const SLOTS: { key: Slot; labelKey: string; required: boolean }[] = [
  { key: 'clinical', labelKey: 'upload.slot.clinical', required: true },
  { key: 'physiological', labelKey: 'upload.slot.physiological', required: false },
  { key: 'laboratory', labelKey: 'upload.slot.laboratory', required: false },
  { key: 'complications', labelKey: 'upload.slot.complications', required: false },
  { key: 'outcome', labelKey: 'upload.slot.outcome', required: false },
]

export function DatasetUploadDialog({ open, onClose, onLoaded }: Props) {
  const { t } = useLanguage()
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
      <DialogTitle>{t('upload.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{t('upload.intro')}</DialogContentText>
        <Stack spacing={1.5}>
          {SLOTS.map((slot) => (
            <Box key={slot.key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button component="label" variant="outlined" size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
                {t('upload.chooseFile')}
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={(e) => pick(slot.key, e.target.files?.[0] ?? null)}
                />
              </Button>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {t(slot.labelKey)}
                  {slot.required ? ' *' : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap component="div">
                  {files[slot.key]?.name ?? t('upload.noFile')}
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
            {t('upload.busy')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          {t('upload.cancel')}
        </Button>
        <Button onClick={submit} variant="contained" disabled={!files.clinical || busy}>
          {busy ? <CircularProgress size={20} /> : t('upload.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
