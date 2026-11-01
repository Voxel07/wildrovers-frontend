import React, { useState, useEffect, use, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { extractErrorMessage } from '../../helper/api';
import useSessionDraft from '../../hooks/useSessionDraft';

// Quill
import ForumQuill from '../../components/Forum/ForumQuill';

// MUI
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Checkbox,
  Container,
  FormControlLabel,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PollIcon from '@mui/icons-material/Poll';
// Feedback & Auth
import { AlertsContext } from '../../components/utils/AlertsManager';
import useAuth from '../../context/useAuth';
import BackButton from '../../components/Navigation/BackButton';
import PollOptionsEditor from '../../components/Forum/PollOptionsEditor';
import { createEmptyPoll, filledOptions, toPollPayload, validatePoll } from '../../helper/pollForm';

const noModules = { toolbar: false };

export default function TextEditor(props) {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const alertsManagerRef = use(AlertsContext);

  const isReadOnly = props.readonly === true || props.readonly === 'true';

  // Drafts survive an expired session or a login redirect (per topic, this tab only).
  const draftKey = !isReadOnly && location.state?.topicId ? `draft:post:${location.state.topicId}` : null;
  const [title, setTitle, clearTitleDraft] = useSessionDraft(draftKey && `${draftKey}:title`, '');
  const [content, setContent, clearContentDraft] = useSessionDraft(draftKey && `${draftKey}:content`, props.value || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [hasPoll, setHasPoll] = useState(false);
  const [pollDialogOpen, setPollDialogOpen] = useState(false);
  const [pollForm, setPollForm] = useState(createEmptyPoll);

  const topicId = location.state?.topicId;

  useEffect(() => {
    const isReadOnly = props.readonly === true || props.readonly === 'true';
    if (!topicId && !isReadOnly) {
      alertsManagerRef.current?.showAlert('error', 'Fehler: Kein Thema-Kontext gefunden.');
    }
  }, [topicId, props.readonly, alertsManagerRef]);

  const handleSavePollConfig = () => {
    const validationError = validatePoll(pollForm);
    if (validationError) {
      alertsManagerRef.current.showAlert('warning', validationError);
      return;
    }
    setPollDialogOpen(false);
    setHasPoll(true);
  };

  const handleCancelPollDialog = () => {
    setPollDialogOpen(false);
    // A poll that was never saved is not attached to the post.
    if (validatePoll(pollForm)) setHasPoll(false);
  };

  const handleSavePost = () => {
    if (!title.trim()) {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib einen Titel ein');
      return;
    }
    if (!content.trim() || content === '<p><br></p>') {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib einen Inhalt ein');
      return;
    }
    if (!topicId) {
      alertsManagerRef.current.showAlert('error', 'Fehler: Kein Thema-Kontext gefunden.');
      return;
    }

    setSaving(true);
    setError(null);

    api.put(`/forum/post?topic=${topicId}`, { title, content })
      .then(response => {
        const postId = response.data;
        clearTitleDraft();
        clearContentDraft();
        alertsManagerRef.current.showAlert('success', 'Beitrag erfolgreich erstellt!');

        if (hasPoll && !validatePoll(pollForm)) {
          api.post(`/forum/poll/create?post=${postId}`, toPollPayload(pollForm))
            .then(() => {
              alertsManagerRef.current.showAlert('success', 'Umfrage erfolgreich hinzugefügt!');
              navigate(`/Forum/Topic/${topicId}`);
            })
            .catch(err => {
              console.error('Failed to create poll', err);
              alertsManagerRef.current.showAlert('warning', 'Beitrag erstellt, Umfrage konnte nicht gespeichert werden.');
              navigate(`/Forum/Topic/${topicId}`);
            });
        } else {
          navigate(`/Forum/Topic/${topicId}`);
        }
      })
      .catch(err => {
        console.error(err);
        const status = err.response?.status || 500;
        const data = extractErrorMessage(err) || 'Fehler beim Speichern des Beitrags';
        setError(`${status}: ${data}`);
        setSaving(false);
      });
  };





  // Read-only viewer
  if (isReadOnly) {
    return (
      <Box className="quill-viewer">
        <ForumQuill value={props.value || ''} readOnly />
      </Box>
    );
  }

  // Block if no topicId context
  if (!topicId) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Fehler: Kein Thema-Kontext gefunden.
        </Alert>
        <BackButton variant="contained" color="primary">
          Zurück zum Forum
        </BackButton>
      </Container>
    );
  }

  // Editor-specific styles: clickable images + resize handle indicator
  const editorStyles = `
    .ql-editor img {
      max-width: 100%;
      height: auto;
      cursor: pointer;
      transition: outline 0.15s;
    }
    .ql-editor img:hover {
      outline: 2px solid rgba(255, 152, 0, 0.4);
      outline-offset: 2px;
    }
    .ql-editor.ql-blank::before {
      color: rgba(255, 255, 255, 0.55) !important;
      font-style: italic;
    }
  `;

  // Creation editor — styled to match forum aesthetic
  return (
    <>
      <style>{editorStyles}</style>
    <Container maxWidth="xl" sx={{ px: { xs: 1, md: 3 }, py: 3 }}>

      {/* Back */}
      <BackButton variant="text" sx={{ mb: 2 }} />

      {/* Page heading */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Neuen Beitrag erstellen
        </Typography>
      </Box>

      {/* Editor card — same border/bg tokens as Accordion */}
      <Box sx={{
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}>
        {/* Header bar matching AccordionSummary look */}
        <Box sx={{
          px: 3,
          py: 2,
          borderBottom: '2px solid rgba(255, 255, 255, 0.08)',
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Beitragsdetails
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={3}>

            {/* Title */}
            <TextField
              label="Beitragstitel"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              inputProps={{ maxLength: 50 }}
              helperText={`${title.length}/50`}
            />

            {/* Rich text editor — resizable container */}
            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'rgba(255, 255, 255, 0.55)' }}>
                Inhalt (Bilder per Drag &amp; Drop oder Copy-Paste einfügen)
              </Typography>
              <Box
                sx={{
                  resize: 'vertical',
                  overflow: 'auto',
                  minHeight: 200,
                  height: 350,
                  '& .quill': { height: '100%' },
                  '& .ql-container': { height: 'calc(100% - 42px) !important' },
                }}
              >
                <ForumQuill
                  value={content}
                  onChange={setContent}
                  placeholder="Schreibe deinen Beitrag hier..."
                />
              </Box>
            </Box>

            <Divider />

            {/* Poll toggle */}
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasPoll}
                    onChange={(e) => {
                      if (e.target.checked) setPollDialogOpen(true);
                      else setHasPoll(false);
                    }}
                    color="primary"
                  />
                }
                label="Umfrage zu diesem Beitrag hinzufügen"
              />
              {hasPoll && (
                <Button size="small" startIcon={<PollIcon />} onClick={() => setPollDialogOpen(true)} variant="outlined">
                  Umfrage bearbeiten
                </Button>
              )}
            </Stack>

            {hasPoll && pollForm.question && (
              <Alert severity="info" sx={{ bgcolor: 'rgba(255,152,0,0.08)', border: '1px solid rgba(255,152,0,0.2)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Eingerichtete Umfrage: {pollForm.question}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Optionen: {filledOptions(pollForm).map(o => o.optionText).join(', ')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Mehrfachauswahl: {pollForm.allowMultiple ? 'Ja' : 'Nein'} · Anonym: {pollForm.anonymous ? 'Ja' : 'Nein'}
                </Typography>
              </Alert>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {/* Submit / Cancel */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <BackButton
                variant="outlined"
                color="error"
                size="large"
                disabled={saving}
                sx={{ py: 1.5, px: 4 }}
                startIcon={null}
              >
                Abbrechen
              </BackButton>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<SendIcon />}
                onClick={handleSavePost}
                disabled={saving}
                sx={{ py: 1.5, px: 4 }}
              >
                {saving ? 'Wird gespeichert...' : 'Beitrag speichern'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>



      {/* Poll setup dialog */}
      <Dialog open={pollDialogOpen} onClose={handleCancelPollDialog} maxWidth="sm" fullWidth disableScrollLock>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Umfrage erstellen</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <PollOptionsEditor value={pollForm} onChange={setPollForm} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelPollDialog} color="error">
            Abbrechen
          </Button>
          <Button onClick={handleSavePollConfig} variant="contained" color="primary">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
    </>
  );
}
