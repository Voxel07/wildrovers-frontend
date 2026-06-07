import React from 'react';

// Mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import GavelIcon from '@mui/icons-material/Gavel';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const generalRules = [
  {
    title: 'Mindestalter',
    text: '18 Jahre. Diese Grenze ist so gesetzt, da es für uns einfach vieles einfacher macht. Zudem sind die meisten Großevents erst ab 18 Jahren zugänglich.'
  },
  {
    title: 'Teamtarn',
    text: 'Atacs-FG. Bei uns gibt es keine strikte Kleider- oder Ausrüstungsordnung. Grob gesagt, kann jeder spielen wie er möchte (Schutzbrille ausgenommen). Wenn wir als Gruppe bei größeren Events unterwegs sind, ist es gewünscht, dass alle im Teamtarn auftreten. Auf kleineren Events oder frei organisierten Spielen ist es jedem freigestellt, was er anzieht.'
  },
  {
    title: 'Spielstil',
    text: 'Hauptsächlich sind wir auf von uns oder Freunden organisierten Spielen unterwegs, egal ob in Frankreich, Tschechien oder Österreich. Diese Spiele gehen dann meistens in Richtung Speedsoft. Wir sind aber auch sehr gerne auf großen Events wie der Beerzone oder Borderwar unterwegs. Dort fügen wir uns den örtlichen Gegebenheiten und arbeiten strategisch in großen Gruppen. Auch die Events der Airsofthelden besuchen wir regelmäßig (Miliz auf der DE oder Tschernobyl).'
  },
  {
    title: 'Mitgliedsbeitrag',
    text: 'Die Mitgliedschaft kostet bei uns 40 Euro pro Jahr. Dieser Betrag wird unter anderem für das Hosten der Webseite benutzt. Außerdem werden gemeinsame Feste und Investitionen aus der Teamkasse bezahlt.'
  }
];

const bylaws = [
  {
    section: '§1 Name des Teams',
    content: 'Das Team führt den Namen "Wild Rovers Württemberg".'
  },
  {
    section: '§2 Zweck, Aufgabe',
    content: (
      <Box component="div">
        <Typography variant="body2" sx={{ mb: 2 }}>
          Das Team bezweckt das Ausüben des Softairsports in Deutschland auf gesichertem Gelände / Gebiet und/oder anderen Ländern.
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Der Zweck wird insbesondere verwirklicht durch die Errichtung eines Geländes zur Ausübung des taktischen Sports für Übungen und taktische Wettkämpfe. Das Team gibt allen deutschen und ausländischen Softairspielern die Möglichkeit, sich zu treffen und den Softairsport legal auszuüben.
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Das Team ist selbstlos tätig; es verfolgt nicht in erster Linie eigenwirtschaftliche Zwecke. Mittel des Teams dürfen nur für satzungsmäßige Zwecke verwendet werden.
        </Typography>
      </Box>
    )
  },
  {
    section: '§3 Erwerb der Mitgliedschaft',
    content: 'Mitglied des Teams kann grundsätzlich jede natürliche Person werden, die das 18. Lebensjahr vollendet hat. Voraussetzung für den Erwerb der Mitgliedschaft ist eine Anwärterschaft (im Folgenden "Frischling" genannt). Der Vorstand entscheidet über die Aufnahme. Die Anwärterschaft dauert in der Regel vier Spiele im Beisein von mindestens einem Vorstandsmitglied.'
  },
  {
    section: '§4 Beendigung der Mitgliedschaft',
    content: 'Die Mitgliedschaft endet durch Tod, Ausschluss oder durch Austritt aus dem Team. Der Austritt erfolgt durch schriftliche Erklärung gegenüber dem Vorstand. Kündigungsfristen gibt es keine, sofern alle dem Mitglied übertragenen Aufgaben erledigt sind.'
  },
  {
    section: '§5 Aufnahmebeitrag, Mitgliedsbeitrag, Umlagen',
    content: 'Von den Mitgliedern werden Jahresbeiträge (aktuell 40 Euro) erhoben. Zur Finanzierung besonderer Vorhaben können Umlagen erhoben werden. Die traditionelle Aufnahmegebühr beträgt einen Kasten Bier.'
  },
  {
    section: '§6 Rechte und Pflichten der Mitglieder',
    content: 'Die Mitglieder sind berechtigt, die Einrichtungen und Anlagen des Teams zu benutzen und an den Veranstaltungen teilzunehmen. Sie verpflichten sich zur Einhaltung der Ordnungsvorschriften und zur Förderung des gemeinsamen Vereinszwecks.'
  },
  {
    section: '§7 Organe des Teams',
    content: 'Organe des Teams sind die Mitgliederversammlung und der Vorstand.'
  },
  {
    section: '§8 Mitgliederversammlung',
    content: 'In der Mitgliederversammlung hat jedes volljährige Mitglied eine Stimme. Stimmrechte sind nicht übertragbar. Die Versammlung entscheidet über Entlastung, Vorstandswahl, Satzungsänderungen und Mitgliedsbeiträge.'
  },
  {
    section: '§9 Einberufung der Mitgliederversammlung',
    content: 'Die Mitgliederversammlung wird vom Vorstand über das Forum der Internetpräsenz einberufen. Die Tagesordnung setzt der Vorstand fest.'
  },
  {
    section: '§10 Beschlussfassung der Mitgliederversammlung',
    content: 'Die Mitgliederversammlung fasst Beschlüsse mit einfacher Mehrheit der abgegebenen gültigen Stimmen. Zur Änderung des Regelwerks ist eine Mehrheit von 2/3 der abgegebenen gültigen Stimmen erforderlich.'
  },
  {
    section: '§11 Vorstände',
    content: 'Das Team hat drei gleichberechtigte Vorstände, von denen einer die Teamkasse verwaltet und ein Weiterer die Schrift führt.'
  },
  {
    section: '§12 Zuständigkeit des Vorstandes',
    content: 'Der Vorstand führt die Geschäfte des Vereins und führt Beschlüsse der Mitgliederversammlung aus.'
  },
  {
    section: '§13 Wahl und Amtsdauer des Vorstands',
    content: 'Der Vorstand wird von der Mitgliederversammlung für die Dauer von zwei Jahren gewählt. Er bleibt bis zur Neuwahl im Amt.'
  },
  {
    section: '§14 Auflösung des Teams',
    content: 'Die Auflösung des Teams tritt erst dann ein, wenn kein einziges Mitglied mehr bereit ist, den Namen des Teams weiter zu repräsentieren.'
  },
  {
    section: '§15 Neutralität',
    content: 'Das Team als solches ist politisch neutral und betreibt diesbezüglich keinerlei Aktivitäten.'
  },
  {
    section: '§16 Haftungsausschluss',
    content: 'Die Wild Rovers übernehmen keinerlei Haftung im Falle von Beschädigungen oder Verletzungen von Personen oder Sachgegenständen im Rahmen des Spielbetriebs.'
  },
  {
    section: '§17 Einhaltung der Satzung und der Spielregeln',
    content: 'Jedes Mitglied und jeder Gastspieler hat sich an die Satzung sowie die Spielregeln auf den Spielfeldern zu halten.'
  },
  {
    section: '§18 Beschluss und Inkrafttretung',
    content: 'Dieses Regelwerk wurde am 14.12.2013 beschlossen und trat am 01.01.2014 in Kraft. Am 23.07.2019 wurde es überarbeitet und auf den aktuellen Teamnamen angepasst.'
  }
];

