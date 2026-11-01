import React, { useState, useEffect, use } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import api, { extractErrorMessage } from '../../helper/api';

// Mui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import EventIcon from '@mui/icons-material/Event';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Eigene
import useAuth from '../../context/useAuth';
import { AlertsContext } from '../../components/utils/AlertsManager';
import PollOptionsEditor from './PollOptionsEditor';
import EventFormDialog from '../Events/EventFormDialog';
import { pollFromServer, toPollPayload, validatePoll } from '../../helper/pollForm';
import { formatDateOptionLabel } from '../../helper/pollDates';

/** Event title limit of the backend (Event.title, @Size max 200). */
const EVENT_TITLE_MAX = 200;

/** Prefilled event form for a poll option: dates from the option, 10:00 to 18:00. */
function eventValuesForOption(poll, option, postId) {
  const startDay = option.optionDate;
  const endDay = option.optionEndDate || option.optionDate;
  // Plain text: the backend sanitiser would store quotes as HTML entities.
  const lines = [`Termin aus der Umfrage: ${poll.question} (${option.optionText})`];
  if (postId != null) {
    lines.push(`Umfrage im Forum: ${window.location.origin}/Forum/Post/${postId}`);
  }
  return {
    title: (poll.question || '').slice(0, EVENT_TITLE_MAX),
    eventDate: startDay ? `${startDay}T10:00` : '',
    eventEndDate: endDay ? `${endDay}T18:00` : '',
    description: lines.join('\n'),
  };
}

