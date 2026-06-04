import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../helper/api';

// Mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import ForumIcon from '@mui/icons-material/Forum';
import InfoIcon from '@mui/icons-material/Info';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';

// Eigene assets
import SchriftImage from '../../images/Schrift.png';
import LogoHellImage from '../../images/Logo_hell.png';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGoToForum = () => {
    navigate('/Forum');
  };

  const milestones = [
    {
      year: '2013',
      title: 'Gründung des Teams',
      description: 'Gegründet am 14. Dezember 2013 im Herzen Württembergs. Gestartet als eine kleine Gruppe begeisterter Softairspieler mit dem Ziel, den Sport legal und mit maximalem Spaß auszuüben.'
    },
    {
      year: '2014',
      title: 'Erstes Regelwerk',
      description: 'Inkrafttreten des ersten offiziellen Regelwerks am 01. Januar 2014 zur Etablierung eines geordneten und sicheren Trainings- und Spielbetriebs.'
    },
    {
      year: '2019',
      title: 'Neuausrichtung & Name',
      description: 'Am 23. Juli 2019 wurde das Regelwerk grundlegend überarbeitet und der offizielle Teamname auf "Wild Rovers Württemberg" festgelegt, um unsere regionale Verbundenheit auszudrücken.'
    },
    {
      year: 'Heute',
      title: 'Aktive Gemeinschaft',
      description: 'Eine eingeschworene Truppe im Raum Stuttgart, Esslingen und Göppingen. Wir stehen für taktischen Anspruch, fairen Sportsgeist und starke freundschaftliche Kontakte in der deutschen Airsoft-Szene.'
    }
  ];

  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/event/upcoming')
      .then(res => {
        setEvents(res.data);
      })
      .catch(err => {
        console.error("Error fetching upcoming events", err);
      });
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("de-DE", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' Uhr';
    } catch (e) {
      return dateStr;
    }
  };

  const kioskUrl = import.meta.env.VITE_IMMICH_KIOSK_URL || "https://kiosk.wild-rovers.de";

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Hero Section with Glowing Radial CSS Background */}
      <Box sx={{
        position: 'relative',
        py: { xs: 8, md: 15 },
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(255, 152, 0, 0.12) 0%, rgba(18, 18, 18, 1) 70%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none'
        }
      }}>
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center">
            {/* Logo image if exists, fallback to typography */}
            <Box sx={{
              width: { xs: 150, md: 220 },
              height: { xs: 150, md: 220 },
              borderRadius: '50%',
              bgcolor: 'rgba(0,0,0,0.4)',
              p: 2,
              border: '2px solid rgba(255, 152, 0, 0.3)',
              boxShadow: '0 0 30px rgba(255, 152, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.5s ease',
              '&:hover': {
                transform: 'rotate(5deg) scale(1.05)',
                borderColor: 'primary.main',
                boxShadow: '0 0 40px rgba(255, 152, 0, 0.3)',
              }
            }}>
              <img
                src={LogoHellImage}
                alt="Wild Rovers Logo"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<span style="font-size: 3rem; color: #ff9800;">💀</span>';
                }}
              />
            </Box>

            <Box>
              <img
                src={SchriftImage}
                alt="Wild Rovers"
                style={{ maxWidth: '80%', height: 'auto', marginBottom: '8px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <Typography variant="h2" sx={{
                fontWeight: 900,
                letterSpacing: '.4rem',
                color: 'primary.main',
                fontSize: { xs: '2.2rem', md: '3.8rem' },
                textShadow: '0 0 20px rgba(255,152,0,0.2)',
                lineHeight: 1.2
              }}>
                WILD ROVERS
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{
                fontWeight: 500,
                letterSpacing: '.1rem',
                mt: 1,
                fontSize: { xs: '1rem', md: '1.4rem' }
              }}>
                What The Fuck Airsoftteam — Württemberg
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', fontSize: '1.1rem' }}>
              Airsoft ist für uns mehr als nur ein Hobby. Es ist die Leidenschaft für Taktik,
              starker Teamzusammenhalt und der perfekte Ausgleich zum stressigen Alltag.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' }, pt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ForumIcon />}
                onClick={handleGoToForum}
                sx={{ px: 4, py: 1.8, fontSize: '1.05rem' }}
              >
                Zum Teamforum
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                startIcon={<InfoIcon />}
                href="#chronik"
                sx={{ px: 4, py: 1.8, fontSize: '1.05rem', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Mehr über uns
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* History (Chronik) Section */}
      <Container id="chronik" maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" component="h2" align="center" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
          Unsere Geschichte
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 8, maxWidth: '600px', mx: 'auto' }}>
          Wie aus einer geteilten Leidenschaft ein festes Team gewachsen ist.
        </Typography>

        <Grid container spacing={4}>
          {milestones.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: 'primary.main',
                }
              }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: '900', color: 'primary.main', mb: 2 }}>
                    {item.year}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Upcoming Events Section */}
      <Box sx={{ bgcolor: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
            Anstehende Einsätze
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 8, maxWidth: '600px', mx: 'auto' }}>
            Die nächsten 3 geplanten Operationen und Trainings der Wild Rovers.
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {events.length > 0 ? events.map((event, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper sx={{
                  p: 3,
                  height: '100%',
                  border: '1px solid rgba(255,255,255,0.05)',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }
                }}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {event.title}
                      </Typography>
                    </Stack>
                    <Chip label={formatDate(event.eventDate)} color="primary" variant="outlined" size="small" sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {event.description}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    📍 {event.location}
                  </Typography>
                </Paper>
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Typography align="center" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Aktuell keine Events geplant.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Kiosk / Random Impressions */}
      {kioskUrl && (
        <Box sx={{ py: 10, bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <Container maxWidth="xl">
            <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
              Zufällige Impressionen
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}>
              Einblicke in unsere Einsätze und Trainings direkt aus unserem Immich-Archiv.
            </Typography>
            <Box sx={{
              height: '60vh',
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              bgcolor: 'rgba(0,0,0,0.2)'
            }}>
              <iframe
                src={kioskUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Immich Kiosk Random Viewer"
              />
            </Box>
          </Container>
        </Box>
      )}

      {/* Partners & Shops Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
              Partner & Shops
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
              Wir arbeiten eng mit führenden Köpfen der deutschen Airsoft-Szene zusammen und unterstützen
              große Veranstalter. Außerdem bieten wir Team-Mitgliedern exklusive Kleidung über unseren Partnershop an.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<ShoppingBagIcon />}
              href="https://airsoft-helden.de"
              target="_blank"
              sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
            >
              Zum Partnershop
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<HandshakeIcon />}
              href="https://www.airsoft-verzeichnis.de"
              target="_blank"
              sx={{ borderColor: 'rgba(255,255,255,0.2)' }}
            >
              ASVZ Profil
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': { borderColor: 'secondary.main' }
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'secondary.main' }}>
                    Airsoft Helden
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hauptpartner für Großevents und Support bei Mahlwinkel-Veranstaltungen.
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': { borderColor: 'primary.main' }
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                    ASVZ
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Das offizielle deutsche Airsoftverzeichnis zur Teamvernetzung.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
