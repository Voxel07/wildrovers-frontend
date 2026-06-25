import React, { useEffect, useState, use, useCallback, useReducer } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { extractErrorMessage } from '../../helper/api';

// Mui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import BackButton from '../../components/Navigation/BackButton';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';

import ForumIcon from '@mui/icons-material/Forum';
import EventNoteIcon from '@mui/icons-material/EventNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';

// Quill for Reply Editor
import ForumQuill from '../../components/Forum/ForumQuill';

// Eigene
import Post from '../../components/Forum/Post';
import Answer from '../../components/Forum/Answer';
import PollWidget from '../../components/Forum/PollWidget';
import { AlertsContext } from '../../components/utils/AlertsManager';
import useAuth from '../../context/useAuth';
import { convertTimestamp } from '../../helper/converter';
import ForumBreadcrumbs from '../../components/Forum/ForumBreadcrumbs';
import ForumChips from '../../components/Forum/ForumChips';

const initialFetchState = {
  post: null,
  answers: [],
  associatedEvent: null,
  loading: true,
};

function fetchReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        post: null,
        answers: [],
        associatedEvent: null,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        post: action.payload.post,
        answers: action.payload.answers,
        associatedEvent: action.payload.associatedEvent,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        loading: false,
      };
    case 'OPTIMISTIC_ATTENDANCE': {
      if (!state.associatedEvent) return state;
      const { userName, status } = action.payload;

      let updatedAttendances = [...(state.associatedEvent.attendances || [])];
      const existingIndex = updatedAttendances.findIndex(a => a.userName === userName);
      if (existingIndex > -1) {
        updatedAttendances[existingIndex] = {
          ...updatedAttendances[existingIndex],
          status: status
        };
      } else {
        updatedAttendances.push({
          userName: userName,
          status: status
        });
      }

      let updatedNonRespondents = [...(state.associatedEvent.nonRespondents || [])];
      updatedNonRespondents = updatedNonRespondents.filter(name => name !== userName);

      return {
        ...state,
        associatedEvent: {
          ...state.associatedEvent,
          attendances: updatedAttendances,
          nonRespondents: updatedNonRespondents
        }
      };
    }
    case 'REVERT_EVENT':
      return {
        ...state,
        associatedEvent: action.payload
      };
    default:
      return state;
  }
}

