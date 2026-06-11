import { AppBar, Autocomplete, Box, Chip, TextField, Toolbar, Typography } from '@mui/material'

import type { Patient } from '../api'

interface Props {
  patients: Patient[]
  selected: Patient | null
  onSelect: (patient: Patient | null) => void
  stayDays: number | null
}

export function AppHeader({ patients, selected, onSelect, stayDays }: Props) {
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
      </Toolbar>
    </AppBar>
  )
}
