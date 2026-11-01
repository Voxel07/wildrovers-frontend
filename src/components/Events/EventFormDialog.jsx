import React, { useState } from 'react';
import PropTypes from 'prop-types';
import api, { extractErrorMessage } from '../../helper/api';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const EMPTY_EVENT_FORM = { title: '', description: '', eventDate: '', eventEndDate: '', location: '' };

/**
 * Add/edit dialog for events. The form state is taken from `initialValues` when the dialog is
 * mounted, so callers give it a new `key` for every opening.
 *
 * With `pollOptionId` the new event is linked to that poll option (see POST /event?pollOption).
 */
export default function EventFormDialog({ open, onClose, onSaved, eventId, initialValues, pollOptionId, title }) {
  const editMode = eventId != null;
  const [formData, setFormData] = useState(() => ({ ...EMPTY_EVENT_FORM, ...initialValues }));
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

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
      eventEndDate: formData.eventEndDate || null,
      location: formData.location
    };

    setSaving(true);
    const request = editMode
      ? api.put('/event', { ...payload, id: eventId })
      : api.post('/event', payload, pollOptionId != null ? { params: { pollOption: pollOptionId } } : undefined);

    request
      .then((response) => {
        onSaved?.(response.data);
        onClose();
      })
      .catch(err => {
        console.error("Error saving event", err);
        setFormError(extractErrorMessage(err));
      })
      .finally(() => setSaving(false));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'primary.main' }}>
        {title || (editMode ? 'Event-Termin bearbeiten' : 'Neuen Event-Termin erstellen')}
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
          <Button onClick={onClose} color="inherit">
            Abbrechen
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={saving}>
            {saving ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

EventFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  /** Called with the saved event from the server. */
  onSaved: PropTypes.func,
  /** Id of the event to edit; null/undefined creates a new event. */
  eventId: PropTypes.number,
  initialValues: PropTypes.object,
  /** Poll option the new event is created from. */
  pollOptionId: PropTypes.number,
  title: PropTypes.string,
};
