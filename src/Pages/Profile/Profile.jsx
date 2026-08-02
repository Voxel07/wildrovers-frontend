import React, { useState, useEffect, useReducer, use } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { extractErrorMessage } from '../../helper/api';
import { convertTimestamp } from '../../helper/converter';
import useAuth from '../../context/useAuth';
import { AlertsContext } from '../../components/utils/AlertsManager';

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
import TextField from '@mui/material/TextField';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShieldIcon from '@mui/icons-material/Shield';
import BackButton from '../../components/Navigation/BackButton';
import ProfileActivitySummary from './ProfileActivitySummary';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ForumIcon from '@mui/icons-material/Forum';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GroupIcon from '@mui/icons-material/Group';
import Switch from '@mui/material/Switch';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WebhookIcon from '@mui/icons-material/Webhook';

const roleColors = {
  "Admin": "error",
  "Vorstand": "warning",
  "Mitglied": "primary",
  "Frischling": "secondary",
  "Besucher": "default"
};

const initialProfileState = {
  profile: null,
  loading: true,
  error: null,
};

const emptyNotificationPreferences = {
  resources: {
    EVENT: { email: false, webhook: false },
    FORUM: { email: false, webhook: false },
    GALLERY: { email: false, webhook: false },
    SIGNUP: { email: false, webhook: false }
  },
  webhook: { configured: false, enabled: false, urlMasked: '', verifiedAt: null, lastSuccessAt: null, lastError: null, failureCount: 0 }
};

function profileReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        profile: action.payload,
        error: null,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        profile: null,
      };
    case 'UPDATE_PHOTO':
      return {
        ...state,
        profile: { ...state.profile, photoUrl: action.payload }
      };
    case 'UPDATE_BACKGROUND':
      return {
        ...state,
        profile: { ...state.profile, backgroundUrl: action.payload }
      };
    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        profile: action.payload,
      };
    default:
      return state;
  }
}

