import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Slider,
  Stack,
  Typography,
} from '@mui/material'

import type { Patient } from '../api'
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
  patients?: Patient[]
  selected?: Patient | null
}

function passes(p: Patient, f: Filters, except?: keyof Filters): boolean {
  if (except !== 'ageRange' && p.age != null && (p.age < f.ageRange[0] || p.age > f.ageRange[1])) return false
  if (except !== 'fisher' && f.fisher.length && (p.fisher == null || !f.fisher.includes(p.fisher))) return false
  if (except !== 'mFisher' && f.mFisher.length && (p.mFisher == null || !f.mFisher.includes(p.mFisher))) return false
  if (except !== 'wfns' && f.wfns.length && (p.wfns == null || !f.wfns.includes(p.wfns))) return false
  if (except !== 'location' && f.location.length && (p.aneurysmLocation == null || !f.location.includes(p.aneurysmLocation)))
    return false
  return true
}

const CAT_FILTERS: {
  dim: keyof Filters
  title: string
  values: (string | number)[]
  get: (p: Patient) => string | number | null
}[] = [
  { dim: 'fisher', title: 'Fisher-Grad', values: FISHER_GRADES, get: (p) => p.fisher },
  { dim: 'mFisher', title: 'mFisher-Grad', values: MFISHER_GRADES, get: (p) => p.mFisher },
  { dim: 'wfns', title: 'WFNS', values: WFNS_CATEGORIES, get: (p) => p.wfns },
  { dim: 'location', title: 'Aneurysma-Lokalisation', values: LOCATIONS, get: (p) => p.aneurysmLocation },
]

function Bar({
  label,
  count,
  max,
  tone,
  marked,
  onClick,
}: {
  label: string
  count: number
  max: number
  tone: 'on' | 'off' | 'neutral'
  marked: boolean
  onClick?: () => void
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  const fill = tone === 'on' ? 'primary.main' : tone === 'neutral' ? 'primary.light' : 'action.disabled'
  return (
    <Box
      onClick={onClick}
      sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.3, cursor: onClick ? 'pointer' : 'default' }}
    >
      <Box sx={{ width: 74, fontSize: 12, fontWeight: marked ? 700 : 400, color: marked ? 'primary.main' : 'text.primary' }}>
        {label}
        {marked ? ' ◂' : ''}
      </Box>
      <Box sx={{ flexGrow: 1, height: 14, bgcolor: 'action.hover', borderRadius: 0.5 }}>
        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: fill, borderRadius: 0.5 }} />
      </Box>
      <Box sx={{ width: 30, textAlign: 'right', fontSize: 11, color: 'text.secondary' }}>{count}</Box>
    </Box>
  )
}

export function FilterPanel({ filters, onFilters, ageBounds, selectedParams, onParams, patients = [], selected = null }: Props) {
  const toggleParam = (key: string) => {
    onParams(
      selectedParams.includes(key)
        ? selectedParams.filter((k) => k !== key)
        : [...selectedParams, key],
    )
  }

  const reset = () =>
    onFilters({ ageRange: ageBounds, fisher: [], mFisher: [], wfns: [], location: [] })

  const filtersActive =
    filters.fisher.length > 0 ||
    filters.mFisher.length > 0 ||
    filters.wfns.length > 0 ||
    filters.location.length > 0 ||
    filters.ageRange[0] !== ageBounds[0] ||
    filters.ageRange[1] !== ageBounds[1]

  const ageDecades: { label: string; lo: number; hi: number }[] = []
  for (let d = Math.floor(ageBounds[0] / 10) * 10; d <= ageBounds[1]; d += 10) {
    ageDecades.push({ label: `${d}–${d + 9}`, lo: d, hi: d + 9 })
  }
  const ageSubset = patients.filter((p) => passes(p, filters, 'ageRange'))
  const ageCounts = ageDecades.map((d) => ageSubset.filter((p) => p.age != null && p.age >= d.lo && p.age <= d.hi).length)
  const ageMax = Math.max(1, ...ageCounts)

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="overline" color="text.secondary">
          Filter &amp; Auswahl
        </Typography>
        <Button size="small" onClick={reset} disabled={!filtersActive}>
          Zurücksetzen
        </Button>
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          Alter: {filters.ageRange[0]}–{filters.ageRange[1]}
        </Typography>
        <Box sx={{ mb: 1 }}>
          {ageDecades.map((d, i) => {
            const inRange = d.hi >= filters.ageRange[0] && d.lo <= filters.ageRange[1]
            const marked = selected?.age != null && selected.age >= d.lo && selected.age <= d.hi
            return (
              <Bar
                key={d.label}
                label={d.label}
                count={ageCounts[i]}
                max={ageMax}
                tone={inRange ? 'on' : 'off'}
                marked={!!marked}
              />
            )
          })}
        </Box>
        <Slider
          size="small"
          min={ageBounds[0]}
          max={ageBounds[1]}
          value={filters.ageRange}
          onChange={(_, value) => onFilters({ ...filters, ageRange: value as [number, number] })}
          valueLabelDisplay="auto"
        />
      </Box>

      {CAT_FILTERS.map((cf) => {
        const subset = patients.filter((p) => passes(p, filters, cf.dim))
        const counts = cf.values.map((v) => subset.filter((p) => cf.get(p) === v).length)
        const max = Math.max(1, ...counts)
        const sel = filters[cf.dim] as (string | number)[]
        return (
          <Box key={cf.dim}>
            <Typography variant="body2" gutterBottom>
              {cf.title}
            </Typography>
            {cf.values.map((v, i) => {
              const isSel = sel.includes(v)
              const tone: 'on' | 'off' | 'neutral' = sel.length === 0 ? 'neutral' : isSel ? 'on' : 'off'
              const marked = selected != null && cf.get(selected) === v
              const next = isSel ? sel.filter((x) => x !== v) : [...sel, v]
              return (
                <Bar
                  key={String(v)}
                  label={String(v)}
                  count={counts[i]}
                  max={max}
                  tone={tone}
                  marked={marked}
                  onClick={() => onFilters({ ...filters, [cf.dim]: next } as Filters)}
                />
              )
            })}
          </Box>
        )
      })}

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
