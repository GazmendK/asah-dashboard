import { Box, Paper, Typography } from '@mui/material'

interface Props {
  title: string
  height?: number
  note?: string
}

export function ChartPlaceholder({ title, height = 160, note }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.disabled',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Typography variant="body2">{note ?? 'Diagramm folgt in der nächsten Phase'}</Typography>
      </Box>
    </Paper>
  )
}
