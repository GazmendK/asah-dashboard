import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import { Box, IconButton } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const PANEL_HEIGHT = 'calc(100vh - 64px)'

interface ResizerProps {
  side: 'left' | 'right'
  width: number
  onWidth: (w: number) => void
  min: number
  max: number
}

function Resizer({ side, width, onWidth, min, max }: ResizerProps) {
  const onMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = width
    const move = (ev: MouseEvent) => {
      const delta = ev.clientX - startX
      const next = side === 'left' ? startW + delta : startW - delta
      onWidth(Math.max(min, Math.min(max, next)))
    }
    const up = () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }
  return (
    <Box
      onMouseDown={onMouseDown}
      sx={{ width: '6px', flexShrink: 0, cursor: 'col-resize', height: PANEL_HEIGHT, '&:hover': { bgcolor: 'divider' } }}
    />
  )
}

interface Props {
  side: 'left' | 'right'
  collapsed: boolean
  onToggle: () => void
  width: number
  onWidth: (w: number) => void
  min?: number
  max?: number
  children: ReactNode
}

export function SidePanel({ side, collapsed, onToggle, width, onWidth, min = 200, max = 480, children }: Props) {
  const borderSide = side === 'left' ? { borderRight: 1 } : { borderLeft: 1 }

  if (collapsed) {
    return (
      <Box
        sx={{
          width: 36,
          flexShrink: 0,
          ...borderSide,
          borderColor: 'divider',
          height: PANEL_HEIGHT,
          display: 'flex',
          justifyContent: 'center',
          pt: 1,
        }}
      >
        <IconButton size="small" onClick={onToggle} aria-label="Ausklappen">
          {side === 'left' ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Box>
    )
  }

  const panel = (
    <Box
      component="aside"
      sx={{
        width,
        flexShrink: 0,
        p: 2,
        ...borderSide,
        borderColor: 'divider',
        height: PANEL_HEIGHT,
        overflowY: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: side === 'left' ? 'flex-end' : 'flex-start', mb: 1 }}>
        <IconButton size="small" onClick={onToggle} aria-label="Einklappen">
          {side === 'left' ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </IconButton>
      </Box>
      {children}
    </Box>
  )

  const resizer = <Resizer side={side} width={width} onWidth={onWidth} min={min} max={max} />

  return side === 'left' ? (
    <>
      {panel}
      {resizer}
    </>
  ) : (
    <>
      {resizer}
      {panel}
    </>
  )
}
