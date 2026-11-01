import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import PollDateGenerator from './PollDateGenerator';
import { formatDateOptionLabel } from '../../helper/pollDates';
import { filledOptions, makePollOption } from '../../helper/pollForm';

/**
 * Question, options and settings of a poll; used by every poll dialog. Controlled: `value` is
 * the form model from helper/pollForm.js, every change goes through `onChange`.
 */
export default function PollOptionsEditor({ value, onChange, allowReplace = true, autoFocus = false }) {
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const { question, options, allowMultiple, anonymous } = value;

  const update = (changes) => onChange({ ...value, ...changes });
  const updateOption = (key, changes) =>
    update({ options: options.map((o) => (o.key === key ? { ...o, ...changes } : o)) });

  const handleApplyGenerated = (generated, mode) => {
    const newOptions = generated.map((g) => makePollOption(g));
    // Empty placeholder rows are dropped when appending.
    const kept = mode === 'replace' ? [] : options.filter((o) => o.optionText.trim() !== '' || o.id != null);
    update({ options: [...kept, ...newOptions] });
    setGeneratorOpen(false);
  };

  return (
    <>
      <TextField
        autoFocus={autoFocus}
        margin="dense"
        label="Frage / Thema der Umfrage"
        type="text"
        fullWidth
        variant="outlined"
        value={question}
        onChange={(e) => update({ question: e.target.value })}
        sx={{ mb: 3 }}
      />

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          Optionen
        </Typography>
        {!generatorOpen && (
          <Button size="small" startIcon={<DateRangeIcon />} onClick={() => setGeneratorOpen(true)}>
            Termine generieren
          </Button>
        )}
      </Stack>

      {generatorOpen && (
        <PollDateGenerator
          existingCount={filledOptions(value).length}
          allowReplace={allowReplace}
          onApply={handleApplyGenerated}
          onCancel={() => setGeneratorOpen(false)}
        />
      )}

      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {options.map((opt, index) => (
          <Box key={opt.key}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <TextField
                placeholder={`Option ${index + 1}`}
                type="text"
                fullWidth
                variant="outlined"
                size="small"
                value={opt.optionText}
                onChange={(e) => updateOption(opt.key, { optionText: e.target.value })}
              />
              <IconButton
                aria-label="Option entfernen"
                color="error"
                onClick={() => update({ options: options.filter((o) => o.key !== opt.key) })}
                disabled={options.length <= 2}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
            {(opt.optionDate || opt.eventId) && (
              <Stack direction="row" spacing={1} sx={{ mt: 0.5, ml: 0.5 }}>
                {opt.optionDate && (
                  <Tooltip title="Termin dieser Option (für die Event-Erstellung). Mit × wird daraus eine reine Textoption.">
                    <Chip
                      icon={<DateRangeIcon />}
                      label={formatDateOptionLabel(opt.optionDate, opt.optionEndDate)}
                      size="small"
                      variant="outlined"
                      onDelete={opt.eventId ? undefined : () => updateOption(opt.key, { optionDate: null, optionEndDate: null })}
                    />
                  </Tooltip>
                )}
                {opt.eventId && (
                  <Chip icon={<EventAvailableIcon />} label="Event erstellt" size="small" color="success" variant="outlined" />
                )}
              </Stack>
            )}
          </Box>
        ))}
      </Stack>

      <Button
        startIcon={<AddIcon />}
        variant="outlined"
        size="small"
        onClick={() => update({ options: [...options, makePollOption()] })}
        sx={{ mb: 3 }}
      >
        Option hinzufügen
      </Button>

      <Box>
        <FormControlLabel
          control={
            <Checkbox checked={allowMultiple} onChange={(e) => update({ allowMultiple: e.target.checked })} color="primary" />
          }
          label="Mehrfachauswahl erlauben"
        />
      </Box>
      <Box>
        <FormControlLabel
          control={
            <Checkbox checked={anonymous} onChange={(e) => update({ anonymous: e.target.checked })} color="primary" />
          }
          label="Anonyme Umfrage (Wähler bleiben unsichtbar)"
        />
      </Box>
    </>
  );
}

PollOptionsEditor.propTypes = {
  value: PropTypes.shape({
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.object).isRequired,
    allowMultiple: PropTypes.bool.isRequired,
    anonymous: PropTypes.bool.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  /** Let the date generator replace all options (off when editing a poll that may have votes). */
  allowReplace: PropTypes.bool,
  autoFocus: PropTypes.bool,
};
