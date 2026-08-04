import { createTheme } from '@mui/material/styles'
export const theme = createTheme({
  palette: {
    mode: 'light',
    // Gedaempftes Blau als Grundfarbe
    // kraeftiges Rot ausschliesslich fuer kritische Werte
    primary: { main: '#1f4e79' },
    warning: { main: '#c0392b' },
    background: { default: '#f7f8fa' },
  },
  typography: {
    fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
})
