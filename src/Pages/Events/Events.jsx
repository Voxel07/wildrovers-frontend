import React, { useState, useEffect, useReducer } from 'react';
import useAuth from '../../context/useAuth';
import api, { extractErrorMessage } from '../../helper/api';

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
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ForumIcon from '@mui/icons-material/Forum';
import AddBoxIcon from '@mui/icons-material/AddBox';
import WarningIcon from '@mui/icons-material/Warning';
import LockIcon from '@mui/icons-material/Lock';

const initialModalState = {
  openModal: false,
  editMode: false,
  selectedEventId: null,
  formData: {
    title: '',
    description: '',
    eventDate: '',
    eventEndDate: '',
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
        selectedEventId: null,
        formData: { title: '', description: '', eventDate: '', eventEndDate: '', location: '' },
        formError: '',
      };
    case 'OPEN_EDIT':
      return {
        ...state,
        openModal: true,
        editMode: true,
        selectedEventId: action.payload.id,
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

function PermissionNotice({ icon: Icon, text }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        p: 2,
        borderRadius: 2,
        bgcolor: 'rgba(0,0,0,0.2)',
        color: 'text.secondary',
        fontStyle: 'italic',
        mx: 'auto'
      }}
    >
      <Icon sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
      <Typography variant="body2">{text}</Typography>
    </Stack>
  );
}

