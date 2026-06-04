import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../helper/api';
import { convertTimestamp } from '../../helper/converter';
import useAuth from '../../context/useAuth';

// Mui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Profile() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth || !auth.JWT) {
      navigate('/Login');
      return;
    }

    api.get('/user/me')
      .then(response => {
        setProfile(response.data);
      })
      .catch(err => {
        console.error("Error fetching user profile", err);
        setError("Fehler beim Laden des Profils. Bitte vergewissere dich, dass du eingeloggt bist.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [auth, navigate]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || "Profil konnte nicht geladen werden"}
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 3 }} variant="outlined">
          Zurück
        </Button>
      </Container>
    );
  }

  const roleColors = {
    "Admin": "error",
    "Vorstand": "warning",
    "Mitglied": "primary",
    "Frischling": "secondary",
    "Besucher": "default"
  };

  const initial = profile.userName ? profile.userName[0].toUpperCase() : 'U';

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8, px: { xs: 2, md: 3 } }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 4 }}
        variant="text"
      >
        Zurück
      </Button>

      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4, color: 'primary.main' }}>
        Mein Profil
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Card Left */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center', py: 4 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold',
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText',
                  mb: 2,
                  boxShadow: '0 0 20px rgba(255, 152, 0, 0.25)'
                }}
              >
                {initial}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {profile.userName}
              </Typography>
              <Chip 
                label={profile.role} 
                color={roleColors[profile.role] || "default"} 
                size="small" 
                sx={{ fontWeight: 'bold', px: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details Right */}
        <Grid item xs={12} md={8}>
          <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.08)', height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Benutzerinformationen
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PersonIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Vollständiger Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {profile.firstName} {profile.lastName}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <EmailIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        E-Mail-Adresse
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {profile.email}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CalendarMonthIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Mitglied seit
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {convertTimestamp(profile.regDate)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <ShieldIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Kontostatus
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', color: profile.isActive ? 'success.main' : 'error.main' }}>
                        {profile.isActive ? 'Aktiv' : 'Inaktiv'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
