import React, { useState, useEffect, use } from 'react';
import PropTypes from 'prop-types';
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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Eigene
import useAuth from '../../context/useAuth';
import { AlertsContext } from '../../components/utils/AlertsManager';

export default function PollWidget(props) {
  const { pollData, canDelete, onDelete } = props;
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
  const [editQuestion, setEditQuestion] = useState('');
  const [editOptions, setEditOptions] = useState([]);
  const [editAllowMultiple, setEditAllowMultiple] = useState(false);
  const [editAnonymous, setEditAnonymous] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);

  const handleOpenEdit = () => {
    setEditQuestion(poll.question || '');
    setEditOptions(poll.options?.map(o => ({ id: o.id, text: o.optionText })) || []);
    setEditAllowMultiple(poll.allowMultiple || false);
    setEditAnonymous(poll.anonymous || false);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
  };

  const handleEditOptionChange = (index, value) => {
    const updated = [...editOptions];
    updated[index] = { ...updated[index], text: value };
    setEditOptions(updated);
  };

  const handleAddEditOption = () => {
    setEditOptions([...editOptions, { id: null, text: '' }]);
  };

  const handleRemoveEditOption = (index) => {
    if (editOptions.length <= 2) {
      alertsManagerRef.current.showAlert('warning', 'Eine Umfrage muss mindestens 2 Optionen haben.');
      return;
    }
    setEditOptions(editOptions.filter((_, i) => i !== index));
  };

  const handleEditSubmit = () => {
    if (!editQuestion.trim()) {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib eine Umfrage-Frage ein.');
      return;
    }
    const filled = editOptions.filter(o => o.text.trim() !== '');
    if (filled.length < 2) {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib mindestens 2 Optionen ein.');
      return;
    }

    setSubmittingEdit(true);
    const payload = {
      question: editQuestion,
      allowMultiple: editAllowMultiple,
      anonymous: editAnonymous,
      options: editOptions.map(o => ({
        id: o.id,               // null for new, existing id for rename
        optionText: o.text
      }))
    };

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
              <IconButton
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
                  <FormControlLabel
                    key={option.id}
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
                ))}
              </Box>
            ) : (
              <RadioGroup
                value={selectedOptions[0] || ''}
                onChange={(e) => setSelectedOptions([Number(e.target.value)])}
              >
                {poll.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio color="primary" />}
                    label={option.optionText}
                    sx={{ mb: 1 }}
                  />
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
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {optVotes} {optVotes === 1 ? 'Stimme' : 'Stimmen'} ({percentage}%)
                    </Typography>
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
        <TextField
          autoFocus
          margin="dense"
          label="Frage / Thema der Umfrage"
          type="text"
          fullWidth
          variant="outlined"
          value={editQuestion}
          onChange={(e) => setEditQuestion(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
          Optionen
        </Typography>

        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {editOptions.map((opt, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <TextField
                placeholder={`Option ${index + 1}`}
                type="text"
                fullWidth
                variant="outlined"
                size="small"
                value={opt.text}
                onChange={(e) => handleEditOptionChange(index, e.target.value)}
              />
              <IconButton
                color="error"
                onClick={() => handleRemoveEditOption(index)}
                disabled={editOptions.length <= 2}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
        </Stack>

        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          size="small"
          onClick={handleAddEditOption}
          sx={{ mb: 3 }}
        >
          Option hinzufügen
        </Button>

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={editAllowMultiple}
                onChange={(e) => setEditAllowMultiple(e.target.checked)}
                color="primary"
              />
            }
            label="Mehrfachauswahl erlauben"
          />
        </Box>

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={editAnonymous}
                onChange={(e) => setEditAnonymous(e.target.checked)}
                color="primary"
              />
            }
            label="Anonyme Umfrage (Wähler bleiben unsichtbar)"
          />
        </Box>
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
    </>
  );
}

PollWidget.propTypes = {
  pollData: PropTypes.object.isRequired,
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func,
};
