import { useState, type ChangeEvent, type FormEvent } from 'react';
import api, { extractErrorMessage } from '../../helper/api';
import type { WrEvent } from '../../types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

/** Form fields; dates as datetime-local values (yyyy-MM-ddThh:mm). */
export interface EventFormValues {
  title: string;
  description: string;
  eventDate: string;
  eventEndDate: string;
  location: string;
}

interface EventFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called with the saved event from the server. */
  onSaved?: (event: WrEvent) => void;
  /** Id of the event to edit; null/undefined creates a new event. */
  eventId?: number | null;
  initialValues?: Partial<EventFormValues>;
  /** Poll option the new event is created from. */
  pollOptionId?: number | null;
  title?: string;
}

const EMPTY_EVENT_FORM: EventFormValues = { title: '', description: '', eventDate: '', eventEndDate: '', location: '' };

/**
 * Add/edit dialog for events. The form state is taken from `initialValues` when the dialog is
 * mounted, so callers give it a new `key` for every opening.
 *
 * With `pollOptionId` the new event is linked to that poll option (see POST /event?pollOption).
 */
export default function EventFormDialog({ open, onClose, onSaved, eventId, initialValues, pollOptionId, title }: EventFormDialogProps) {
  const editMode = eventId != null;
  const [formData, setFormData] = useState<EventFormValues>(() => ({ ...EMPTY_EVENT_FORM, ...initialValues }));
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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
      ? api.put<WrEvent>('/event', { ...payload, id: eventId })
      : api.post<WrEvent>('/event', payload, pollOptionId != null ? { params: { pollOption: pollOptionId } } : undefined);

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
