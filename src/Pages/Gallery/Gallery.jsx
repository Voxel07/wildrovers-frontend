import React, { useState, useEffect, useReducer } from 'react';
import useAuth from '../../context/useAuth';
import api from '../../helper/api';

// Material UI
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  CardActions
} from '@mui/material';

import Grid from '@mui/material/Grid';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LaunchIcon from '@mui/icons-material/Launch';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';

const initialModalState = {
  openModal: false,
  formData: {
    title: '',
    url: '',
    date: '',
    location: ''
  },
  formError: '',
};

function modalReducer(state, action) {
  switch (action.type) {
    case 'OPEN':
      return {
        ...state,
        openModal: true,
        formData: { title: '', url: '', date: '', location: '' },
        formError: '',
      };
    case 'CLOSE':
      return {
        ...state,
        openModal: false,
      };
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: action.payload,
      };
    case 'SET_FORM_ERROR':
      return {
        ...state,
        formError: action.payload,
      };
    default:
      return state;
  }
}

export default function Gallery() {
  const { auth } = useAuth();
  const isLoggedIn = !!auth?.JWT;

  const proxyUrl = import.meta.env.VITE_IMMICH_PROXY_URL || "";
  const dropUrl = import.meta.env.VITE_IMMICH_DROP_URL || "";

  const [showUpload, setShowUpload] = useState(false);
  const [dbAlbums, setDbAlbums] = useState([]);
  const [modalState, dispatchModal] = useReducer(modalReducer, initialModalState);
  const { openModal, formData, formError } = modalState;

  const fetchAlbums = () => {
    api.get('/gallery')
      .then(res => {
        setDbAlbums(res.data);
      })
      .catch(err => {
        console.error("Error fetching gallery albums from DB", err);
      });
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleOpenModal = () => {
    dispatchModal({ type: 'OPEN' });
  };

  const handleCloseModal = () => {
    dispatchModal({ type: 'CLOSE' });
  };

  const handleChange = (e) => {
    dispatchModal({
      type: 'SET_FORM_DATA',
      payload: { ...formData, [e.target.name]: e.target.value }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatchModal({ type: 'SET_FORM_ERROR', payload: '' });

    // Client-side validations
    if (!formData.title || !formData.url || !formData.date || !formData.location) {
      dispatchModal({ type: 'SET_FORM_ERROR', payload: 'Bitte alle Felder ausfüllen.' });
      return;
    }

    try {
      new URL(formData.url);
    } catch (e) {
      dispatchModal({ type: 'SET_FORM_ERROR', payload: 'Bitte eine gültige URL angeben.' });
      return;
    }

    api.post('/gallery', formData)
      .then(() => {
        handleCloseModal();
        fetchAlbums();
      })
      .catch(err => {
        console.error("Error adding gallery", err);
        dispatchModal({
          type: 'SET_FORM_ERROR',
          payload: err.response?.data || 'Fehler beim Hinzufügen der Galerie. Bitte Eingaben überprüfen.'
        });
      });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("de-DE", { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="xl">
        <Typography variant="h3" color="primary" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
          Event-Galerie
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}>
          Impressionen und Bilder unserer vergangenen Operationen in einer großen Sammlung.
        </Typography>

        {/* Buttons & Actions */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 6 }}>
          {isLoggedIn ? (
            <>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddPhotoAlternateIcon />}
                onClick={() => setShowUpload(!showUpload)}
                sx={{ px: 3, py: 1.2 }}
              >
                {showUpload ? "Upload ausblenden" : "Neue Bilder hochladen"}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<LibraryAddIcon />}
                onClick={handleOpenModal}
                sx={{ px: 3, py: 1.2 }}
              >
                Kiosk-Album hinzufügen
              </Button>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', border: '1px solid rgba(255, 255, 255, 0.08)', p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
              🔒 Bitte im Forum einloggen, um Bilder hochzuladen oder Alben hinzuzufügen.
            </Typography>
          )}
        </Stack>

        {/* Immich Drop Upload Iframe */}
        {isLoggedIn && showUpload && (
          <Box sx={{
            width: '100%',
            height: 500,
            borderRadius: 3,
            overflow: 'hidden',
            border: '2px dashed rgba(255, 152, 0, 0.5)',
            bgcolor: 'background.paper',
            mb: 8,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <iframe
              src={dropUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
              title="Immich Drop Upload"
            />
          </Box>
        )}

        {/* Timeline of DB Galleries */}
        {dbAlbums.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 4, fontWeight: 'bold' }}>
              Events-Timeline & Alben
            </Typography>
            <Grid container spacing={4}>
              {dbAlbums.map((album) => (
                <Grid item xs={12} sm={6} md={4} key={album.id} sx={{ display: 'flex' }}>
                  <Card sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    bgcolor: 'rgba(255, 255, 255, 0.01)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'primary.main',
                      boxShadow: '0 8px 24px rgba(255, 152, 0, 0.1)'
                    }
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {album.title}
                      </Typography>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                          <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
                          <Typography variant="body2">{formatDate(album.date)}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                          <LocationOnIcon sx={{ fontSize: '1rem' }} />
                          <Typography variant="body2">{album.location}</Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        href={album.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<LaunchIcon />}
                      >
                        Album öffnen
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Immich Public Gallery Iframe */}
        <Typography variant="h4" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 4, fontWeight: 'bold' }}>
          Öffentliche Galerie
        </Typography>
        <Box sx={{
          width: '100%',
          height: '80vh',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'background.paper',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <iframe
            src={proxyUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
            title="Immich Public Proxy Gallery"
          />
        </Box>
      </Container>

      {/* Dialog for adding album */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'primary.main' }}>
          Neues Album zur Timeline hinzufügen
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3 }}>
            {formError && (
              <Typography color="error" sx={{ mb: 2, fontWeight: 'bold' }}>
                {formError}
              </Typography>
            )}
            <Stack spacing={3}>
              <TextField
                name="title"
                label="Einsatz-Titel"
                fullWidth
                variant="outlined"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <TextField
                name="url"
                label="Immich Album URL"
                fullWidth
                variant="outlined"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://..."
                required
              />
              <TextField
                name="date"
                label="Datum"
                type="date"
                fullWidth
                variant="outlined"
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                name="location"
                label="Ort / Spielfeld"
                fullWidth
                variant="outlined"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Button onClick={handleCloseModal} color="inherit">
              Abbrechen
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Speichern
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
