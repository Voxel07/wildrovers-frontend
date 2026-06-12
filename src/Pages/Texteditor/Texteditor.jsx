import React, { useState, useEffect, use, useRef, useCallback, useReducer } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../helper/api';

// Quill
import ReactQuill, { Quill } from 'react-quill-new';
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

const noModules = { toolbar: false };

let _nextOptionId = 0;
const makeOption = (value = '') => ({ id: _nextOptionId++, value });

const initialPollState = {
  hasPoll: false,
  pollQuestion: '',
  pollOptions: [makeOption(), makeOption()],
  pollDialogOpen: false,
  allowMultiple: false,
};

function pollReducer(state, action) {
  switch (action.type) {
    case 'OPEN_DIALOG':
      return { ...state, pollDialogOpen: true };
    case 'CLOSE_DIALOG':
      return { ...state, pollDialogOpen: false };
    case 'SET_HAS_POLL':
      return { ...state, hasPoll: action.payload };
    case 'ADD_OPTION':
      return { ...state, pollOptions: [...state.pollOptions, makeOption()] };
    case 'REMOVE_OPTION':
      return {
        ...state,
        pollOptions: state.pollOptions.filter((opt) => opt.id !== action.payload)
      };
    case 'SET_OPTION': {
      const { id, value } = action.payload;
      return {
        ...state,
        pollOptions: state.pollOptions.map((opt) => opt.id === id ? { ...opt, value } : opt)
      };
    }
    case 'SET_QUESTION':
      return { ...state, pollQuestion: action.payload };
    case 'TOGGLE_ALLOW_MULTIPLE':
      return { ...state, allowMultiple: action.payload };
    case 'SAVE_POLL_CONFIG':
      return {
        ...state,
        pollDialogOpen: false,
        hasPoll: true,
      };
    default:
      return state;
  }
}

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

  const [pollState, dispatchPoll] = useReducer(pollReducer, initialPollState);
  const { hasPoll, pollQuestion, pollOptions, pollDialogOpen, allowMultiple } = pollState;

  const topicId = location.state?.topicId;
  const quillRef = useRef(null);

  // Image resize state
  const [resizeTarget, setResizeTarget] = useState(null); // { blot, domNode } | null
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startWidth: 0 });
  const outlineRef = useRef(null);   // selection border DOM node
  const handleRef = useRef(null);    // drag handle DOM node
  const rafRef = useRef(null);

  // Keep resize-handle position in sync with the image via rAF
  const syncHandlePos = useCallback(() => {
    if (!resizeTarget || !outlineRef.current || !handleRef.current) return;
    const rect = resizeTarget.domNode.getBoundingClientRect();
    outlineRef.current.style.top = `${rect.top}px`;
    outlineRef.current.style.left = `${rect.left}px`;
    outlineRef.current.style.width = `${rect.width}px`;
    outlineRef.current.style.height = `${rect.height}px`;
    handleRef.current.style.top = `${rect.bottom - 8}px`;
    handleRef.current.style.left = `${rect.right - 8}px`;
    rafRef.current = requestAnimationFrame(syncHandlePos);
  }, [resizeTarget]);

  useEffect(() => {
    if (!resizeTarget) return;
    // Set initial position before first paint
    const rect = resizeTarget.domNode.getBoundingClientRect();
    if (outlineRef.current) {
      outlineRef.current.style.top = `${rect.top}px`;
      outlineRef.current.style.left = `${rect.left}px`;
      outlineRef.current.style.width = `${rect.width}px`;
      outlineRef.current.style.height = `${rect.height}px`;
    }
    if (handleRef.current) {
      handleRef.current.style.top = `${rect.bottom - 8}px`;
      handleRef.current.style.left = `${rect.right - 8}px`;
    }
    rafRef.current = requestAnimationFrame(syncHandlePos);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [resizeTarget, syncHandlePos]);

  // Commit image width through Quill's API so it persists in the document model
  const commitImageWidth = useCallback((pxWidth) => {
    if (!resizeTarget || !quillRef.current) return;
    const editor = quillRef.current.getEditor();
    try {
      const index = editor.getIndex(resizeTarget.blot);
      editor.formatText(index, 1, 'width', `${Math.round(Math.max(60, pxWidth))}px`);
    } catch (e) {
      console.error('Failed to format image width', e);
    }
  }, [resizeTarget]);

  // Drag handlers
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!resizeTarget) return;
    dragRef.current = {
      startX: e.clientX,
      startWidth: resizeTarget.domNode.getBoundingClientRect().width,
    };
    setIsDragging(true);
  }, [resizeTarget]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => {
      const dx = e.clientX - dragRef.current.startX;
      commitImageWidth(dragRef.current.startWidth + dx);
    };
    const handleUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, commitImageWidth]);

  // Custom image handler: upload immediately, insert URL (avoids base64 in content)
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.style.display = 'none';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        document.body.removeChild(input);
        return;
      }
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
      } finally {
        document.body.removeChild(input);
      }
    };

    document.body.appendChild(input);
    input.click();
  }, [alertsManagerRef]);



  const handleAddOption = () => dispatchPoll({ type: 'ADD_OPTION' });

  const handleRemoveOption = (id) => {
    if (pollOptions.length <= 2) return;
    dispatchPoll({ type: 'REMOVE_OPTION', payload: id });
  };

  const handleOptionChange = (id, val) => {
    dispatchPoll({ type: 'SET_OPTION', payload: { id, value: val } });
  };

  const handleSavePollConfig = () => {
    if (!pollQuestion.trim()) {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib eine Umfrage-Frage ein');
      return;
    }
    if (pollOptions.filter(o => o.value.trim() !== '').length < 2) {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib mindestens 2 Optionen ein');
      return;
    }
    dispatchPoll({ type: 'SAVE_POLL_CONFIG' });
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
            .filter(opt => opt.value.trim() !== '')
            .map(opt => ({ optionText: opt.value }));

          api.post(`/forum/poll/create?post=${postId}`, {
            question: pollQuestion,
            options: optionsPayload,
            allowMultiple: allowMultiple
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

  // Click-to-select images for resize
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || isReadOnly) return;
    const editor = quill.getEditor();

    const handleClick = (e) => {
      const img = e.target.closest('img');
      if (!img) {
        setResizeTarget(null);
        return;
      }
      try {
        const blot = Quill.find(img);
        if (blot) {
          setResizeTarget({ blot, domNode: img });
          e.stopPropagation();
        }
      } catch {
        setResizeTarget(null);
      }
    };

    // Click outside any image clears selection
    const handleOutside = (e) => {
      if (!e.target.closest('img')) setResizeTarget(null);
    };

    editor.root.addEventListener('click', handleClick);
    document.addEventListener('click', handleOutside);
    return () => {
      editor.root.removeEventListener('click', handleClick);
      document.removeEventListener('click', handleOutside);
    };
  }, [isReadOnly]);



  // Read-only viewer
  if (isReadOnly) {
    return (
      <Box className="quill-viewer">
        <ReactQuill theme="snow" modules={noModules} value={props.value || ''} readOnly />
      </Box>
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
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  modules={myModules}
                  value={content}
                  onChange={setContent}
                  placeholder="Schreibe deinen Beitrag hier..."
                  style={{ height: '100%' }}
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
                      if (e.target.checked) dispatchPoll({ type: 'OPEN_DIALOG' });
                      else dispatchPoll({ type: 'SET_HAS_POLL', payload: false });
                    }}
                    color="primary"
                  />
                }
                label="Umfrage zu diesem Beitrag hinzufügen"
              />
              {hasPoll && (
                <Button size="small" startIcon={<PollIcon />} onClick={() => dispatchPoll({ type: 'OPEN_DIALOG' })} variant="outlined">
                  Umfrage bearbeiten
                </Button>
              )}
            </Stack>

            {hasPoll && pollQuestion && (
              <Alert severity="info" sx={{ bgcolor: 'rgba(255,152,0,0.08)', border: '1px solid rgba(255,152,0,0.2)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Eingerichtete Umfrage: {pollQuestion}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Optionen: {pollOptions.filter(o => o.value.trim() !== '').map(o => o.value).join(', ')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Mehrfachauswahl: {allowMultiple ? 'Ja' : 'Nein'}
                </Typography>
              </Alert>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {/* Submit / Cancel */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                size="large"
                onClick={() => navigate(-1)}
                disabled={saving}
                sx={{ py: 1.5, px: 4 }}
              >
                Abbrechen
              </Button>
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

      {/* Image resize handles — fixed-position overlay, driven by rAF */}
      {resizeTarget && (
        <>
          <Box
            ref={outlineRef}
            sx={{
              position: 'fixed',
              border: '2px solid #ff9800',
              pointerEvents: 'none',
              zIndex: 1300,
              borderRadius: '2px',
            }}
          />
          <Box
            ref={handleRef}
            onMouseDown={handleDragStart}
            sx={{
              position: 'fixed',
              width: 16,
              height: 16,
              bgcolor: '#ff9800',
              border: '2px solid #fff',
              cursor: 'nwse-resize',
              zIndex: 1301,
              boxShadow: '0 0 4px rgba(0,0,0,0.4)',
            }}
          />
        </>
      )}

      {/* Poll setup dialog */}
      <Dialog open={pollDialogOpen} onClose={() => dispatchPoll({ type: 'CLOSE_DIALOG' })} maxWidth="sm" fullWidth disableScrollLock>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Umfrage erstellen</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Fragestellung"
              variant="outlined"
              fullWidth
              value={pollQuestion}
              onChange={(e) => dispatchPoll({ type: 'SET_QUESTION', payload: e.target.value })}
            />
            <Typography variant="subtitle2" color="text.secondary">Antwortoptionen</Typography>
            {pollOptions.map((option) => (
              <Stack direction="row" spacing={1} key={option.id} sx={{ alignItems: 'center' }}>
                <TextField
                  label={`Option ${pollOptions.indexOf(option) + 1}`}
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={option.value}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                />
                <IconButton color="error" onClick={() => handleRemoveOption(option.id)} disabled={pollOptions.length <= 2}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
            <Button startIcon={<AddIcon />} onClick={handleAddOption} variant="outlined" size="small" sx={{ width: 'fit-content' }}>
              Option hinzufügen
            </Button>
            <Divider sx={{ my: 1 }} />
            <FormControlLabel
              control={
                <Checkbox
                  checked={allowMultiple}
                  onChange={(e) => dispatchPoll({ type: 'TOGGLE_ALLOW_MULTIPLE', payload: e.target.checked })}
                  color="primary"
                />
              }
              label="Mehrfachauswahl erlauben"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { dispatchPoll({ type: 'CLOSE_DIALOG' }); if (!pollQuestion.trim()) dispatchPoll({ type: 'SET_HAS_POLL', payload: false }); }} color="error">
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
