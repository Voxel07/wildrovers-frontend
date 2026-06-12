import React, { useState, use } from 'react';
import PropTypes from 'prop-types';
import api from '../../helper/api';

// Mui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

// Quill
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Eigene
import { convertTimestamp } from '../../helper/converter';
import useAuth from '../../context/useAuth';
import { AlertsContext } from '../../components/utils/AlertsManager';

const noModules = {
  toolbar: false
};

export default function Answer(props) {
  const { auth } = useAuth();
  const alertsManagerRef = use(AlertsContext);
  const { answer, onUpdate } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [saving, setSaving] = useState(false);

  const isCreatorOrAdmin = auth.user === answer.creator || auth.roles === "Admin";

  const handleDelete = () => {
    if (window.confirm("Möchtest du diese Antwort wirklich löschen?")) {
      api.delete('/forum/answer', {
        data: { id: answer.id }
      })
      .then(response => {
        alertsManagerRef.current.showAlert('success', 'Antwort erfolgreich gelöscht');
        if (onUpdate) onUpdate();
      })
      .catch(error => {
        console.error(error);
        const status = error.response?.status || 500;
        const msg = error.response?.data || 'Fehler beim Löschen';
        alertsManagerRef.current.showAlert('error', `${status}: ${msg}`);
      });
    }
  };

  const handleSaveEdit = () => {
    if (!editContent || editContent.trim() === '' || editContent === '<p><br></p>') {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib einen Inhalt ein');
      return;
    }

    setSaving(true);
    api.post('/forum/answer', {
      id: answer.id,
      content: editContent
    })
    .then(response => {
      alertsManagerRef.current.showAlert('success', 'Antwort erfolgreich aktualisiert');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    })
    .catch(error => {
      console.error(error);
      const status = error.response?.status || 500;
      const msg = error.response?.data || 'Fehler beim Speichern';
      alertsManagerRef.current.showAlert('error', `${status}: ${msg}`);
    })
    .finally(() => {
      setSaving(false);
    });
  };

  const handleCancelEdit = () => {
    setEditContent(answer.content);
    setIsEditing(false);
  };



  return (
    <Card sx={{ width: '100%', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar 
                  alt={answer.creator ? answer.creator[0].toUpperCase() : 'U'} 
                  sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', width: 32, height: 32, fontWeight: 'bold', fontSize: '0.9rem' }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {answer.creator}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {convertTimestamp(answer.creationDate)}
                    {answer.editDate && ` (bearbeitet am ${answer.editDate})`}
                  </Typography>
                </Box>
              </Stack>

              {isCreatorOrAdmin && !saving && (
                <Stack direction="row" spacing={0.5}>
                  {isEditing ? (
                    <>
                      <Tooltip title="Speichern">
                        <IconButton size="small" color="primary" onClick={handleSaveEdit}>
                          <SaveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Abbrechen">
                        <IconButton size="small" color="error" onClick={handleCancelEdit}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Antwort bearbeiten">
                        <IconButton size="small" color="primary" onClick={() => setIsEditing(true)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Antwort löschen">
                        <IconButton size="small" color="error" onClick={handleDelete}>
                          <DeleteForeverIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Stack>
              )}
            </Stack>
          </Grid>

          <Divider sx={{ width: '100%', opacity: 0.5 }} />

          <Grid size={{ xs: 12 }}>
            {isEditing ? (
              <Box sx={{ mb: 1 }}>
                <style>{`.reply-editor .ql-container.ql-snow, .reply-editor .ql-toolbar.ql-snow { border-color: rgba(255,255,255,0.12) !important; }`}</style>
                <style>{`.reply-editor .ql-editor.ql-blank::before { color: rgba(255,255,255,0.55) !important; font-style: italic; }`}</style>
                <Box className="reply-editor">
                  <ReactQuill
                    theme="snow"
                    value={editContent}
                    onChange={setEditContent}
                    placeholder="Schreibe deine Antwort..."
                  />
                </Box>
              </Box>
            ) : (
              <Box className="reply-body-content" sx={{ pl: 0.5 }}>
                <style>{`.reply-body-content .ql-container.ql-snow { border: none !important; } .reply-body-content .ql-editor { padding: 0; }`}</style>
                <ReactQuill
                  theme="snow"
                  modules={noModules}
                  value={answer.content}
                  readOnly
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

Answer.propTypes = {
  answer: PropTypes.object.isRequired,
  onUpdate: PropTypes.func,
};