export default function PollWidget(props) {
  const { pollData, canDelete, onDelete, canCreateEvent, postId } = props;
  const { auth } = useAuth();
  const alertsManagerRef = use(AlertsContext);

  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState(pollData);
  const [voting, setVoting] = useState(false);
  const [showVoters, setShowVoters] = useState(false);
  const [voterData, setVoterData] = useState([]);

  // Edit poll state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(() => pollFromServer(pollData));
  // Event from a poll option; the dialog gets a new key per opening.
  const [eventDialog, setEventDialog] = useState({ open: false, option: null, key: 0 });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);

  const handleOpenEdit = () => {
    setEditForm(pollFromServer(poll));
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
  };

  const handleEditSubmit = () => {
    const validationError = validatePoll(editForm);
    if (validationError) {
      alertsManagerRef.current.showAlert('warning', validationError);
      return;
    }

    setSubmittingEdit(true);
    // Options with an id are renamed (votes kept), options without one are created.
    const payload = toPollPayload(editForm);

    api.post(`/forum/poll/update?poll=${poll.id}`, payload)
      .then(response => {
        alertsManagerRef.current.showAlert('success', 'Umfrage aktualisiert!');
        setEditOpen(false);
        setVoterData([]); // clear stale voter data
        if (response.data && response.data.id) {
          setPoll(response.data);
        }
      })
      .catch(error => {
        console.error("Failed to update poll", error);
        const status = error.response?.status || 500;
        const msg = extractErrorMessage(error);
        alertsManagerRef.current.showAlert('error', `${status}: ${msg}`);
      })
      .finally(() => {
        setSubmittingEdit(false);
      });
  };

  // Check if current user has already voted and load their votes
  useEffect(() => {
    if (auth.user && poll) {
      api.get('/forum/poll/myVotes', { params: { poll: poll.id } })
        .then(response => {
          const votes = response.data || [];
          setSelectedOptions(votes);
          setHasVoted(votes.length > 0);
        })
        .catch(err => {
          console.error("Failed to check if user has voted", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [poll, auth.user]);

  const handleCheckboxChange = (optionId) => {
    setSelectedOptions(prev =>
      prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
    );
  };

  const handleVoteSubmit = () => {
    if (selectedOptions.length === 0) {
      alertsManagerRef.current.showAlert('warning', 'Bitte wähle mindestens eine Option aus.');
      return;
    }

    setVoting(true);
    const searchParams = new URLSearchParams();
    searchParams.append('poll', poll.id);
    selectedOptions.forEach(optId => searchParams.append('option', optId));

    api.post(`/forum/poll/vote?${searchParams.toString()}`)
      .then(response => {
        alertsManagerRef.current.showAlert('success', 'Stimme erfolgreich abgegeben!');
        setHasVoted(true);
        if (response.data && response.data.id) {
          setPoll(response.data);
        }
        // Refresh voter names if currently shown, otherwise clear for next toggle
        if (showVoters) {
          api.get('/forum/poll/voters', { params: { poll: poll.id } })
            .then(res => setVoterData(res.data || []))
            .catch(() => {});
        } else {
          setVoterData([]);
        }
      })
      .catch(error => {
        console.error("Voting failed", error);
        const status = error.response?.status || 500;
        const data = extractErrorMessage(error);
        alertsManagerRef.current.showAlert('error', `${status}: ${data}`);
      })
      .finally(() => {
        setVoting(false);
      });
  };

  const handleToggleVoters = () => {
    if (!showVoters && voterData.length === 0) {
      // Fetch voter names from backend
      api.get('/forum/poll/voters', { params: { poll: poll.id } })
        .then(response => {
          setVoterData(response.data || []);
          setShowVoters(true);
        })
        .catch(err => {
          console.error("Failed to fetch voters", err);
          alertsManagerRef.current.showAlert('error', 'Fehler beim Laden der Wähler');
        });
    } else {
      setShowVoters(!showVoters);
    }
  };

  const handleOpenEventDialog = (option) => {
    setEventDialog(d => ({ open: true, option, key: d.key + 1 }));
  };

  const handleEventCreated = (event) => {
    const optionId = eventDialog.option?.id;
    alertsManagerRef.current.showAlert('success', 'Event erstellt und in den Kalender eingetragen!');
    setPoll(p => ({
      ...p,
      options: p.options.map(o => (o.id === optionId ? { ...o, eventId: event?.id ?? o.eventId } : o)),
    }));
  };

  /** Date, event link and "create event" action shown next to an option. */
  const renderOptionExtras = (option) => {
    const dateLabel = option.optionDate ? formatDateOptionLabel(option.optionDate, option.optionEndDate) : null;
    const showDate = dateLabel && dateLabel !== option.optionText;
    const eventYear = option.optionDate ? option.optionDate.substring(0, 4) : null;
    if (!showDate && !option.eventId && !canCreateEvent) return null;
    return (
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
        {showDate && (
          <Typography variant="caption" color="text.secondary">{dateLabel}</Typography>
        )}
        {option.eventId ? (
          <Chip
            component={RouterLink}
            to={eventYear ? `/events?year=${eventYear}` : '/events'}
            clickable
            icon={<EventAvailableIcon />}
            label="Event"
            size="small"
            color="success"
            variant="outlined"
          />
        ) : canCreateEvent && (
          <Tooltip title="Event aus dieser Option erstellen">
            <IconButton
              aria-label="Event aus dieser Option erstellen"
              size="small"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenEventDialog(option); }}
            >
              <EventIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    );
  };

  if (loading) {
    return null;
  }

  // Calculate total votes
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

  return (
    <>
    <Card sx={{ border: '1px solid rgba(255, 152, 0, 0.25)', bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <BarChartIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Umfrage: {poll.question}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {canDelete && (
              <IconButton aria-label="Umfrage-Aktionen"
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Stack>

        {!hasVoted && auth.user ? (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            {poll.allowMultiple ? (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {poll.options.map((option) => (
                  <Stack key={option.id} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={selectedOptions.includes(option.id)}
                          onChange={() => handleCheckboxChange(option.id)}
                        />
                      }
                      label={option.optionText}
                      sx={{ mb: 1 }}
                    />
                    {renderOptionExtras(option)}
                  </Stack>
                ))}
              </Box>
            ) : (
              <RadioGroup
                value={selectedOptions[0] || ''}
                onChange={(e) => setSelectedOptions([Number(e.target.value)])}
              >
                {poll.options.map((option) => (
                  <Stack key={option.id} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      value={option.id}
                      control={<Radio color="primary" />}
                      label={option.optionText}
                      sx={{ mb: 1 }}
                    />
                    {renderOptionExtras(option)}
                  </Stack>
                ))}
              </RadioGroup>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleVoteSubmit}
              disabled={voting}
              sx={{ mt: 2, width: 'fit-content' }}
            >
              {voting ? 'Wird übermittelt...' : 'Abstimmen'}
            </Button>
          </FormControl>
        ) : (
          <Box sx={{ width: '100%' }}>
            {poll.options.map((option) => {
              const optVotes = option.votes || 0;
              const percentage = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
              const isUserChoice = selectedOptions.includes(option.id);
              const voterEntry = voterData.find(v => v.optionId === option.id);
              const names = voterEntry?.voterNames || [];

              return (
                <Box key={option.id} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: isUserChoice ? 'bold' : 'normal' }}>
                        {option.optionText}
                      </Typography>
                      {isUserChoice && <CheckCircleIcon color="success" sx={{ fontSize: '1rem' }} />}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
                      {renderOptionExtras(option)}
                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {optVotes} {optVotes === 1 ? 'Stimme' : 'Stimmen'} ({percentage}%)
                      </Typography>
                    </Stack>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: isUserChoice ? 'success.main' : 'primary.main',
                      }
                    }}
                  />
                  {/* Voter names directly under each option */}
                  {showVoters && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {names.length > 0 ? names.join(', ') : 'Keine Stimmen'}
                    </Typography>
                  )}
                </Box>
              );
            })}
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
              Stimmen insgesamt: {totalVotes} {!auth.user && ' (Bitte einloggen, um abzustimmen)'}
            </Typography>

            {poll.anonymous && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                Anonyme Umfrage — Stimmen sind nicht sichtbar
              </Typography>
            )}
          </Box>
        )}

        {/* Action buttons at bottom */}
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mt: 2 }}>
          <Box>
            {hasVoted && auth.user && (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => setHasVoted(false)}
              >
                Stimme ändern
              </Button>
            )}
          </Box>
          <Box>
            {!poll.anonymous && totalVotes > 0 && (
              <Button
                variant="text"
                size="small"
                onClick={handleToggleVoters}
              >
                {showVoters ? 'Stimmen ausblenden' : 'Stimmen anzeigen'}
              </Button>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>

    {/* Burger menu for edit/delete */}
    <Menu
      anchorEl={menuAnchor}
      open={menuOpen}
      onClose={() => setMenuAnchor(null)}
      slotProps={{ paper: { sx: { bgcolor: 'background.paper', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.08)' } } }}
    >
      <MenuItem onClick={() => { setMenuAnchor(null); handleOpenEdit(); }}>
        <EditIcon fontSize="small" sx={{ mr: 1 }} /> Bearbeiten
      </MenuItem>
      <MenuItem onClick={() => { setMenuAnchor(null); onDelete(); }} sx={{ color: 'error.main' }}>
        <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Löschen
      </MenuItem>
    </Menu>

    {/* Edit Poll Dialog */}
    <Dialog
      open={editOpen}
      onClose={handleCloseEdit}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Umfrage bearbeiten
      </DialogTitle>
      <DialogContent dividers sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <PollOptionsEditor value={editForm} onChange={setEditForm} allowReplace={false} autoFocus />
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handleCloseEdit} color="inherit">
          Abbrechen
        </Button>
        <Button
          onClick={handleEditSubmit}
          variant="contained"
          color="primary"
          disabled={submittingEdit}
        >
          {submittingEdit ? 'Wird gespeichert...' : 'Speichern'}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Event from a poll option */}
    {eventDialog.option && (
      <EventFormDialog
        key={eventDialog.key}
        open={eventDialog.open}
        onClose={() => setEventDialog(d => ({ ...d, open: false }))}
        onSaved={handleEventCreated}
        initialValues={eventValuesForOption(poll, eventDialog.option, postId)}
        pollOptionId={eventDialog.option.id}
        title="Event aus Umfrage-Option erstellen"
      />
    )}
    </>
  );
}

PollWidget.propTypes = {
  pollData: PropTypes.object.isRequired,
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func,
  /** Creator of the post or moderator, and team member (events need Frischling or higher). */
  canCreateEvent: PropTypes.bool,
  /** Post of the poll, linked in the description of events created from it. */
  postId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
