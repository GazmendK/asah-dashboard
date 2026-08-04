import { useState } from 'react'
import type { ReactNode } from 'react'
import { Box, Dialog, DialogContent, IconButton, Paper, Typography } from '@mui/material'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'

import { useChartWidth } from '../useChartWidth'
import { useLanguage } from '../i18n'

interface Props {
  title: string
  caption?: string
  // Kein fertiges Element, sondern eine Funktion. Nur so kann dieselbe Grafik
  // mit unterschiedlicher Breite fuer die eingebettete und die grosse Ansicht
  // erzeugt werden, denn Vega-Lite braucht die Breite bereits beim Aufbau.
  children: (width: number, expanded: boolean) => ReactNode
}

// Gemeinsamer Rahmen aller Diagramme
export function ChartCard({ title, caption, children }: Props) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  // Zwei getrennte Messungen, da eingebettete und vergroesserte Ansicht
  // gleichzeitig bestehen und unterschiedlich breit sind.
  const inline = useChartWidth()
  const dialog = useChartWidth()

  const header = (expanded: boolean) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        {caption && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {caption}
          </Typography>
        )}
      </Box>
      <IconButton
        size="small"
        onClick={() => setOpen(!expanded)}
        aria-label={expanded ? t('chart.shrink') : t('chart.enlarge')}
      >
        {expanded ? <CloseFullscreenIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
      </IconButton>
    </Box>
  )

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {header(false)}
      <div ref={inline.ref} style={{ width: '100%' }}>
        {children(inline.width, false)}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xl" fullWidth>
        <DialogContent>
          {header(true)}
          <div ref={dialog.ref} style={{ width: '100%' }}>
            {/* Nur bei geoeffnetem Dialog aufbauen, sonst entstuende die
                zweite Grafik unsichtbar im Hintergrund mit. */}
            {open && children(dialog.width, true)}
          </div>
        </DialogContent>
      </Dialog>
    </Paper>
  )
}
