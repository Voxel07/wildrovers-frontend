import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import { generateDateOptions, MAX_POLL_OPTIONS, toIsoDate, WEEKDAYS } from '../../helper/pollDates';

const clampInt = (value, min, max) => {
  const n = Math.floor(Number(value));
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
};

/**
 * Generates date options from a weekly pattern (e.g. Saturday + Sunday for the next 5 weeks)
 * and hands them to the poll editor. Single entries can be removed in the preview.
 */
export default function PollDateGenerator({ existingCount, allowReplace, onApply, onCancel }) {
  const [startDate, setStartDate] = useState(() => toIsoDate(new Date()));
  const [weekdays, setWeekdays] = useState([6]);
  const [lengthDays, setLengthDays] = useState(2);
  const [everyWeeks, setEveryWeeks] = useState(1);
  const [endMode, setEndMode] = useState('count');
  const [count, setCount] = useState(5);
  const [untilDate, setUntilDate] = useState('');
  // Removed preview entries, by start date (stays valid while the settings change).
  const [removed, setRemoved] = useState(() => new Set());

  const { options: generated, truncated } = useMemo(
    () => generateDateOptions({ startDate, weekdays, lengthDays, everyWeeks, endMode, count, untilDate }),
    [startDate, weekdays, lengthDays, everyWeeks, endMode, count, untilDate]
  );
  const preview = generated.filter((o) => !removed.has(o.optionDate));

  const appendTotal = existingCount + preview.length;
  const tooManyToAppend = appendTotal > MAX_POLL_OPTIONS;

  const removeEntry = (optionDate) => {
    setRemoved((prev) => new Set(prev).add(optionDate));
  };

  return (
    <Box sx={{ border: '1px solid rgba(255, 152, 0, 0.25)', borderRadius: 2, p: 2, mb: 3, bgcolor: 'rgba(255,152,0,0.04)' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
        Termine generieren
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Ab Datum"
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ maxWidth: 220 }}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Beginnt am (jeder gewählte Tag startet eine Option)
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={weekdays}
            onChange={(_, value) => setWeekdays(value)}
            aria-label="Wochentage"
            sx={{ flexWrap: 'wrap' }}
          >
            {WEEKDAYS.map((d) => (
              <ToggleButton key={d.value} value={d.value} aria-label={d.label} sx={{ px: 1.5 }}>
                {d.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Dauer (Tage)"
            type="number"
            size="small"
            value={lengthDays}
            onChange={(e) => setLengthDays(clampInt(e.target.value, 1, 31))}
            helperText={lengthDays === 1 ? 'Einzelne Tage' : `z. B. ${lengthDays} Tage am Stück`}
            slotProps={{ htmlInput: { min: 1, max: 31 } }}
            sx={{ minWidth: 170 }}
          />
          <TextField
            label="Alle … Wochen"
            type="number"
            size="small"
            value={everyWeeks}
            onChange={(e) => setEveryWeeks(clampInt(e.target.value, 1, 12))}
            helperText={everyWeeks === 1 ? 'Jede Woche' : `Jede ${everyWeeks}. Woche`}
            slotProps={{ htmlInput: { min: 1, max: 12 } }}
            sx={{ minWidth: 170 }}
          />
        </Stack>

        <Box>
          <RadioGroup row value={endMode} onChange={(e) => setEndMode(e.target.value)}>
            <FormControlLabel value="count" control={<Radio size="small" />} label="Anzahl Wochen" />
            <FormControlLabel value="until" control={<Radio size="small" />} label="Bis Datum" />
          </RadioGroup>
          {endMode === 'count' ? (
            <TextField
              label="Wochen"
              type="number"
              size="small"
              value={count}
              onChange={(e) => setCount(clampInt(e.target.value, 1, 52))}
              slotProps={{ htmlInput: { min: 1, max: 52 } }}
              sx={{ maxWidth: 220 }}
            />
          ) : (
            <TextField
              label="Bis einschließlich"
              type="date"
              size="small"
              value={untilDate}
              onChange={(e) => setUntilDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: startDate } }}
              sx={{ maxWidth: 220 }}
            />
          )}
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Vorschau: {preview.length} {preview.length === 1 ? 'Option' : 'Optionen'}
          </Typography>
          {preview.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Keine Termine – bitte Wochentage und Zeitraum prüfen.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflowY: 'auto' }}>
              {preview.map((o) => (
                <Chip key={o.optionDate} label={o.optionText} size="small" onDelete={() => removeEntry(o.optionDate)} />
              ))}
            </Box>
          )}
          {truncated && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Es werden höchstens {MAX_POLL_OPTIONS} Optionen erzeugt.
            </Alert>
          )}
          {tooManyToAppend && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Zusammen mit den vorhandenen Optionen wären es {appendTotal} – erlaubt sind höchstens {MAX_POLL_OPTIONS}.
            </Alert>
          )}
        </Box>

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button onClick={onCancel} color="inherit" size="small">
            Abbrechen
          </Button>
          <Button
            onClick={() => onApply(preview, 'append')}
            variant="outlined"
            size="small"
            disabled={preview.length === 0 || tooManyToAppend}
          >
            Hinzufügen
          </Button>
          {allowReplace && (
            <Button
              onClick={() => onApply(preview, 'replace')}
              variant="contained"
              size="small"
              disabled={preview.length === 0}
            >
              Optionen ersetzen
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

PollDateGenerator.propTypes = {
  /** Options with text that are already in the poll (for the limit check when appending). */
  existingCount: PropTypes.number.isRequired,
  /** Offer replacing all options (not when editing a poll that may have votes). */
  allowReplace: PropTypes.bool,
  onApply: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
