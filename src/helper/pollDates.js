import { addDays, addWeeks, format, isAfter, isBefore, isValid, parseISO, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

/** Same limit as ForumPollOrm.MAX_OPTIONS in the backend. */
export const MAX_POLL_OPTIONS = 60;

/** Weekdays in display order (Monday first); `value` is the date-fns day number (0 = Sunday). */
export const WEEKDAYS = [
  { value: 1, label: 'Mo' },
  { value: 2, label: 'Di' },
  { value: 3, label: 'Mi' },
  { value: 4, label: 'Do' },
  { value: 5, label: 'Fr' },
  { value: 6, label: 'Sa' },
  { value: 0, label: 'So' },
];

/** Upper bound for the week loop, so that odd settings can never hang the browser. */
const MAX_WEEKS = 520;

/** Local calendar date as yyyy-MM-dd (no time zone shift, unlike toISOString). */
export function toIsoDate(date) {
  return format(date, 'yyyy-MM-dd');
}

/** Parses yyyy-MM-dd as a local date; returns null for empty or invalid input. */
export function parseIsoDate(value) {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

/** Offset of a date-fns weekday from Monday (Monday = 0, Sunday = 6). */
function mondayOffset(weekday) {
  return (weekday + 6) % 7;
}

/**
 * Label of a date option, e.g. "Di, 10.11.2026" or "Sa, 07.11. – So, 08.11.2026".
 * Dates are yyyy-MM-dd strings; the end date is optional.
 */
export function formatDateOptionLabel(optionDate, optionEndDate) {
  const start = parseIsoDate(optionDate);
  if (!start) return '';
  const end = parseIsoDate(optionEndDate);
  const full = (d) => format(d, 'EEEEEE, dd.MM.yyyy', { locale: de });
  if (!end || toIsoDate(end) === toIsoDate(start)) {
    return full(start);
  }
  const startText = start.getFullYear() === end.getFullYear()
    ? format(start, 'EEEEEE, dd.MM.', { locale: de })
    : full(start);
  return `${startText} – ${full(end)}`;
}

/**
 * Generates date options from a weekly pattern.
 *
 * Every selected weekday starts one option of `lengthDays` days (1 = single day, 2 = e.g.
 * Saturday + Sunday). The pattern repeats every `everyWeeks` weeks, starting with the week of
 * `startDate`; days before `startDate` are skipped. It ends after `count` repetitions (weeks that
 * produced at least one option) or, with `endMode: 'until'`, with the last option that starts on
 * or before `untilDate`.
 *
 * @returns {{ options: Array<{optionDate: string, optionEndDate: string|null, optionText: string}>, truncated: boolean }}
 *          options sorted by date; `truncated` is true if the result was cut at `limit`
 */
export function generateDateOptions({
  startDate,
  weekdays,
  lengthDays = 1,
  everyWeeks = 1,
  endMode = 'count',
  count = 1,
  untilDate,
  limit = MAX_POLL_OPTIONS,
}) {
  const start = parseIsoDate(startDate);
  const until = endMode === 'until' ? parseIsoDate(untilDate) : null;
  const length = Math.max(1, Math.floor(Number(lengthDays) || 1));
  const step = Math.max(1, Math.floor(Number(everyWeeks) || 1));
  const repetitions = Math.max(1, Math.floor(Number(count) || 1));
  if (!start || !weekdays?.length || (endMode === 'until' && (!until || isBefore(until, start)))) {
    return { options: [], truncated: false };
  }

  const offsets = [...new Set(weekdays.map(mondayOffset))].sort((a, b) => a - b);
  const firstWeek = startOfWeek(start, { weekStartsOn: 1 });
  const options = [];
  let producedWeeks = 0;

  for (let week = 0; week < MAX_WEEKS; week += step) {
    const weekStart = addWeeks(firstWeek, week);
    if (until && isAfter(weekStart, until)) break;
    let producedThisWeek = false;
    for (const offset of offsets) {
      const day = addDays(weekStart, offset);
      if (isBefore(day, start)) continue;
      if (until && isAfter(day, until)) break;
      if (options.length >= limit) {
        return { options, truncated: true };
      }
      const optionDate = toIsoDate(day);
      const optionEndDate = length > 1 ? toIsoDate(addDays(day, length - 1)) : null;
      options.push({ optionDate, optionEndDate, optionText: formatDateOptionLabel(optionDate, optionEndDate) });
      producedThisWeek = true;
    }
    if (producedThisWeek) producedWeeks += 1;
    if (endMode !== 'until' && producedWeeks >= repetitions) break;
  }
  return { options, truncated: false };
}
