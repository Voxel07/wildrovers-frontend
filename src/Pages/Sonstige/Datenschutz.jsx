import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';

const Datenschutz = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Datenschutzerklärung
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Stand: Juni 2026
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
            Diese Website erhebt und speichert derzeit keinerlei personenbezogene Daten.
            Es werden keine Cookies gesetzt und keine Analyse-Tools eingesetzt.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Zur Sicherstellung der technischen Stabilität setzen wir OpenTelemetry ein,
            um Abstürze und Fehlfunktionen der Anwendung zu erkennen. Dabei werden
            ausschließlich technische Metriken und Fehlerberichte erfasst — keine
            personenbezogenen Daten.
          </Typography>
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