export default function Profile() {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const alertsManagerRef = use(AlertsContext);
  const [state, dispatch] = useReducer(profileReducer, initialProfileState);
  const { profile, loading, error } = state;

  // Edit Mode state
  const [events, setEvents] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    phrase: '',
    birthday: '',
    firstName: '',
    lastName: '',
    email: '',
    userName: ''
  });
  const [saving, setSaving] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState(emptyNotificationPreferences);
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  const fetchProfile = (silent = false) => {
    if (!silent) {
      dispatch({ type: 'FETCH_START' });
    }
    api.get('/user/me')
      .then(response => {
        dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
        setEditData({
          phrase: response.data.phrase || '',
          birthday: response.data.birthday || '',
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          userName: response.data.userName || ''
        });
      })
      .catch(err => {
        console.error("Error fetching user profile", err);
        if (!silent) {
          dispatch({ type: 'FETCH_FAILURE', payload: "Fehler beim Laden des Profils. Bitte vergewissere dich, dass du eingeloggt bist." });
        }
      });
  };

  useEffect(() => {
    if (!auth || !auth.JWT) {
      navigate('/Login');
      return;
    }
    fetchProfile();
    api.get('/event')
      .then(res => {
        setEvents(res.data);
      })
      .catch(err => {
        console.error("Error fetching events for profile breakdown", err);
      });
    api.get('/user/me/notifications')
      .then(res => setNotificationPreferences(res.data))
      .catch(err => console.error("Error fetching notification preferences", err));
  }, [auth, navigate]);

  const toggleNotificationChannel = (resource, channel) => {
    setNotificationPreferences(current => ({
      ...current,
      resources: {
        ...current.resources,
        [resource]: { ...current.resources[resource], [channel]: !current.resources[resource][channel] }
      }
    }));
  };

  const saveNotificationPreferences = () => {
    setNotificationSaving(true);
    api.put('/user/me/notifications', {
      resources: notificationPreferences.resources,
      webhookUrl: webhookUrl.trim() || null
    }).then(res => {
      setNotificationPreferences(res.data);
      setWebhookUrl('');
      if (res.data.webhookSecret) setWebhookSecret(res.data.webhookSecret);
      alertsManagerRef.current.showAlert('success', 'Benachrichtigungseinstellungen gespeichert.');
    }).catch(err => {
      alertsManagerRef.current.showAlert('error', extractErrorMessage(err));
    }).finally(() => setNotificationSaving(false));
  };

  const testWebhook = () => {
    api.post('/user/me/notifications/webhook/test')
      .then(() => {
        alertsManagerRef.current.showAlert('success', 'Webhook erfolgreich getestet.');
        return api.get('/user/me/notifications');
      })
      .then(res => res && setNotificationPreferences(res.data))
      .catch(err => alertsManagerRef.current.showAlert('error', extractErrorMessage(err)));
  };

  const rotateWebhookSecret = () => {
    api.post('/user/me/notifications/webhook/rotate-secret')
      .then(res => {
        setWebhookSecret(res.data.webhookSecret);
        alertsManagerRef.current.showAlert('success', 'Webhook-Secret erneuert.');
      })
      .catch(err => alertsManagerRef.current.showAlert('error', extractErrorMessage(err)));
  };

  const removeWebhook = () => {
    api.delete('/user/me/notifications/webhook').then(() => {
      setNotificationPreferences(current => ({
        ...current,
        resources: Object.fromEntries(Object.entries(current.resources).map(([key, value]) => [key, { ...value, webhook: false }])),
        webhook: emptyNotificationPreferences.webhook
      }));
      setWebhookSecret('');
      setWebhookUrl('');
      alertsManagerRef.current.showAlert('success', 'Webhook entfernt.');
    }).catch(err => alertsManagerRef.current.showAlert('error', extractErrorMessage(err)));
  };

  const acknowledgeNews = () => {
    api.post('/user/me/notifications/acknowledge')
      .then(() => alertsManagerRef.current.showAlert('success', 'Neuigkeiten als gelesen markiert.'))
      .catch(err => alertsManagerRef.current.showAlert('error', extractErrorMessage(err)));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enforce 2MB size limit in frontend
    if (file.size > 2 * 1024 * 1024) {
      alertsManagerRef.current.showAlert('error', 'Das Bild darf maximal 2MB groß sein.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alertsManagerRef.current.showAlert('error', 'Bitte wähle eine gültige Bilddatei aus.');
      return;
    }

    // Compression and Resize using Canvas in frontend
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          const ratio = maxDim / Math.max(width, height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas image to Blob with quality reduction
        canvas.toBlob((blob) => {
          if (!blob) return;

          const uploadFormData = new FormData();
          uploadFormData.append('file', blob, 'avatar.jpg');

          api.post('/user/me/photo', uploadFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
            .then(res => {
              dispatch({ type: 'UPDATE_PHOTO', payload: res.data.photoUrl });
              alertsManagerRef.current.showAlert('success', 'Profilbild erfolgreich aktualisiert.');
            })
            .catch(err => {
              console.error("Error uploading avatar", err);
              alertsManagerRef.current.showAlert('error', 'Fehler beim Hochladen des Profilbilds.');
            });
        }, 'image/jpeg', 0.85); // Compress to JPEG with 85% quality
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alertsManagerRef.current.showAlert('error', 'Das Hintergrundbild darf maximal 5MB groß sein.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alertsManagerRef.current.showAlert('error', 'Bitte wähle eine gültige Bilddatei aus.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          const ratio = maxDim / Math.max(width, height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) return;

          const uploadFormData = new FormData();
          uploadFormData.append('file', blob, 'background.jpg');

          api.post('/user/me/background', uploadFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
            .then(res => {
              dispatch({ type: 'UPDATE_BACKGROUND', payload: res.data.backgroundUrl });
              alertsManagerRef.current.showAlert('success', 'Hintergrundbild erfolgreich aktualisiert.');
            })
            .catch(err => {
              console.error("Error uploading background", err);
              alertsManagerRef.current.showAlert('error', 'Fehler beim Hochladen des Hintergrundbilds.');
            });
        }, 'image/jpeg', 0.85);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = () => {
    api.delete('/user/me/background')
      .then(() => {
        dispatch({ type: 'UPDATE_BACKGROUND', payload: null });
        alertsManagerRef.current.showAlert('success', 'Hintergrundbild entfernt.');
      })
      .catch(err => {
        console.error("Error removing background", err);
        alertsManagerRef.current.showAlert('error', 'Fehler beim Entfernen des Hintergrundbilds.');
      });
  };

  const handleRemovePhoto = () => {
    api.delete('/user/me/photo')
      .then(() => {
        dispatch({ type: 'UPDATE_PHOTO', payload: null });
        alertsManagerRef.current.showAlert('success', 'Profilbild entfernt.');
      })
      .catch(err => {
        console.error("Error removing photo", err);
        alertsManagerRef.current.showAlert('error', 'Fehler beim Entfernen des Profilbilds.');
      });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    setSaving(true);
    const cleanedData = {
      ...editData,
      birthday: editData.birthday || null,
      phrase: editData.phrase || null
    };
    api.post('/user/me/profile', cleanedData)
      .then(res => {
        dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: res.data });
        if (res.data.userName && auth?.user !== res.data.userName) {
          setAuth(prev => ({ ...prev, user: res.data.userName }));
        }
        setEditMode(false);
        fetchProfile(true);
        alertsManagerRef.current.showAlert('success', 'Profil erfolgreich gespeichert.');
      })
      .catch(err => {
        console.error("Error updating profile", err);
        alertsManagerRef.current.showAlert('error', extractErrorMessage(err) || 'Profilaktualisierung fehlgeschlagen.');
      })
      .finally(() => {
        setSaving(false);
      });
  };

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
        <BackButton sx={{ mt: 3 }} variant="outlined" fallbackPath="/" />
      </Container>
    );
  }

  const initial = profile.userName ? profile.userName[0].toUpperCase() : 'U';
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const avatarUrl = profile.photoUrl ? apiBase + profile.photoUrl : null;
  const backgroundUrl = profile.backgroundUrl ? apiBase + profile.backgroundUrl : null;

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8, px: { xs: 2, md: 3 } }}>
      <BackButton
        sx={{ mb: 4 }}
        variant="text"
        fallbackPath="/"
      />

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Mein Profil
        </Typography>
        {!editMode ? (
          <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setEditMode(true)}>
            Bearbeiten
          </Button>
        ) : (
          <Stack direction="row" spacing={1.5}>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              color="primary"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              Speichern
            </Button>
            <Button
              startIcon={<CancelIcon />}
              variant="text"
              color="inherit"
              onClick={() => {
                setEditMode(false);
                setEditData({
                  phrase: profile.phrase || '',
                  birthday: profile.birthday || '',
                  firstName: profile.firstName || '',
                  lastName: profile.lastName || '',
                  email: profile.email || '',
                  userName: profile.userName || ''
                });
              }}
              disabled={saving}
            >
              Abbrechen
            </Button>
          </Stack>
        )}
      </Stack>

      <Grid container spacing={4}>
        {/* Profile Card Left */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={4}>
            <Card sx={{
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
              py: 4,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Background image */}
              {backgroundUrl && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    backgroundImage: `url(${backgroundUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.15,
                    zIndex: 0,
                  }}
                />
              )}
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <Avatar
                  src={avatarUrl}
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    mb: 2,
                    boxShadow: '0 0 20px rgba(255, 152, 0, 0.25)',
                    border: '2px solid rgba(255, 152, 0, 0.3)'
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
                  sx={{ fontWeight: 'bold', px: 1, mb: 3 }}
                />

                <Stack spacing={1} sx={{ width: '100%', px: 2 }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload">
                    <Button component="span" variant="outlined" size="small" fullWidth>
                      Profilbild ändern
                    </Button>
                  </label>

                  {profile.photoUrl && (
                    <Button
                      variant="text"
                      size="small"
                      color="error"
                      fullWidth
                      onClick={handleRemovePhoto}
                    >
                      Profilbild entfernen
                    </Button>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    id="background-upload"
                    style={{ display: 'none' }}
                    onChange={handleBackgroundChange}
                  />
                  <label htmlFor="background-upload">
                    <Button component="span" variant="outlined" size="small" fullWidth>
                      Hintergrund ändern
                    </Button>
                  </label>

                  {profile.backgroundUrl && (
                    <Button
                      variant="text"
                      size="small"
                      color="error"
                      fullWidth
                      onClick={handleRemoveBackground}
                    >
                      Hintergrund entfernen
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
            <ProfileActivitySummary profile={profile} events={events} />
          </Stack>
        </Grid>

        {/* Profile Details Right */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.08)', height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Benutzerinformationen
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <PersonIcon color="action" />
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Benutzername
                      </Typography>
                      {!editMode ? (
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {profile.userName}
                        </Typography>
                      ) : (
                        <TextField
                          name="userName"
                          label="Benutzername"
                          size="small"
                          fullWidth
                          value={editData.userName}
                          onChange={handleEditChange}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <PersonIcon color="action" />
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Vollständiger Name
                      </Typography>
                      {!editMode ? (
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {profile.firstName} {profile.lastName}
                        </Typography>
                      ) : (
                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                          <TextField
                            name="firstName"
                            label="Vorname"
                            size="small"
                            fullWidth
                            value={editData.firstName}
                            onChange={handleEditChange}
                          />
                          <TextField
                            name="lastName"
                            label="Nachname"
                            size="small"
                            fullWidth
                            value={editData.lastName}
                            onChange={handleEditChange}
                          />
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <EmailIcon color="action" />
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        E-Mail-Adresse
                      </Typography>
                      {!editMode ? (
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {profile.email}
                        </Typography>
                      ) : (
                        <TextField
                          name="email"
                          label="E-Mail"
                          size="small"
                          fullWidth
                          value={editData.email}
                          onChange={handleEditChange}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
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
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <ShieldIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Kontostatus
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', color: (profile.isActive !== undefined ? profile.isActive : profile.active) ? 'success.main' : 'error.main' }}>
                        {(profile.isActive !== undefined ? profile.isActive : profile.active) ? 'Aktiv' : 'Inaktiv'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <WorkspacePremiumIcon color={profile.hasPaidCurrentYear ? "success" : "action"} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Mitgliedsbeitrag {new Date().getFullYear()}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', color: profile.hasPaidCurrentYear ? 'success.main' : 'error.main' }}>
                        {profile.hasPaidCurrentYear ? 'Bezahlt' : 'Nicht bezahlt'}
                      </Typography>
                      {profile.paidYears && profile.paidYears.length > 0 && (
                        <Stack spacing={0.3} sx={{ mt: 0.8 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', fontSize: '0.72rem' }}>
                            Bezahlte Jahre:
                          </Typography>
                          {profile.paidYears.sort((a, b) => b - a).map(y => (
                            <Chip
                              key={y}
                              label={y}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20, mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </Box>



                <Divider />

                {/* Phrase (Motto) */}
                <Box>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <AutoAwesomeIcon color="action" />
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Motto / Spruch
                      </Typography>
                      {!editMode ? (
                        <Typography variant="body1" sx={{ fontWeight: 'medium', fontStyle: 'italic' }}>
                          {profile.phrase ? `"${profile.phrase}"` : 'Kein Motto gesetzt'}
                        </Typography>
                      ) : (
                        <TextField
                          name="phrase"
                          fullWidth
                          size="small"
                          variant="outlined"
                          value={editData.phrase}
                          onChange={handleEditChange}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                {/* Birthday */}
                <Box>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <CalendarMonthIcon color="action" />
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Geburtsdatum
                      </Typography>
                      {!editMode ? (
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {profile.birthday ? new Date(profile.birthday).toLocaleDateString("de-DE") : 'Nicht hinterlegt'}
                        </Typography>
                      ) : (
                        <TextField
                          name="birthday"
                          type="date"
                          fullWidth
                          size="small"
                          variant="outlined"
                          value={editData.birthday}
                          onChange={handleEditChange}
                          slotProps={{ inputLabel: { shrink: true } }}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Box>

                {/* Display Ribbon, Mentor and Mentees */}
                {(profile.ribbon || profile.mentorName || (profile.mentorOf && profile.mentorOf.length > 0) || profile.visitedOps > 0) && (
                  <>
                    <Divider />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                      Airsoft-Zusatzdaten
                    </Typography>

                    {profile.ribbon && (
                      <Box>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                          <WorkspacePremiumIcon color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Auszeichnung / Ribbon
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                              {profile.ribbon}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    {profile.mentorName && (
                      <Box>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                          <PersonIcon color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Dein Mentor
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {profile.mentorName}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    {profile.mentorOf && profile.mentorOf.length > 0 && (
                      <Box>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                          <GroupIcon color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Mentoring (Frischlinge)
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {profile.mentorOf.map((fName) => (
                                <Chip key={fName} label={fName} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    {profile.visitedOps > 0 && (
                      <Box>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                          <WorkspacePremiumIcon color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Besuchte Operations (Ops)
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {profile.visitedOps} Einsätze
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    )}
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 4, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
            <NotificationsActiveIcon color="action" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Benachrichtigungen</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Event-E-Mails werden sofort gesendet. Andere E-Mails werden morgens um 06:00 Uhr zusammengefasst. Webhooks werden immer direkt gesendet.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 1fr) auto auto', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">Bereich</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>E-Mail</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>Webhook</Typography>
            {[
              ['EVENT', 'Events'],
              ['FORUM', 'Forum'],
              ['GALLERY', 'Galerie'],
              ...(['Admin', 'Vorstand'].includes(profile?.role) ? [['SIGNUP', 'Neue Registrierungen']] : [])
            ].map(([resource, label]) => (
              <React.Fragment key={resource}>
                <Typography>{label}</Typography>
                <Switch checked={notificationPreferences.resources?.[resource]?.email || false} onChange={() => toggleNotificationChannel(resource, 'email')} inputProps={{ 'aria-label': `${label} per E-Mail` }} />
                <Switch checked={notificationPreferences.resources?.[resource]?.webhook || false} onChange={() => toggleNotificationChannel(resource, 'webhook')} inputProps={{ 'aria-label': `${label} per Webhook` }} />
              </React.Fragment>
            ))}
          </Box>

          {Object.values(notificationPreferences.resources || {}).some(value => value.webhook) && (
            <Box sx={{ mt: 3, p: 2.5, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                <WebhookIcon color="action" />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Persönlicher Webhook</Typography>
              </Stack>
              <TextField
                fullWidth
                size="small"
                label={notificationPreferences.webhook?.configured ? 'Neue URL eingeben, um die vorhandene zu ersetzen' : 'Webhook-URL'}
                placeholder={notificationPreferences.webhook?.urlMasked || 'https://example.org/webhook'}
                value={webhookUrl}
                onChange={event => setWebhookUrl(event.target.value)}
              />
              {webhookSecret && (
                <TextField fullWidth size="small" sx={{ mt: 2 }} label="Webhook-Secret (wird nur einmal angezeigt)" value={webhookSecret} slotProps={{ input: { readOnly: true } }} />
              )}
              {notificationPreferences.webhook?.configured && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Typography variant="caption" color={notificationPreferences.webhook.verifiedAt ? 'success.main' : 'warning.main'}>
                    {notificationPreferences.webhook.verifiedAt ? 'Webhook verifiziert' : 'Webhook noch nicht erfolgreich getestet'}
                  </Typography>
                  {notificationPreferences.webhook.lastError && <Typography variant="caption" color="error">Letzter Fehler: {notificationPreferences.webhook.lastError}</Typography>}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button size="small" variant="outlined" onClick={testWebhook}>Webhook testen</Button>
                    <Button size="small" variant="outlined" onClick={rotateWebhookSecret}>Secret erneuern</Button>
                    <Button size="small" color="error" onClick={removeWebhook}>Webhook entfernen</Button>
                  </Stack>
                </Stack>
              )}
            </Box>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
            <Button variant="contained" onClick={saveNotificationPreferences} disabled={notificationSaving}>
              Einstellungen speichern
            </Button>
            <Button variant="text" onClick={acknowledgeNews}>Neuigkeiten als gelesen markieren</Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
