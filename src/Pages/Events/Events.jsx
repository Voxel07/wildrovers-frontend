import React, { useState, useEffect } from 'react';
import useAuth from '../../context/useAuth';
import api from '../../helper/api';

// Material UI
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddBoxIcon from '@mui/icons-material/AddBox';

export default function Events() {
  const { auth } = useAuth();
  const isLoggedIn = !!auth?.JWT;
  const isAdmin = auth?.roles === 'Admin';
  const currentUsername = auth?.user;

  const [events, setEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: ''
  });
  const [formError, setFormError] = useState('');

  const fetchEvents = () => {
    api.get('/event')
      .then(res => {
        setEvents(res.data);
      })
      .catch(err => {
        console.error("Error fetching events", err);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ title: '', description: '', eventDate: '', location: '' });
    setEditMode(false);
    setSelectedEventId(null);
    setFormError('');
    setOpenModal(true);
  };

  const handleOpenEdit = (event) => {
    // Format LocalDateTime string to datetime-local compatible format (YYYY-MM-DDThh:mm)
    let formattedDate = '';
    if (event.eventDate) {
      formattedDate = event.eventDate.substring(0, 16);
    }

    setFormData({
      title: event.title,
      description: event.description || '',
      eventDate: formattedDate,
      location: event.location
    });
    setEditMode(true);
    setSelectedEventId(event.id);
    setFormError('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.eventDate || !formData.location) {
      setFormError('Bitte fülle alle Pflichtfelder (Titel, Datum, Ort) aus.');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      eventDate: formData.eventDate, // format YYYY-MM-DDThh:mm is fully compatible with LocalDateTime
      location: formData.location
    };

    const request = editMode
      ? api.put('/event', { ...payload, id: selectedEventId })
      : api.post('/event', payload);

    request
      .then(() => {
        handleCloseModal();
        fetchEvents();
      })
      .catch(err => {
        console.error("Error saving event", err);
        setFormError(err.response?.data || 'Fehler beim Speichern des Events. Bitte Eingaben überprüfen.');
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Bist du sicher, dass du dieses Event löschen möchtest? Dies löscht auch den Google Kalender-Eintrag.")) {
      api.delete(`/event/${id}`)
        .then(() => {
          fetchEvents();
        })
        .catch(err => {
          console.error("Error deleting event", err);
          alert(err.response?.data || "Löschen fehlgeschlagen.");
        });
    }
  };

  const handleAttendance = (eventId, status) => {
    api.post(`/event/${eventId}/attendance`, { status })
      .then(() => {
        fetchEvents();
      })
      .catch(err => {
        console.error("Error setting attendance", err);
      });
  };

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

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Typography variant="h3" color="primary" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
          Einsatz-Termine
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
          Alle anstehenden und vergangenen Events der Wild Rovers auf einen Blick.
        </Typography>

        {isLoggedIn ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddBoxIcon />}
              onClick={handleOpenAdd}
              sx={{ px: 4, py: 1.2 }}
            >
              Event hinzufügen
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', border: '1px solid rgba(255, 255, 255, 0.08)', p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
              🔒 Bitte im Forum einloggen, um Events zu erstellen oder zu bearbeiten.
            </Typography>
          </Box>
        )}

        {/* Timeline representation */}
        <Box sx={{
          position: 'relative',
          pl: { xs: 2, sm: 4 },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: { xs: 7, sm: 15 },
            top: 10,
            bottom: 10,
            width: '2px',
            bgcolor: 'rgba(255, 152, 0, 0.25)',
          }
        }}>
          {events.length > 0 ? events.map((event, index) => {
            const isCreator = event.creatorName === currentUsername;
            const canModify = isLoggedIn && (isCreator || isAdmin);
            const isFuture = new Date(event.eventDate) >= new Date();

            return (
              <Box key={event.id} sx={{ position: 'relative', mb: 6 }}>
                {/* Timeline node icon indicator */}
                <Box sx={{
                  position: 'absolute',
                  left: { xs: -14, sm: -30 },
                  top: 20,
                  width: { xs: 12, sm: 16 },
                  height: { xs: 12, sm: 16 },
                  borderRadius: '50%',
                  bgcolor: isFuture ? 'primary.main' : 'rgba(255,255,255,0.2)',
                  border: '3px solid',
                  borderColor: 'background.default',
                  boxShadow: isFuture ? '0 0 10px rgba(255, 152, 0, 0.5)' : 'none',
                  zIndex: 2
                }} />

                <Card sx={{
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  bgcolor: isFuture ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.005)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: isFuture ? 'primary.main' : 'rgba(255,255,255,0.15)',
                    transform: 'translateX(4px)'
                  }
                }}>
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1.5, color: isFuture ? 'text.primary' : 'text.secondary' }}>
                          {event.title}
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                          <Stack direction="row" spacing={0.5} alignItems="center" color="primary.main">
                            <CalendarMonthIcon sx={{ fontSize: '1.1rem' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {formatDate(event.eventDate)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                            <LocationOnIcon sx={{ fontSize: '1.1rem' }} />
                            <Typography variant="subtitle2">
                              {event.location}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                      {canModify && (
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Bearbeiten">
                            <IconButton color="primary" onClick={() => handleOpenEdit(event)} size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Löschen">
                            <IconButton color="error" onClick={() => handleDelete(event.id)} size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </Stack>

                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {event.description}
                    </Typography>

                    {/* Attendance / RSVP Options */}
                    {isLoggedIn && (
                      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>Deine Teilnahme:</Typography>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant={event.attendances?.find(a => a.userName === currentUsername)?.status === 'YES' ? 'contained' : 'outlined'}
                            color="success"
                            onClick={() => handleAttendance(event.id, 'YES')}
                          >
                            Ja
                          </Button>
                          <Button
                            size="small"
                            variant={event.attendances?.find(a => a.userName === currentUsername)?.status === 'NO' ? 'contained' : 'outlined'}
                            color="error"
                            onClick={() => handleAttendance(event.id, 'NO')}
                          >
                            Nein
                          </Button>
                          <Button
                            size="small"
                            variant={event.attendances?.find(a => a.userName === currentUsername)?.status === 'MAYBE' ? 'contained' : 'outlined'}
                            color="warning"
                            onClick={() => handleAttendance(event.id, 'MAYBE')}
                          >
                            Vielleicht
                          </Button>
                        </Stack>
                      </Box>
                    )}

                    {/* RSVP Summary counts */}
                    <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                      <Tooltip title={event.attendances?.filter(a => a.status === 'YES').map(a => a.userName).join(', ') || 'Niemand'}>
                        <Chip
                          label={`Zusagen: ${event.attendances?.filter(a => a.status === 'YES').length || 0}`}
                          color="success"
                          size="small"
                          variant="outlined"
                          sx={{ cursor: 'help' }}
                        />
                      </Tooltip>
                      <Tooltip title={event.attendances?.filter(a => a.status === 'NO').map(a => a.userName).join(', ') || 'Niemand'}>
                        <Chip
                          label={`Absagen: ${event.attendances?.filter(a => a.status === 'NO').length || 0}`}
                          color="error"
                          size="small"
                          variant="outlined"
                          sx={{ cursor: 'help' }}
                        />
                      </Tooltip>
                      <Tooltip title={event.attendances?.filter(a => a.status === 'MAYBE').map(a => a.userName).join(', ') || 'Niemand'}>
                        <Chip
                          label={`Vielleicht: ${event.attendances?.filter(a => a.status === 'MAYBE').length || 0}`}
                          color="warning"
                          size="small"
                          variant="outlined"
                          sx={{ cursor: 'help' }}
                        />
                      </Tooltip>

                      {/* Forum Link */}
                      {event.forumPostUrl && (
                        <Button
                          variant="text"
                          color="secondary"
                          size="small"
                          href={event.forumPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ ml: 'auto', textTransform: 'none', fontWeight: 'bold' }}
                        >
                          💬 Diskussion im Forum
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            );
          }) : (
            <Typography align="center" color="text.secondary" sx={{ fontStyle: 'italic', py: 4 }}>
              Aktuell sind keine Termine eingetragen.
            </Typography>
          )}
        </Box>
      </Container>

      {/* Dialog for adding/editing event */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'primary.main' }}>
          {editMode ? 'Einsatz-Termin bearbeiten' : 'Neuen Einsatz-Termin erstellen'}
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
                name="eventDate"
                label="Datum & Uhrzeit"
                type="datetime-local"
                fullWidth
                variant="outlined"
                value={formData.eventDate}
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
              <TextField
                name="description"
                label="Beschreibung / Details"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Mitzubringende Ausrüstung, Zeitplanung, Fahrgemeinschaften..."
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
