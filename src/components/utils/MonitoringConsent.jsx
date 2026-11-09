import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Paper, Typography, Button, Stack, Link } from '@mui/material';
import {
  CONSENT_DENIED,
  CONSENT_GRANTED,
  getTelemetryConsent,
  isTelemetryConfigured,
  onTelemetryConsentChange,
  setTelemetryConsent,
} from '../../helper/telemetry';

/**
 * Asks once whether the site may collect error reports, performance data and masked session
 * recordings (OpenObserve). Nothing is sent before the visitor agrees.
 */
export default function MonitoringConsent() {
  const [choice, setChoice] = useState(() => getTelemetryConsent());

  useEffect(() => onTelemetryConsentChange(setChoice), []);

  if (!isTelemetryConfigured() || choice === CONSENT_GRANTED || choice === CONSENT_DENIED) {
    return null;
  }

  return (
    <Paper
      role="dialog"
      aria-live="polite"
      aria-label="Einwilligung zur Fehler- und Nutzungsanalyse"
      elevation={8}
      sx={{
        position: 'fixed',
        left: { xs: 8, sm: 24 },
        right: { xs: 8, sm: 'auto' },
        bottom: { xs: 8, sm: 24 },
        maxWidth: 480,
        p: 2.5,
        zIndex: (theme) => theme.zIndex.snackbar,
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Fehler- und Nutzungsanalyse
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Dürfen wir Fehlerberichte, Ladezeiten und anonymisierte Sitzungsaufzeichnungen
        (Texte und Eingaben unkenntlich) erfassen? Die Daten bleiben auf unserem eigenen Server.
        Details in der{' '}
        <Link component={RouterLink} to="/Datenschutz">Datenschutzerklärung</Link>.
      </Typography>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
        <Button variant="outlined" color="inherit" onClick={() => setTelemetryConsent(CONSENT_DENIED)}>
          Ablehnen
        </Button>
        <Button variant="contained" onClick={() => setTelemetryConsent(CONSENT_GRANTED)}>
          Erlauben
        </Button>
      </Stack>
    </Paper>
  );
}
