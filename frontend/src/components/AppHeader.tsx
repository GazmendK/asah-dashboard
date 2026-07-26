import { useState } from 'react'
import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  Chip,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from '@mui/material'

import type { Patient } from '../api'
import { useLanguage } from '../i18n'
import { DatasetUploadDialog } from './DatasetUploadDialog'

interface Props {
  patients: Patient[]
  selected: Patient | null
  onSelect: (patient: Patient | null) => void
  stayDays: number | null
  onDatasetLoaded: () => void
}

export function AppHeader({ patients, selected, onSelect, stayDays, onDatasetLoaded }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const { lang, setLang, t } = useLanguage()

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexShrink: 0 }}>
          {t('app.title')}
        </Typography>
        <Autocomplete
          size="small"
          sx={{ width: 300 }}
          options={patients}
          value={selected}
          onChange={(_, value) => onSelect(value)}
          getOptionLabel={(p) =>
            `${t('header.case')} ${p.caseId} · ${p.age ?? '–'} ${t('header.years')} · ${p.sex ? t(`sex.${p.sex}`) : '–'}`
          }
          isOptionEqualToValue={(a, b) => a.caseId === b.caseId}
          renderInput={(params) => <TextField {...params} label={t('header.selectPatient')} />}
        />
        <Box sx={{ flexGrow: 1 }} />
        {selected && (
          <Chip
            color="primary"
            variant="outlined"
            label={
              stayDays != null
                ? t('header.stay', { days: Math.ceil(stayDays) })
                : t('header.stayNone')
            }
          />
        )}
        <Button variant="outlined" size="small" onClick={() => setUploadOpen(true)}>
          {t('header.loadData')}
        </Button>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={lang}
          onChange={(_, value) => value && setLang(value)}
          aria-label={t('header.language')}
        >
          <ToggleButton value="de" aria-label="Deutsch">
            DE
          </ToggleButton>
          <ToggleButton value="en" aria-label="English">
            EN
          </ToggleButton>
        </ToggleButtonGroup>
      </Toolbar>

      <DatasetUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onLoaded={onDatasetLoaded}
      />
    </AppBar>
  )
}
