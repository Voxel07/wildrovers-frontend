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
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// Eigene assets
import SchriftImage from '../../images/Schrift.webp';
import LogoHellImage from '../../images/Logo_hell_small.webp';
import TsatLogo from '../../images/TSAT_small.webp';
import LegionLogo from '../../images/Legion1_small.webp';
import RoversLogo from '../../images/WRW_small.webp';

function TeamCard({ primaryText, secondaryText, image, alt, highlighted }) {
  return (
    <Card sx={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      p: 2,
      background: highlighted
        ? 'linear-gradient(135deg, rgba(180, 195, 192, 0.08) 0%, rgba(180, 195, 192, 0.02) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      border: highlighted
        ? '1px solid rgba(180, 195, 192, 0.2)'
        : '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 3,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      ...(highlighted && {
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: 4,
          height: '100%',
          bgcolor: 'primary.main'
        }
      }),
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: highlighted
          ? '0 8px 24px rgba(180, 195, 192, 0.15)'
          : '0 8px 24px rgba(0, 0, 0, 0.4)',
        borderColor: 'primary.main',
      }
    }}>
      {image && (
        <Box sx={{
          width: 80,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 3,
          flexShrink: 0,
          bgcolor: 'rgba(0,0,0,0.2)',
          borderRadius: 2,
          p: 0.5,
          overflow: 'hidden'
        }}>
          <Box component="img" src={image} alt={alt || primaryText} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </Box>
      )}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: highlighted ? 'primary.main' : 'text.primary' }}>
          {primaryText}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {secondaryText}
        </Typography>
      </Box>
    </Card>
  );
}


export default function LandingPage() {
  const navigate = useNavigate();

  const handleGoToForum = () => {
    navigate('/Forum');
  };



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
          <Stack spacing={4} sx={{ alignItems: 'center' }}>
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
        <Grid container spacing={6} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h4" color="primary" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, textTransform: 'uppercase', fontWeight: 700 }}>
                Die Geschichte
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
                Das Team Wild Rovers Württemberg gibt es jetzt schon seit Mitte 2006 damals als TSAT – BW gegründet. Unter diesem Namen habt ihr uns bestimmt auch schonmal angetroffen. Nach einem Jahrzehnt Airsoft auf den verschiedensten Events und Spielfeldern hat sich das Team stark verändert. Auf der einen Seite ist das Team stark gewachsen und hat viele junge Mitglieder gewonnen. Auf der anderen Seite hat ein Großteil des Gründungsteams sich anderen Hobbys zugewendet. Um nicht in der Vergangenheit hängenzubleiben, wurde es Zeit, den alten Relikten Lebewohl zu sagen.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 4 }}>
                Ein neuer Name, ein neues Logo und eine Fusion mit unseren langjährigen Freunden und Partnerteam Legion Esslingen 1 später, waren die Wild Rovers geboren.
              </Typography>

              <Typography variant="h4" color="primary" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, textTransform: 'uppercase', fontWeight: 700, mt: 4 }}>
                Aktuelles
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
                Aktuell haben wir 12 Mitglieder und 1 Frischling (Anwärter). Wir kommen aus den unterschiedlichsten Ecken aus Deutschland. Der Hauptteil des Teams ist aber im Großraum Esslingen / Stuttgart zu finden. In den letzten Jahren haben wir viele neue junge Mitglieder dazugewonnen, dennoch ist von 18 bis 41 Jahren alles dabei.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
                Solltet ihr ein Team suchen oder ihr wollt uns näher kennenlernen, findet ihr alle weiteren Informationen unter dem Reiter Infos/Regeln.
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: { xs: 4, md: 0 } }}>
              <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '1px', alignSelf: 'flex-start' }}>
                Die Fusion der Teams
              </Typography>

              {/* Card 1: TSAT-BW */}
              <TeamCard
                primaryText="TSAT – BW"
                secondaryText="Gegründet Mitte 2006, legte den Grundstein unseres Teams."
                image={TsatLogo}
                alt="TSAT Logo"
              />

              {/* Connection 1 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5, color: 'primary.main' }}>
                <AddIcon fontSize="small" />
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, color: 'text.secondary' }}>
                  Fusioniert mit
                </Typography>
              </Box>

              {/* Card 2: Legion Esslingen 1 */}
              <TeamCard
                primaryText="Legion Esslingen 1"
                secondaryText="Langjähriger Partner und treuer Freund auf dem Spielfeld."
                image={LegionLogo}
                alt="Legion Esslingen 1 Logo"
              />

              {/* Connection 2 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5, color: 'primary.main' }}>
                <ArrowDownwardIcon fontSize="small" />
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, color: 'text.secondary' }}>
                  Entstanden daraus
                </Typography>
              </Box>

              {/* Card 3: Wild Rovers Württemberg */}
              <TeamCard
                primaryText="Wild Rovers Württemberg"
                secondaryText="Heute vereint unter einem neuen Namen, Logo und Spirit."
                image={RoversLogo}
                alt="Wild Rovers Württemberg Logo"
                highlighted
              />
            </Box>
          </Grid>
        </Grid>
      </Container>


      {/* Upcoming Events Section */}
      <Box sx={{ bgcolor: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" sx={{ fontWeight: 'bold', mb: 5, color: 'primary.main' }}>
            Anstehende Events
          </Typography>

          <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
            {events.length > 0 ? events.map((event) => (
              <Grid xs={12} md={4} key={event.id}>
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
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
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
              <Grid xs={12}>
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
              Ein paar Impressionen von unseren Spielen und Events aus den letzten Jahren.
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
        <Grid container spacing={4} sx={{ alignItems: 'center' }}>
          <Grid xs={12} md={6}>
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

          <Grid xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid xs={6}>
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
              <Grid xs={6}>
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