export default function Rules() {


  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8, px: { xs: 1, md: 3 } }}>

      {/* Header Info */}
      <Stack direction="row" sx={{ spacing: 1.5, alignItems: "center", mb: 3 }}>
        <LibraryBooksIcon color="primary" sx={{ fontSize: '2.5rem' }} />
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Regeln & Satzung
        </Typography>
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
        Hier findest du alle grundlegenden Vereinbarungen, Mitgliedskonditionen und das offizielle Regelwerk der Wild Rovers Württemberg.
      </Typography>

      {/* General Rules (Card Grid) */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Allgemeine Infos
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {generalRules.map((rule) => (
          <Grid size={{ xs: 12, sm: 6 }} key={rule.title}>
            <Card sx={{ height: '100%', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <CardContent>
                <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {rule.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {rule.text}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Bylaws (Accordions) */}
      <Stack direction="row" sx={{ spacing: 1.5, alignItems: "center", mb: 3 }}>
        <GavelIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Das Regelwerk
        </Typography>
      </Stack>

      <Box sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        {bylaws.map((item, idx) => (
          <Accordion
            key={item.section}
            disableGutters
            sx={{
              boxShadow: 'none',
              '&:before': {
                display: 'none',
              },
              border: 'none',
              borderBottom: idx < bylaws.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              borderRadius: 0,
              '&.Mui-expanded': {
                margin: 0,
              },
              ...(idx === 0 && {
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                '&.Mui-expanded': {
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                },
              }),
              ...(idx === bylaws.length - 1 && {
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px',
                '&.Mui-expanded': {
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                },
              }),
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`rules-panel-${idx}-content`}
              id={`rules-panel-${idx}-header`}
              sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>{item.section}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'rgba(0,0,0,0.1)', px: 3, py: 2 }}>
              {typeof item.content === 'string' ? (
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                  {item.content}
                </Typography>
              ) : (
                item.content
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

    </Container>
  );
}
