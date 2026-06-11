import { useEffect, useState } from 'react'
import {
  Alert,
  AppBar,
  Box,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material'

import { fetchPatients, type Patient } from './api'
import { theme } from './theme'

function App() {
  const [patients, setPatients] = useState<Patient[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients()
      .then(setPatients)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  const sample = patients?.[0]

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            aSAB-Verlaufsdashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bachelorarbeit · G. Kamberi
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        {error && (
          <Alert severity="error">
            Backend nicht erreichbar ({error}). Läuft die API auf Port 8000?
          </Alert>
        )}

        {!patients && !error && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={20} />
            <Typography>Lade Patienten…</Typography>
          </Box>
        )}

        {patients && (
          <Stack spacing={2}>
            <Alert severity="success">
              Backend verbunden — {patients.length} Patienten geladen.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Checkpoint Phase 0 + 1: FastAPI-API, Material UI und der Vega-Stack stehen.
              Beispiel-Patient aus der echten Datenbasis:
            </Typography>
            {sample && (
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Chip color="primary" label={`Fall ${sample.caseId}`} />
                <Chip variant="outlined" label={`${sample.age ?? '–'} J. · ${sample.sex ?? '–'}`} />
                <Chip variant="outlined" label={`${sample.intervention ?? '–'} · ${sample.aneurysmLocation ?? '–'}`} />
                <Chip variant="outlined" label={`Fisher ${sample.fisher ?? '–'} / mFisher ${sample.mFisher ?? '–'}`} />
                <Chip variant="outlined" label={`WFNS ${sample.wfns ?? '–'}`} />
                <Chip variant="outlined" label={`${sample.stayDays ?? '–'} Tage`} />
              </Stack>
            )}
          </Stack>
        )}
      </Container>
    </ThemeProvider>
  )
}

export default App
