import { useState } from 'react'
import { AppBar, Autocomplete, Box, Button, Chip, TextField, Toolbar, Typography } from '@mui/material'

import type { Patient } from '../api'
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

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexShrink: 0 }}>
          aSAB-Verlaufsdashboard
        </Typography>
        <Autocomplete
          size="small"
          sx={{ width: 300 }}
          options={patients}
          value={selected}
          onChange={(_, value) => onSelect(value)}
          getOptionLabel={(p) => `Fall ${p.caseId} · ${p.age ?? '–'} J. · ${p.sex ?? '–'}`}
          isOptionEqualToValue={(a, b) => a.caseId === b.caseId}
          renderInput={(params) => <TextField {...params} label="Patient auswählen" />}
        />
        <Box sx={{ flexGrow: 1 }} />
        {selected && (
          <Chip
            color="primary"
            variant="outlined"
            label={
              stayDays != null
                ? `Aufenthalt: Tag 0 – Tag ${Math.ceil(stayDays)}`
                : 'Aufenthalt: –'
            }
          />
        )}
        <Button variant="outlined" size="small" onClick={() => setUploadOpen(true)}>
          Daten laden
        </Button>
      </Toolbar>

      <DatasetUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onLoaded={onDatasetLoaded}
      />
    </AppBar>
  )
}
