import React, { useState, useEffect, use, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../helper/api';

// Quill
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import PollIcon from '@mui/icons-material/Poll';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Feedback & Auth
import { AlertsContext } from '../../components/utils/AlertsManager';
import useAuth from '../../context/useAuth';

export default function TextEditor(props) {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const alertsManagerRef = use(AlertsContext);

  const isReadOnly = props.readonly === true || props.readonly === 'true';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(props.value || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDialogOpen, setPollDialogOpen] = useState(false);

  const topicId = location.state?.topicId;
  const quillRef = useRef(null);

  // Custom image handler: upload immediately, insert URL (avoids base64 in content)
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/forum/img/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data?.url;
        if (url && quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, 'image', url);
          editor.setSelection(range.index + 1);
        }
      } catch (err) {
        console.error('Image upload failed', err);
        alertsManagerRef.current.showAlert('error', 'Bild konnte nicht hochgeladen werden');
      }
    };
  }, [alertsManagerRef]);

  useEffect(() => {
    if (isReadOnly && props.value !== undefined) {
      setContent(props.value);
    }
  }, [props.value, isReadOnly]);

  const handleAddOption = () => setPollOptions([...pollOptions, '']);

  const handleRemoveOption = (index) => {
    if (pollOptions.length <= 2) return;
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, val) => {
    const updated = [...pollOptions];
    updated[index] = val;
    setPollOptions(updated);
  };

  const handleSavePollConfig = () => {
    if (!pollQuestion.trim()) {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib eine Umfrage-Frage ein');
      return;
    }
    if (pollOptions.filter(o => o.trim() !== '').length < 2) {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib mindestens 2 Optionen ein');
      return;
    }
    setPollDialogOpen(false);
    setHasPoll(true);
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
        alertsManagerRef.current.showAlert('success', 'Beitrag erfolgreich erstellt!');

        if (hasPoll && pollQuestion.trim()) {
          const optionsPayload = pollOptions
            .filter(opt => opt.trim() !== '')
            .map(opt => ({ optionText: opt }));

          api.post(`/forum/poll/create?post=${postId}`, {
            question: pollQuestion,
            options: optionsPayload
          })
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
        const data = err.response?.data || 'Fehler beim Speichern des Beitrags';
        setError(`${status}: ${data}`);
        setSaving(false);
      });
  };

  const myModules = {
    toolbar: {
      container: [
        [{ size: ['huge', 'large', false, 'small'] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image'],
        [{ align: [false, 'center', 'right'] }],
        [{ color: [] }, { background: [] }],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  };

  const noModules = { toolbar: false };

  // Read-only viewer
  if (isReadOnly) {
    return (
      <Box className="quill-viewer">
        <ReactQuill theme="snow" modules={noModules} value={content} readOnly />
      </Box>
    );
  }

  // Creation editor — styled to match forum aesthetic
  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, md: 3 }, py: 3 }}>

      {/* Back */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="text" sx={{ mb: 2 }}>
        Zurück
      </Button>

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
            />

            {/* Rich text editor */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Inhalt (Bilder per Drag &amp; Drop oder Copy-Paste einfügen)
              </Typography>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                modules={myModules}
                value={content}
                onChange={setContent}
                placeholder="Schreibe deinen Beitrag hier..."
                style={{ height: 350, marginBottom: 50 }}
              />
            </Box>

            <Divider />

            {/* Poll toggle */}
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
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

            {hasPoll && pollQuestion && (
              <Alert severity="info" sx={{ bgcolor: 'rgba(255,152,0,0.08)', border: '1px solid rgba(255,152,0,0.2)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Eingerichtete Umfrage: {pollQuestion}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Optionen: {pollOptions.filter(o => o.trim() !== '').join(', ')}
                </Typography>
              </Alert>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {/* Submit */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
      <Dialog open={pollDialogOpen} onClose={() => setPollDialogOpen(false)} maxWidth="sm" fullWidth disableScrollLock>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Umfrage erstellen</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Fragestellung"
              variant="outlined"
              fullWidth
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
            />
            <Typography variant="subtitle2" color="text.secondary">Antwortoptionen</Typography>
            {pollOptions.map((option, idx) => (
              <Stack direction="row" spacing={1} key={idx} alignItems="center">
                <TextField
                  label={`Option ${idx + 1}`}
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={option}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                />
                <IconButton color="error" onClick={() => handleRemoveOption(idx)} disabled={pollOptions.length <= 2}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
            <Button startIcon={<AddIcon />} onClick={handleAddOption} variant="outlined" size="small" sx={{ width: 'fit-content' }}>
              Option hinzufügen
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setPollDialogOpen(false); if (!pollQuestion.trim()) setHasPoll(false); }} color="error">
            Abbrechen
          </Button>
          <Button onClick={handleSavePollConfig} variant="contained" color="primary">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}
