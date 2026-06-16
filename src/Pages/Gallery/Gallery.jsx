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
  CardActions,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';

import Grid from '@mui/material/Grid';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LaunchIcon from '@mui/icons-material/Launch';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';

const initialModalState = {
  openModal: false,
  editMode: false,
  selectedAlbumId: null,
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
    case 'OPEN_ADD':
      return {
        ...state,
        openModal: true,
        editMode: false,
        selectedAlbumId: null,
        formData: { title: '', url: '', date: '', location: '' },
        formError: '',
      };
    case 'OPEN_EDIT':
      return {
        ...state,
        openModal: true,
        editMode: true,
        selectedAlbumId: action.payload.id,
        formData: action.payload.formData,
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
  const isAdmin = auth?.roles === 'Admin';
  const currentUsername = auth?.user;

  const proxyUrl = import.meta.env.VITE_IMMICH_PROXY_URL || "";
  const dropUrl = import.meta.env.VITE_IMMICH_DROP_URL || "";

  const [showUpload, setShowUpload] = useState(false);
  const [dbAlbums, setDbAlbums] = useState([]);
  const [modalState, dispatchModal] = useReducer(modalReducer, initialModalState);
  const { openModal, editMode, selectedAlbumId, formData, formError } = modalState;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState(null);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (dbAlbums.length > 0) {
      const years = Array.from(
        new Set(dbAlbums.map(a => a.date ? new Date(a.date).getFullYear() : null).filter(Boolean))
      ).sort((a, b) => b - a);
      if (years.length > 0 && !years.includes(selectedYear)) {
        setSelectedYear(years[0]);
      }
    }
  }, [dbAlbums]);

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

  const handleOpenAdd = () => {
    dispatchModal({ type: 'OPEN_ADD' });
  };

  const handleOpenEdit = (album) => {
    dispatchModal({
      type: 'OPEN_EDIT',
      payload: {
        id: album.id,
        formData: {
          title: album.title,
          url: album.url,
          date: album.date ? album.date.substring(0, 10) : '',
          location: album.location
        }
      }
    });
  };

  const handleCloseModal = () => {
    dispatchModal({ type: 'CLOSE' });
  };

  const handleOpenDelete = (album) => {
    setAlbumToDelete(album);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!albumToDelete) return;
    api.delete(`/gallery/${albumToDelete.id}`)
      .then(() => {
        setDeleteDialogOpen(false);
        setAlbumToDelete(null);
        fetchAlbums();
      })
      .catch(err => {
        console.error("Error deleting album", err);
        alert(err.response?.data || "Löschen fehlgeschlagen.");
      });
  };

  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setAlbumToDelete(null);
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

    const request = editMode
      ? api.put(`/gallery/${selectedAlbumId}`, formData)
      : api.post('/gallery', formData);

    request
      .then(() => {
        handleCloseModal();
        fetchAlbums();
      })
      .catch(err => {
        console.error("Error saving gallery", err);
        const errMsg = typeof err.response?.data === 'string'
          ? err.response.data
          : (err.response?.data?.message || 'Fehler beim Speichern. Bitte Eingaben überprüfen.');
        dispatchModal({
          type: 'SET_FORM_ERROR',
          payload: errMsg
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
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center', alignItems: 'center', mb: 6 }}>
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
                onClick={handleOpenAdd}
                sx={{ px: 3, py: 1.2 }}
              >
                Album hinzufügen
              </Button>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', border: '1px solid rgba(255, 255, 255, 0.08)', p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
              🔒 Bitte einloggen, um Bilder hochzuladen oder Alben hinzuzufügen.
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

            {/* Year Filter Chips */}
            {(() => {
              const uniqueYears = Array.from(
                new Set(dbAlbums.map(a => a.date ? new Date(a.date).getFullYear() : null).filter(Boolean))
              ).sort((a, b) => b - a);
              if (uniqueYears.length <= 1) return null;
              return (
                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', mb: 6, flexWrap: 'wrap', gap: 1 }}>
                  {uniqueYears.map(year => (
                    <Chip
                      key={year}
                      label={year}
                      clickable
                      color={selectedYear === year ? "primary" : "default"}
                      variant={selectedYear === year ? "filled" : "outlined"}
                      onClick={() => setSelectedYear(year)}
                      sx={{
                        fontSize: '0.95rem',
                        py: 2,
                        px: 1.5,
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: selectedYear === year ? 'primary.main' : 'rgba(255, 152, 0, 0.08)'
                        }
                      }}
                    />
                  ))}
                </Stack>
              );
            })()}

            <Grid container spacing={4}>
              {(() => {
                const filteredAlbums = dbAlbums.filter(a => a.date && new Date(a.date).getFullYear() === selectedYear);
                const sortedAlbums = [...filteredAlbums].sort((a, b) => new Date(b.date) - new Date(a.date));

                if (sortedAlbums.length === 0) {
                  return (
                    <Grid size={12}>
                      <Typography align="center" color="text.secondary" sx={{ fontStyle: 'italic', py: 4 }}>
                        Keine Alben für das Jahr {selectedYear} vorhanden.
                      </Typography>
                    </Grid>
                  );
                }

                return sortedAlbums.map((album) => {
                  const isCreator = album.creatorName === currentUsername;
                  const canModify = isLoggedIn && (isCreator || isAdmin);

                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={album.id} sx={{ display: 'flex' }}>
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
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', pr: 1 }}>
                              {album.title}
                            </Typography>
                            {canModify && (
                              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                <Tooltip title="Bearbeiten">
                                  <IconButton color="primary" onClick={() => handleOpenEdit(album)} size="small">
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Löschen">
                                  <IconButton color="error" onClick={() => handleOpenDelete(album)} size="small">
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            )}
                          </Stack>
                          <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                              <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
                              <Typography variant="body2">{formatDate(album.date)}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                              <LocationOnIcon sx={{ fontSize: '1rem' }} />
                              <Typography variant="body2">{album.location}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                              <PersonIcon sx={{ fontSize: '1rem' }} />
                              <Typography variant="body2">{album.creatorName || 'Unbekannt'}</Typography>
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
                  );
                });
              })()}
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

      {/* Dialog for adding/editing album */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'primary.main' }}>
          {editMode ? 'Album bearbeiten' : 'Neues Album zur Timeline hinzufügen'}
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
                label="Event-Titel"
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
                slotProps={{ inputLabel: { shrink: true } }}
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

      {/* Custom dialog for deleting album */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDelete} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'error.main' }}>
          ⚠️ Album löschen?
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bist du sicher, dass du das Album <strong>{albumToDelete?.title}</strong> löschen möchtest?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dies löscht den Galerie-Eintrag unwiderruflich aus der Timeline.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button onClick={handleCloseDelete} color="inherit">
            Abbrechen
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
