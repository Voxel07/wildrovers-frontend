import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import {
  CONSENT_DENIED,
  CONSENT_GRANTED,
  getTelemetryConsent,
  isTelemetryConfigured,
  setTelemetryConsent,
} from '../../helper/telemetry';

function MonitoringChoice() {
  const [consent, setConsent] = React.useState(() => getTelemetryConsent());
  if (!isTelemetryConfigured()) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Auf dieser Installation ist die Analyse im Browser abgeschaltet.
      </Typography>
    );
  }
  const granted = consent === CONSENT_GRANTED;
  const change = (value) => {
    setConsent(value);
    setTelemetryConsent(value);
  };
  return (
    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Typography variant="body2">
        Aktueller Stand: <strong>{granted ? 'erlaubt' : consent === CONSENT_DENIED ? 'abgelehnt' : 'nicht entschieden'}</strong>
      </Typography>
      {granted ? (
        <Button variant="outlined" size="small" onClick={() => change(CONSENT_DENIED)}>
          Einwilligung widerrufen
        </Button>
      ) : (
        <Button variant="outlined" size="small" onClick={() => change(CONSENT_GRANTED)}>
          Analyse erlauben
        </Button>
      )}
    </Box>
  );
}

const Datenschutz = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Datenschutzerklärung
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Stand: November 2026
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ '& > *:not(:last-child)': { mb: 3 } }}>
        <section>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            1. Verantwortlicher
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Wild Rovers Western e.V.<br />
            [Vereinsadresse]<br />
            E-Mail: [Kontakt-E-Mail]
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            2. Allgemeines
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Diese Website
            dient ausschließlich der Vereinspräsentation und Vereinskommunikation.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            3. Datenerhebung &amp; Fehlerüberwachung
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Technisch notwendige Cookies:</strong> Nach dem Login speichert Ihr Browser
            zwei Sitzungs-Cookies (Zugangs- und Erneuerungstoken), ohne die das Benutzerkonto nicht
            funktioniert. Sie sind für Skripte nicht lesbar und werden beim Abmelden gelöscht.
            Ihre Entscheidung zur Fehler- und Nutzungsanalyse (siehe unten) wird im lokalen
            Speicher Ihres Browsers abgelegt.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Server-Protokolle:</strong> Zur Sicherstellung der technischen Stabilität
            erfasst der Server Fehlerberichte und technische Messwerte (OpenTelemetry). Beim Login
            speichern wir Zeitpunkt, IP-Adresse und daraus abgeleitetes Land, um Missbrauch des
            Kontos erkennen zu können.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Fehler- und Nutzungsanalyse im Browser (nur mit Einwilligung):</strong> Wenn
            Sie zustimmen, sendet Ihr Browser Fehlermeldungen, Ladezeiten, aufgerufene Seiten
            (ohne Parameter in der Adresse), Klicks sowie bei einem Teil der Besuche eine
            Sitzungsaufzeichnung an unsere selbst betriebene OpenObserve-Instanz. In den
            Aufzeichnungen sind alle Texte und Eingaben unkenntlich gemacht; Login, Registrierung,
            Passwort-Zurücksetzen, Profil und Verwaltung werden nie aufgezeichnet. Dabei werden
            Ihre IP-Adresse, eine zufällige Sitzungskennung und, wenn Sie angemeldet sind, Ihr
            Benutzername und Ihre Benutzer-ID verarbeitet. Rechtsgrundlage ist
            Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Die Daten werden
            nicht an Dritte weitergegeben. Sie können die Einwilligung jederzeit hier widerrufen:
          </Typography>
          <MonitoringChoice />
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            4. Registrierung &amp; Login
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bei der Registrierung werden die von Ihnen angegebenen Daten (Benutzername,
            E-Mail-Adresse) ausschließlich zur Bereitstellung des Benutzerkontos verwendet.
            Eine Weitergabe an Dritte erfolgt nicht. Mit der Löschung Ihres Kontos werden
            alle zugehörigen Daten vollständig entfernt.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            5. Hosting
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Diese Website wird bei der Hetzner Online GmbH (Industriestr. 25, 91710
            Gunzenhausen, Deutschland) gehostet. Die Server befinden sich in deutschen
            Rechenzentren und unterliegen der DSGVO.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            6. Ihre Rechte
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung und
            Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Bei Fragen
            zum Datenschutz können Sie sich jederzeit an uns wenden.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            7. Änderungen
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen.
            Die aktuelle Version ist stets auf dieser Seite abrufbar.
          </Typography>
        </section>
      </Box>
    </Container>
  );
};

export default Datenschutz;