export default function Forum_Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const alertsManagerRef = use(AlertsContext);

  const [state, dispatch] = useReducer(fetchReducer, initialFetchState);
  const { post, answers, associatedEvent, loading } = state;
  const userStatus = associatedEvent?.attendances?.find(a => a.userName === auth.user)?.status;

  const isLoggedIn = !!auth?.JWT;
  const isTeamMember = isLoggedIn && ['Frischling', 'Mitglied', 'Vorstand', 'Admin'].includes(auth?.roles);

  // Reply State
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Poll Dialog State
  const [createPollOpen, setCreatePollOpen] = useState(false);
  const [pollsVisible, setPollsVisible] = useState(true);
  const [eventVisible, setEventVisible] = useState(true);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollAllowMultiple, setPollAllowMultiple] = useState(false);
  const [pollAnonymous, setPollAnonymous] = useState(false);
  const [submittingPoll, setSubmittingPoll] = useState(false);
  const [deletePollId, setDeletePollId] = useState(null);

  const isCreatorOrAdmin = post && auth.user && (post.creator === auth.user || auth.roles === 'Admin');

  const handleClosePollDialog = () => {
    setCreatePollOpen(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollAllowMultiple(false);
    setPollAnonymous(false);
  };

  const handleAddOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    if (pollOptions.length <= 2) {
      alertsManagerRef.current.showAlert('warning', 'Eine Umfrage muss mindestens 2 Optionen haben.');
      return;
    }
    setPollOptions(pollOptions.filter((_, idx) => idx !== index));
  };

  const handleCreatePollSubmit = () => {
    if (!pollQuestion.trim()) {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib eine Umfrage-Frage ein.');
      return;
    }

    const filteredOptions = pollOptions.filter(opt => opt.trim() !== '');
    if (filteredOptions.length < 2) {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib mindestens 2 Optionen ein.');
      return;
    }

    setSubmittingPoll(true);
    const optionsPayload = filteredOptions.map(opt => ({ optionText: opt }));

    api.post(`/forum/poll/create?post=${id}`, {
      question: pollQuestion,
      allowMultiple: pollAllowMultiple,
      anonymous: pollAnonymous,
      options: optionsPayload
    })
      .then(() => {
        alertsManagerRef.current.showAlert('success', 'Umfrage erfolgreich hinzugefügt!');
        handleClosePollDialog();
        fetchData(true);
      })
      .catch(error => {
        console.error("Failed to create poll", error);
        const status = error.response?.status || 500;
        const msg = extractErrorMessage(error);
        alertsManagerRef.current.showAlert('error', `${status}: ${msg}`);
      })
      .finally(() => {
        setSubmittingPoll(false);
      });
  };

  const handleDeletePoll = (pollId) => {
    setDeletePollId(pollId);
  };

  const handleConfirmDeletePoll = () => {
    if (!deletePollId) return;
    const pollId = deletePollId;
    setDeletePollId(null);

    api.delete(`/forum/poll/delete?poll=${pollId}`)
      .then(() => {
        alertsManagerRef.current.showAlert('success', 'Umfrage erfolgreich gelöscht');
        fetchData(true);
      })
      .catch(error => {
        console.error("Failed to delete poll", error);
        const status = error.response?.status || 500;
        const msg = extractErrorMessage(error);
        alertsManagerRef.current.showAlert('error', `${status}: ${msg}`);
      });
  };

  // Fetch post, answers, and associated event
  const fetchData = useCallback((silent = false) => {
    if (!silent) {
      dispatch({ type: 'FETCH_START' });
    }

    Promise.all([
      api.get("/forum/post", { params: { post: id } }),
      api.get("/forum/answer", { params: { post: id } }),
      api.get(`/event/by-post/${id}`).then(res => res.data).catch(() => null),
    ])
      .then(([postRes, answersRes, eventData]) => {
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            post: postRes.data?.[0] ?? null,
            answers: answersRes.data ?? [],
            associatedEvent: eventData,
          },
        });
      })
      .catch(error => {
        console.error("Error fetching post/answers", error);
        const status = error.response?.status || 0;
        const msg = extractErrorMessage(error);
        if (status === 429) {
          alertsManagerRef.current.showAlert('warning', 'Zu viele Anfragen — bitte warte einen Moment.');
        } else {
          alertsManagerRef.current.showAlert('error', `Fehler beim Laden des Posts: ${msg}`);
        }
        dispatch({ type: 'FETCH_FAILURE' });
      });
  }, [id, alertsManagerRef]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReplySubmit = () => {
    if (!replyContent || replyContent.trim() === '' || replyContent === '<p><br></p>') {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib eine Antwort ein');
      return;
    }

    setSubmittingReply(true);
    api.put(`/forum/answer?post=${id}`, {
      content: replyContent
    })
      .then(response => {
        alertsManagerRef.current.showAlert('success', 'Antwort erfolgreich hinzugefügt');
        setReplyContent('');
        fetchData(true); // Reload post & answers silently
      })
      .catch(error => {
        console.error(error);
        const status = error.response?.status || 500;
        const data = extractErrorMessage(error);
        alertsManagerRef.current.showAlert('error', `${status}: ${data}`);
      })
      .finally(() => {
        setSubmittingReply(false);
      });
  };

  const handleAttendance = (status) => {
    if (!associatedEvent) return;

    // Backup current associatedEvent in case of failure
    const backupEvent = associatedEvent;

    // Optimistically update the UI state
    dispatch({
      type: 'OPTIMISTIC_ATTENDANCE',
      payload: { userName: auth.user, status }
    });

    api.post(`/event/${associatedEvent.id}/attendance`, { status })
      .then(() => {
        fetchData(true); // Silent refresh to ensure state consistency with the backend
      })
      .catch(err => {
        console.error("Error setting attendance", err);

        // Revert the optimistic update immediately
        dispatch({
          type: 'REVERT_EVENT',
          payload: backupEvent
        });

        const statusErr = err.response?.status || 500;
        const rawData = err.response?.data;
        const msg = typeof rawData === 'object'
          ? (rawData.message || rawData.details || JSON.stringify(rawData))
          : (rawData || 'Teilnahme konnte nicht aktualisiert werden');

        alertsManagerRef.current.showAlert('error', `${statusErr}: ${msg}`);
      });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Dieser Post existiert nicht oder Sie haben keine Berechtigung, ihn anzusehen.</Typography>
        <BackButton sx={{ mt: 3 }} />
      </Container>
    );
  }

  const postChips = [
    { tooltip: "Ersteller", icon: <PersonOutlineIcon />, label: post.creator || 'Unbekannt' },
    { tooltip: "Erstellungsdatum", icon: <EventNoteIcon />, label: convertTimestamp(post.creationDate) },
    { tooltip: "Antworten", icon: <ForumIcon />, label: post.answerCount },
    { tooltip: "Aufrufe", icon: <VisibilityIcon />, label: post.views }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6, px: { xs: 1, md: 3 } }}>
      <ForumBreadcrumbs
        categoryId={post.categoryId}
        categoryName={post.categoryName}
        topicId={post.topicId}
        topicName={post.topicName}
        postTitle={post.title}
      />

      <BackButton
        sx={{ mb: 3 }}
        variant="text"
      />

      {/* Post content styled as Accordion (same as topics) */}
      <Accordion expanded sx={{ mb: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
        <AccordionSummary
          aria-controls="post-header-content"
          id="post-header"
          sx={{
            cursor: 'default',
            '& .MuiAccordionSummary-content': {
              width: '100%',
              margin: 0,
            },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
          }}
        >
          <Grid container spacing={2} sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {post.title}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <ForumChips items={postChips} />
            </Grid>
          </Grid>
        </AccordionSummary>
        <Divider />
        <AccordionDetails sx={{ p: 0 }}>
          <Post post={post} onUpdate={() => fetchData(true)} onDelete={() => navigate("/Forum/Topic/" + post.topicId)} onAddPoll={() => setCreatePollOpen(true)} pollsVisible={pollsVisible} onTogglePolls={() => setPollsVisible(v => !v)} />
        </AccordionDetails>
      </Accordion>

      {/* Render Polls if they exist in the post data */}
      {pollsVisible && post.polls && post.polls.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            {post.polls.map(poll => (
              <Grid key={poll.id} size={post.polls.length === 1 ? { xs: 12 } : { xs: 12, md: 6 }}>
                <PollWidget pollData={poll} canDelete={isCreatorOrAdmin} onDelete={() => handleDeletePoll(poll.id)} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Associated Event Details & Attendance */}
      {associatedEvent && (
        <Card sx={{ mb: 4, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: 'rgba(255, 255, 255, 0.02)', borderRadius: 2 }}>
          <CardContent sx={{ py: eventVisible ? 3 : 1.5, px: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'primary.main' }}>
                <EventNoteIcon />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Zugehöriges Event: {associatedEvent.title}
                </Typography>
              </Stack>
              <Tooltip title={eventVisible ? 'Event ausblenden' : 'Event einblenden'}>
                <IconButton size="small" onClick={() => setEventVisible(v => !v)}>
                  {eventVisible ? <VisibilityIcon fontSize="small" /> : <VisibilityIcon fontSize="small" sx={{ opacity: 0.3 }} />}
                </IconButton>
              </Tooltip>
            </Stack>
            <Collapse in={eventVisible}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, mt: 1 }}>
                Ort: <strong>{associatedEvent.location}</strong> | Datum: <strong>{(() => {
                  if (!associatedEvent.eventDate) return '';
                  try {
                    const start = new Date(associatedEvent.eventDate);
                    let dateText = start.toLocaleDateString("de-DE", {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) + ' Uhr';
                    if (associatedEvent.eventEndDate) {
                      const end = new Date(associatedEvent.eventEndDate);
                      if (start.toDateString() === end.toDateString()) {
                        dateText += ' bis ' + end.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
                      } else {
                        dateText += ' bis ' + end.toLocaleDateString("de-DE", {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) + ' Uhr';
                      }
                    }
                    return dateText;
                  } catch (e) {
                    return associatedEvent.eventDate;
                  }
                })()}</strong>
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2.5 }}>
                {/* YES / Zusagen */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box
                    onClick={isLoggedIn ? () => handleAttendance('YES') : undefined}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: userStatus === 'YES' ? 'rgba(76, 175, 80, 0.12)' : 'rgba(76, 175, 80, 0.03)',
                      border: '2px solid',
                      borderColor: userStatus === 'YES' ? 'rgba(76, 175, 80, 0.5)' : 'rgba(76, 175, 80, 0.12)',
                      height: '100%',
                      cursor: isLoggedIn ? 'pointer' : 'default',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': isLoggedIn ? {
                        bgcolor: userStatus === 'YES' ? 'rgba(76, 175, 80, 0.18)' : 'rgba(76, 175, 80, 0.08)',
                        borderColor: 'rgba(76, 175, 80, 0.35)',
                        transform: 'translateY(-2px)'
                      } : {}
                    }}
                  >
                    <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                      🟢 Zusagen ({associatedEvent.attendances?.filter(a => a.status === 'YES').length || 0})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                      {isTeamMember
                        ? (associatedEvent.attendances?.filter(a => a.status === 'YES').map(a => a.userName).join(', ') || 'Keine Zusagen')
                        : '🔒 Nur für Teammitglieder sichtbar'}
                    </Typography>
                  </Box>
                </Grid>

                {/* NO / Absagen */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box
                    onClick={isLoggedIn ? () => handleAttendance('NO') : undefined}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: userStatus === 'NO' ? 'rgba(244, 67, 54, 0.12)' : 'rgba(244, 67, 54, 0.03)',
                      border: '2px solid',
                      borderColor: userStatus === 'NO' ? 'rgba(244, 67, 54, 0.5)' : 'rgba(244, 67, 54, 0.12)',
                      height: '100%',
                      cursor: isLoggedIn ? 'pointer' : 'default',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': isLoggedIn ? {
                        bgcolor: userStatus === 'NO' ? 'rgba(244, 67, 54, 0.18)' : 'rgba(244, 67, 54, 0.08)',
                        borderColor: 'rgba(244, 67, 54, 0.35)',
                        transform: 'translateY(-2px)'
                      } : {}
                    }}
                  >
                    <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                      🔴 Absagen ({associatedEvent.attendances?.filter(a => a.status === 'NO').length || 0})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                      {isTeamMember
                        ? (associatedEvent.attendances?.filter(a => a.status === 'NO').map(a => a.userName).join(', ') || 'Keine Absagen')
                        : '🔒 Nur für Teammitglieder sichtbar'}
                    </Typography>
                  </Box>
                </Grid>

                {/* MAYBE / Vielleicht */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box
                    onClick={isLoggedIn ? () => handleAttendance('MAYBE') : undefined}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: userStatus === 'MAYBE' ? 'rgba(255, 152, 0, 0.12)' : 'rgba(255, 152, 0, 0.03)',
                      border: '2px solid',
                      borderColor: userStatus === 'MAYBE' ? 'rgba(255, 152, 0, 0.5)' : 'rgba(255, 152, 0, 0.12)',
                      height: '100%',
                      cursor: isLoggedIn ? 'pointer' : 'default',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': isLoggedIn ? {
                        bgcolor: userStatus === 'MAYBE' ? 'rgba(255, 152, 0, 0.18)' : 'rgba(255, 152, 0, 0.08)',
                        borderColor: 'rgba(255, 152, 0, 0.35)',
                        transform: 'translateY(-2px)'
                      } : {}
                    }}
                  >
                    <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                      🟡 Vielleicht ({associatedEvent.attendances?.filter(a => a.status === 'MAYBE').length || 0})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                      {isTeamMember
                        ? (associatedEvent.attendances?.filter(a => a.status === 'MAYBE').map(a => a.userName).join(', ') || 'Keine Einträge')
                        : '🔒 Nur für Teammitglieder sichtbar'}
                    </Typography>
                  </Box>
                </Grid>

                {/* NO RESPONSE / Ausstehend */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.02)', border: '2px solid rgba(255, 255, 255, 0.1)', height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                      ⚪ Rückmeldung ausstehend ({associatedEvent.nonRespondents?.length || 0})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                      {isTeamMember
                        ? (associatedEvent.nonRespondents?.join(', ') || 'Keine Ausstehenden')
                        : '🔒 Nur für Teammitglieder sichtbar'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Answers section */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          mb: { xs: 1, md: 2 },
          mt: 0,
          color: 'primary.main',
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        Antworten ({answers.length})
      </Typography>

      <Grid container spacing={3} sx={{ flexDirection: 'column' }}>
        {answers.length ? (
          answers.map(answer => (
            <Grid key={answer.id}>
              <Answer answer={answer} onUpdate={() => fetchData(true)} />
            </Grid>
          ))
        ) : (
          <Grid>
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Noch keine Antworten. Schreibe die erste Antwort!</Typography>
            </Card>
          </Grid>
        )}

        {/* Reply Editor Form */}
        {auth.user ? (
          <Grid sx={{ mt: 4 }}>
            <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Antwort verfassen
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <ForumQuill
                    value={replyContent}
                    onChange={setReplyContent}
                    placeholder="Schreibe eine Antwort..."
                    style={{ height: 200, marginBottom: 50 }}
                  />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon />}
                  onClick={handleReplySubmit}
                  disabled={submittingReply}
                >
                  {submittingReply ? "Wird gesendet..." : "Antwort senden"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid sx={{ mt: 4 }}>
            <Card sx={{ p: 3, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Typography color="text.secondary">
                Bitte logge dich ein, um eine Antwort zu verfassen.
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog for confirming poll deletion */}
      <Dialog
        open={deletePollId !== null}
        onClose={() => setDeletePollId(null)}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 2,
            minWidth: 320
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          Umfrage löschen
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchtest du diese Umfrage wirklich unwiderruflich löschen? Alle Stimmen gehen dabei verloren.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeletePollId(null)} color="inherit">
            Abbrechen
          </Button>
          <Button
            onClick={handleConfirmDeletePoll}
            variant="contained"
            color="error"
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for creating a poll */}
      <Dialog
        open={createPollOpen}
        onClose={handleClosePollDialog}
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
          Umfrage hinzufügen
        </DialogTitle>
        <DialogContent dividers sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <TextField
            autoFocus
            margin="dense"
            label="Frage / Thema der Umfrage"
            type="text"
            fullWidth
            variant="outlined"
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
            Optionen
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {pollOptions.map((option, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <TextField
                  placeholder={`Option ${index + 1}`}
                  type="text"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveOption(index)}
                  disabled={pollOptions.length <= 2}
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
            onClick={handleAddOption}
            sx={{ mb: 3 }}
          >
            Option hinzufügen
          </Button>

          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={pollAllowMultiple}
                  onChange={(e) => setPollAllowMultiple(e.target.checked)}
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
                  checked={pollAnonymous}
                  onChange={(e) => setPollAnonymous(e.target.checked)}
                  color="primary"
                />
              }
              label="Anonyme Umfrage (Wähler bleiben unsichtbar)"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleClosePollDialog} color="inherit">
            Abbrechen
          </Button>
          <Button
            onClick={handleCreatePollSubmit}
            variant="contained"
            color="primary"
            disabled={submittingPoll}
          >
            {submittingPoll ? 'Wird erstellt...' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
