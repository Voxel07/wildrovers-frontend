import React, { useState } from 'react';

// Mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import GavelIcon from '@mui/icons-material/Gavel';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

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
    content: [
      'Das Team bezweckt das Ausüben des Softairsports in Deutschland auf gesichertem Gelände / Gebiet und/oder anderen Ländern.',
      'Der Zweck wird insbesondere verwirklicht durch die Errichtung eines Geländes zur Ausübung des taktischen Sports für Übungen und taktische Wettkämpfe. Das Team gibt allen deutschen und ausländischen Softairspielern die Möglichkeit, sich zu treffen und den Softairsport legal auszuüben.',
      'Das Team ist selbstlos tätig; es verfolgt nicht in erster Linie eigenwirtschaftliche Zwecke. Mittel des Teams dürfen nur für satzungsmäßige Zwecke verwendet werden.'
    ]
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

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, highlight) {
  if (!highlight || !highlight.trim()) {
    return text;
  }
  const escapedHighlight = escapeRegExp(highlight.trim());
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.trim().toLowerCase() ? (
          <Box
            component="span"
            key={i}
            sx={{
              backgroundColor: 'rgba(255, 152, 0, 0.25)',
              color: '#ffb74d',
              fontWeight: 'bold',
              borderRadius: '2px',
              px: 0.5,
            }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function Rules() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBylaws = bylaws.filter(item => {
    const sectionText = item.section.toLowerCase();
    const contentText = Array.isArray(item.content)
      ? item.content.join(' ').toLowerCase()
      : item.content.toLowerCase();
    const query = searchQuery.toLowerCase();
    return sectionText.includes(query) || contentText.includes(query);
  });

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8, px: { xs: 1, md: 3 } }}>

      {/* Header Info */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 3 }}>
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

      {/* Detailed Bylaws Section */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 3 }}>
        <GavelIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Das Regelwerk
        </Typography>
      </Stack>

      {/* Search Input */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Regelwerk durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchQuery('')} edge="end" size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 2,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            }
          }}
        />
      </Box>

      {/* Unified Bylaws Document */}
      <Paper sx={{
        p: { xs: 3, md: 5 },
        bgcolor: 'rgba(255,255,255,0.01)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        {filteredBylaws.length > 0 ? (
          filteredBylaws.map((item, idx) => (
            <Box key={item.section} sx={{ mb: idx < filteredBylaws.length - 1 ? 4 : 0 }}>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                {highlightText(item.section, searchQuery)}
              </Typography>
              
              {Array.isArray(item.content) ? (
                item.content.map((paragraph, pIdx) => (
                  <Typography key={pIdx} variant="body2" sx={{ mb: pIdx < item.content.length - 1 ? 1.5 : 0, lineHeight: 1.6, color: 'text.secondary' }}>
                    {highlightText(paragraph, searchQuery)}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                  {highlightText(item.content, searchQuery)}
                </Typography>
              )}

              {idx < filteredBylaws.length - 1 && <Divider sx={{ mt: 4, borderColor: 'rgba(255,255,255,0.05)' }} />}
            </Box>
          ))
        ) : (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Keine Absätze gefunden, die "{searchQuery}" entsprechen.
            </Typography>
          </Box>
        )}
      </Paper>

    </Container>
  );
}
