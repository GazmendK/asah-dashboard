import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'

import {
  FISHER_GRADES,
  LOCATIONS,
  MFISHER_GRADES,
  VITAL_PARAMS,
  WFNS_CATEGORIES,
} from '../constants'
import type { Filters } from '../types'

interface Props {
  filters: Filters
  onFilters: (filters: Filters) => void
  ageBounds: [number, number]
  selectedParams: string[]
  onParams: (keys: string[]) => void
}

export function FilterPanel({ filters, onFilters, ageBounds, selectedParams, onParams }: Props) {
  const toggleParam = (key: string) => {
    onParams(
      selectedParams.includes(key)
        ? selectedParams.filter((k) => k !== key)
        : [...selectedParams, key],
    )
  }

  return (
    <Stack spacing={2.5}>
      <Typography variant="overline" color="text.secondary">
        Filter &amp; Auswahl
      </Typography>

      <Box>
        <Typography variant="body2" gutterBottom>
          Alter: {filters.ageRange[0]}–{filters.ageRange[1]}
        </Typography>
        <Slider
          size="small"
          min={ageBounds[0]}
          max={ageBounds[1]}
          value={filters.ageRange}
          onChange={(_, value) => onFilters({ ...filters, ageRange: value as [number, number] })}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          Fisher-Grad
        </Typography>
        <ToggleButtonGroup
          size="small"
          color="primary"
          value={filters.fisher}
          onChange={(_, value) => onFilters({ ...filters, fisher: value as number[] })}
        >
          {FISHER_GRADES.map((grade) => (
            <ToggleButton key={grade} value={grade}>
              {grade}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          mFisher-Grad
        </Typography>
        <ToggleButtonGroup
          size="small"
          color="primary"
          value={filters.mFisher}
          onChange={(_, value) => onFilters({ ...filters, mFisher: value as number[] })}
        >
          {MFISHER_GRADES.map((grade) => (
            <ToggleButton key={grade} value={grade}>
              {grade}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          WFNS
        </Typography>
        <ToggleButtonGroup
          size="small"
          color="primary"
          value={filters.wfns}
          onChange={(_, value) => onFilters({ ...filters, wfns: value as string[] })}
        >
          {WFNS_CATEGORIES.map((cat) => (
            <ToggleButton key={cat} value={cat}>
              {cat}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          Aneurysma-Lokalisation
        </Typography>
        <ToggleButtonGroup
          size="small"
          color="primary"
          value={filters.location}
          onChange={(_, value) => onFilters({ ...filters, location: value as string[] })}
        >
          {LOCATIONS.map((loc) => (
            <ToggleButton key={loc} value={loc}>
              {loc}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Divider />

      <Typography variant="overline" color="text.secondary">
        Parameter anzeigen
      </Typography>
      <FormGroup>
        {VITAL_PARAMS.map((param) => (
          <FormControlLabel
            key={param.key}
            control={
              <Checkbox
                size="small"
                checked={selectedParams.includes(param.key)}
                onChange={() => toggleParam(param.key)}
              />
            }
            label={<Typography variant="body2">{param.label}</Typography>}
          />
        ))}
      </FormGroup>
    </Stack>
  )
}