export default function Events() {
  const { auth } = useAuth();
  const isLoggedIn = !!auth?.JWT;
  const isAdmin = auth?.roles === 'Admin';
  const currentUsername = auth?.user;
  const isTeamMember = isLoggedIn && ['Frischling', 'Mitglied', 'Vorstand', 'Admin'].includes(auth?.roles);

  const [events, setEvents] = useState([]);
  const [modalState, dispatchModal] = useReducer(modalReducer, initialModalState);
  const { openModal, editMode, selectedEventId, formData, formError } = modalState;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuEventId, setMenuEventId] = useState(null);

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
    if (events.length > 0) {
      const years = Array.from(
        new Set(events.map(e => e.eventDate ? new Date(e.eventDate).getFullYear() : null).filter(Boolean))
      ).sort((a, b) => a - b);
      if (years.length > 0 && !years.includes(selectedYear)) {
        setSelectedYear(years[years.length - 1]);
      }
    }
  }, [events]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenAdd = () => {
    dispatchModal({ type: 'OPEN_ADD' });
  };

  const handleOpenEdit = (event) => {
    // Format LocalDateTime string to datetime-local compatible format (YYYY-MM-DDThh:mm)
    let formattedDate = '';
    if (event.eventDate) {
      formattedDate = event.eventDate.substring(0, 16);
    }
    let formattedEndDate = '';
    if (event.eventEndDate) {
      formattedEndDate = event.eventEndDate.substring(0, 16);
    }

    dispatchModal({
      type: 'OPEN_EDIT',
      payload: {
        id: event.id,
        formData: {
          title: event.title,
          description: event.description || '',
          eventDate: formattedDate,
          eventEndDate: formattedEndDate,
          location: event.location
        }
      }
    });
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

    if (!formData.title || !formData.eventDate || !formData.location) {
      dispatchModal({ type: 'SET_FORM_ERROR', payload: 'Bitte fülle alle Pflichtfelder (Titel, Datum, Ort) aus.' });
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      eventDate: formData.eventDate, // format YYYY-MM-DDThh:mm is fully compatible with LocalDateTime
      eventEndDate: formData.eventEndDate || null,
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
        dispatchModal({
          type: 'SET_FORM_ERROR',
          payload: extractErrorMessage(err),
        });
      });
  };

  const handleOpenDelete = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!eventToDelete) return;
    api.delete(`/event/${eventToDelete.id}`)
      .then(() => {
        setDeleteDialogOpen(false);
        setEventToDelete(null);
        fetchEvents();
      })
      .catch(err => {
        console.error("Error deleting event", err);
        alert(extractErrorMessage(err) || 'Löschen fehlgeschlagen.');
      });
  };

  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
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

  const parseEventDate = (startDateStr, endDateStr) => {
    if (!startDateStr) return { dateTextOnly: '', timeTextOnly: '' };
    try {
      const start = new Date(startDateStr);
      const dateTextOnly = start.toLocaleDateString("de-DE", {
        day: '2-digit',
        month: 'short'
      });
      let timeTextOnly = start.toLocaleDateString("de-DE", {
        year: 'numeric'
      }) + ', ' + start.toLocaleTimeString("de-DE", {
        hour: '2-digit',
        minute: '2-digit'
      }) + ' Uhr';

      if (endDateStr) {
        const end = new Date(endDateStr);
        if (start.toDateString() === end.toDateString()) {
          timeTextOnly = start.toLocaleDateString("de-DE", {
            year: 'numeric'
          }) + ', ' + start.toLocaleTimeString("de-DE", {
            hour: '2-digit',
            minute: '2-digit'
          }) + ' - ' + end.toLocaleTimeString("de-DE", {
            hour: '2-digit',
            minute: '2-digit'
          }) + ' Uhr';
        } else {
          const endDayText = end.toLocaleDateString("de-DE", {
            day: '2-digit',
            month: 'short'
          });
          const endYearText = end.toLocaleDateString("de-DE", {
            year: 'numeric'
          }) + ', ' + end.toLocaleTimeString("de-DE", {
            hour: '2-digit',
            minute: '2-digit'
          }) + ' Uhr';

          timeTextOnly = `${start.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })} Uhr bis ${endDayText} ${endYearText}`;
        }
      }
      return { dateTextOnly, timeTextOnly };
    } catch (e) {
      return { dateTextOnly: startDateStr, timeTextOnly: '' };
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Typography variant="h3" color="primary" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
          Anstehende Events
        </Typography>

        {isTeamMember ? (
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
            <PermissionNotice
              icon={LockIcon}
              text={!isLoggedIn 
                ? "Bitte einloggen, um Events zu erstellen oder zu bearbeiten." 
                : "Mindestens Rang 'Frischling' benötigt, um Events zu erstellen oder zu bearbeiten."
              }
            />
          </Box>
        )}

        {/* Year Filter Chips */}
        {(() => {
          const uniqueYears = Array.from(
            new Set(events.map(e => e.eventDate ? new Date(e.eventDate).getFullYear() : null).filter(Boolean))
          ).sort((a, b) => a - b);
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

        {/* Timeline representation */}
        {(() => {
          const filteredEvents = events.filter(e => e.eventDate && new Date(e.eventDate).getFullYear() === selectedYear);
          const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

          if (sortedEvents.length === 0) {
            return (
              <Typography align="center" color="text.secondary" sx={{ fontStyle: 'italic', py: 4 }}>
                Aktuell sind keine Termine für das Jahr {selectedYear} eingetragen.
              </Typography>
            );
          }

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Find the next upcoming event
          const upcomingEvents = sortedEvents.filter(e => new Date(e.eventDate) >= today);
          const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

          return (
            <Box sx={{ position: 'relative' }}>
              {sortedEvents.map((event, index) => {
                const isCreator = event.creatorName === currentUsername;
                const canModify = isTeamMember && (isCreator || isAdmin);
                const isFuture = new Date(event.eventDate) >= today;
                const isNextEvent = nextEvent && nextEvent.id === event.id;
                const daysToNext = isNextEvent ? Math.ceil((new Date(event.eventDate) - today) / (1000 * 60 * 60 * 24)) : 0;
                const { dateTextOnly, timeTextOnly } = parseEventDate(event.eventDate, event.eventEndDate);

                return (
                  <Box key={event.id}>
                    {/* Days counter between adjacent events */}
                    {index > 0 && (
                      <Grid container spacing={2} sx={{ position: 'relative', my: 1.5 }}>
                        <Grid size={{ xs: 3.5, sm: 2.5 }} />
                        <Grid size={{ xs: 1, sm: 1 }} sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'center', position: 'relative', height: 40 }}>
                          <Box sx={{
                            width: '2px',
                            bgcolor: 'rgba(255, 152, 0, 0.25)',
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1
                          }} />
                          <Chip
                            label={`${Math.round((new Date(event.eventDate) - new Date(sortedEvents[index - 1].eventDate)) / (1000 * 60 * 60 * 24))} T.`}
                            title={`${Math.round((new Date(event.eventDate) - new Date(sortedEvents[index - 1].eventDate)) / (1000 * 60 * 60 * 24))} Tage zwischen den Terminen`}
                            size="small"
                            sx={{
                              zIndex: 2,
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: 'background.default',
                              color: 'text.secondary',
                              border: '1px solid rgba(255, 152, 0, 0.3)',
                              px: 0.5,
                              alignSelf: 'center'
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 8.5 }} />
                      </Grid>
                    )}

                    {/* Main Event Row */}
                    <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
                      {/* Left Column: Date & Time (desktop only) */}
                      <Grid size={{ xs: 3.5, sm: 2.5 }} sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', pr: { xs: 1, sm: 2 } }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main', textAlign: 'right', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                          {dateTextOnly}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          {timeTextOnly}
                        </Typography>
                        {isNextEvent && (
                          <Chip
                            label={daysToNext === 0 ? "Heute!" : `In ${daysToNext} T.`}
                            title={daysToNext === 0 ? "Heute!" : `In ${daysToNext} Tagen`}
                            color="primary"
                            size="small"
                            sx={{
                              mt: 0.8,
                              fontWeight: 'bold',
                              fontSize: '0.65rem',
                              height: 18,
                              boxShadow: '0 0 8px rgba(255, 152, 0, 0.4)'
                            }}
                          />
                        )}
                      </Grid>

                      {/* Middle Column: Line Segment and Circle Node */}
                      <Grid size={{ xs: 1, sm: 1 }} sx={{ position: 'relative', display: { xs: 'none', sm: 'flex' }, justifyContent: 'center' }}>
                        <Box sx={{
                          width: '2px',
                          bgcolor: 'rgba(255, 152, 0, 0.25)',
                          position: 'absolute',
                          top: index === 0 ? '50%' : 0,
                          bottom: index === sortedEvents.length - 1 ? '50%' : 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 1
                        }} />
                        <Box sx={{
                          width: { xs: 12, sm: 16 },
                          height: { xs: 12, sm: 16 },
                          borderRadius: '50%',
                          bgcolor: isFuture ? 'primary.main' : 'rgba(255,255,255,0.2)',
                          border: '3px solid',
                          borderColor: 'background.default',
                          boxShadow: isFuture ? '0 0 10px rgba(255, 152, 0, 0.5)' : 'none',
                          position: 'absolute',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          left: '50%',
                          zIndex: 2
                        }} />
                      </Grid>

                      {/* Right Column: Card */}
                      <Grid size={{ xs: 12, sm: 8.5 }} sx={{ display: 'flex' }}>
                        <Card sx={{
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          bgcolor: isFuture ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.005)',
                          transition: 'all 0.3s ease',
                          width: '100%',
                          '&:hover': {
                            borderColor: isFuture ? 'primary.main' : 'rgba(255,255,255,0.15)',
                            transform: 'translateX(4px)'
                          }
                        }}>
                          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1.5, color: isFuture ? 'text.primary' : 'text.secondary', fontSize: { xs: '1.15rem', sm: '1.4rem' } }}>
                                  {event.title}
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 0.5 }}>
                                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }} color="text.secondary">
                                    <LocationOnIcon sx={{ fontSize: '1.1rem' }} />
                                    <Typography variant="subtitle2">
                                      {event.location}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </Box>
                              <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', flexShrink: 0, ml: 'auto', mr: 1 }}>
                                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }} color="text.secondary">
                                  <CalendarMonthIcon sx={{ fontSize: '1.1rem' }} />
                                  <Typography variant="subtitle2">
                                    {dateTextOnly}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    {timeTextOnly}
                                  </Typography>
                                  {isNextEvent && (
                                    <Chip
                                      label={daysToNext === 0 ? "Heute!" : `In ${daysToNext} T.`}
                                      color="primary"
                                      size="small"
                                      sx={{ fontWeight: 'bold', fontSize: '0.65rem', height: 18, ml: 1.5 }}
                                    />
                                  )}
                                </Stack>
                              </Stack>
                              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
                                {event.forumPostUrl && (
                                  <Tooltip title="Im Forum diskutieren">
                                    <IconButton
                                      color="secondary"
                                      size="small"
                                      href={event.forumPostUrl.replace(/^https?:\/\/[^/]+/, window.location.origin)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ForumIcon fontSize="medium" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {canModify && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => { setMenuAnchorEl(e.currentTarget); setMenuEventId(event.id); }}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Stack>
                            </Stack>

                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', mb: 2 }}>
                              {event.description}
                            </Typography>

                            {/* Attendance chips – also act as buttons when logged in */}
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                              <Tooltip title={isTeamMember ? (event.attendances?.filter(a => a.status === 'YES').map(a => a.userName).join(', ') || 'Niemand') : (isLoggedIn ? 'Zusagen' : 'Nur für Teammitglieder sichtbar')}>
                                <Chip
                                  label={`Zusagen: ${event.attendances?.filter(a => a.status === 'YES').length || 0}`}
                                  color="success"
                                  size="small"
                                  variant={event.attendances?.find(a => a.userName === currentUsername)?.status === 'YES' ? 'filled' : 'outlined'}
                                  onClick={isLoggedIn ? () => handleAttendance(event.id, 'YES') : undefined}
                                  sx={{ cursor: isLoggedIn ? 'pointer' : (isTeamMember ? 'help' : 'default') }}
                                />
                              </Tooltip>
                              <Tooltip title={isTeamMember ? (event.attendances?.filter(a => a.status === 'NO').map(a => a.userName).join(', ') || 'Niemand') : (isLoggedIn ? 'Absagen' : 'Nur für Teammitglieder sichtbar')}>
                                <Chip
                                  label={`Absagen: ${event.attendances?.filter(a => a.status === 'NO').length || 0}`}
                                  color="error"
                                  size="small"
                                  variant={event.attendances?.find(a => a.userName === currentUsername)?.status === 'NO' ? 'filled' : 'outlined'}
                                  onClick={isLoggedIn ? () => handleAttendance(event.id, 'NO') : undefined}
                                  sx={{ cursor: isLoggedIn ? 'pointer' : (isTeamMember ? 'help' : 'default') }}
                                />
                              </Tooltip>
                              <Tooltip title={isTeamMember ? (event.attendances?.filter(a => a.status === 'MAYBE').map(a => a.userName).join(', ') || 'Niemand') : (isLoggedIn ? 'Vielleicht' : 'Nur für Teammitglieder sichtbar')}>
                                <Chip
                                  label={`Vielleicht: ${event.attendances?.filter(a => a.status === 'MAYBE').length || 0}`}
                                  color="warning"
                                  size="small"
                                  variant={event.attendances?.find(a => a.userName === currentUsername)?.status === 'MAYBE' ? 'filled' : 'outlined'}
                                  onClick={isLoggedIn ? () => handleAttendance(event.id, 'MAYBE') : undefined}
                                  sx={{ cursor: isLoggedIn ? 'pointer' : (isTeamMember ? 'help' : 'default') }}
                                />
                              </Tooltip>

                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Box>
          );
        })()}

        {/* 3-dot menu for edit/delete */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => { setMenuAnchorEl(null); setMenuEventId(null); }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => {
            const ev = events.find(e => e.id === menuEventId);
            if (ev) handleOpenEdit(ev);
            setMenuAnchorEl(null);
            setMenuEventId(null);
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Bearbeiten
          </MenuItem>
          <MenuItem onClick={() => {
            const ev = events.find(e => e.id === menuEventId);
            if (ev) handleOpenDelete(ev);
            setMenuAnchorEl(null);
            setMenuEventId(null);
          }} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Löschen
          </MenuItem>
        </Menu>
      </Container>

      {/* Dialog for adding/editing event */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'primary.main' }}>
          {editMode ? 'Event-Termin bearbeiten' : 'Neuen Event-Termin erstellen'}
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
                name="eventDate"
                label="Datum & Uhrzeit"
                type="datetime-local"
                fullWidth
                variant="outlined"
                value={formData.eventDate}
                onChange={handleChange}
                slotProps={{ inputLabel: { shrink: true } }}
                required
              />
              <TextField
                name="eventEndDate"
                label="Enddatum & Endzeit (optional)"
                type="datetime-local"
                fullWidth
                variant="outlined"
                value={formData.eventEndDate || ''}
                onChange={handleChange}
                slotProps={{ inputLabel: { shrink: true } }}
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

      {/* Custom dialog for deleting event */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDelete} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Termin löschen?
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bist du sicher, dass du das Event <strong>{eventToDelete?.title}</strong> löschen möchtest?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dies löscht auch den zugehörigen Google Kalender-Eintrag unwiderruflich aus dem System.
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
