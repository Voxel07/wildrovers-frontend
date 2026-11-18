import { MAX_POLL_OPTIONS } from './pollDates';
import type { Poll } from '../types';

// Form model shared by all poll dialogs (new post, add to post, edit). Options carry a local
// `key` for React; `id` is the server id (null for new options).

export interface PollOptionForm {
  key: number;
  id: number | null;
  optionText: string;
  /** yyyy-MM-dd */
  optionDate: string | null;
  /** yyyy-MM-dd */
  optionEndDate: string | null;
  eventId: number | null;
}

export interface PollForm {
  question: string;
  options: PollOptionForm[];
  allowMultiple: boolean;
  anonymous: boolean;
}

export interface PollPayload {
  question: string;
  allowMultiple: boolean;
  anonymous: boolean;
  options: Array<{ id: number | null; optionText: string; optionDate: string | null; optionEndDate: string | null }>;
}

let nextOptionKey = 0;

export function makePollOption(fields: Partial<Omit<PollOptionForm, 'key'>> = {}): PollOptionForm {
  return {
    key: nextOptionKey++,
    id: null,
    optionText: '',
    optionDate: null,
    optionEndDate: null,
    eventId: null,
    ...fields,
  };
}

export function createEmptyPoll(): PollForm {
  return {
    question: '',
    options: [makePollOption(), makePollOption()],
    allowMultiple: false,
    anonymous: false,
  };
}

/** Form state for editing an existing poll from the server. */
export function pollFromServer(poll: Poll | null | undefined): PollForm {
  return {
    question: poll?.question || '',
    options: (poll?.options || []).map((o) => makePollOption({
      id: o.id,
      optionText: o.optionText || '',
      optionDate: o.optionDate || null,
      optionEndDate: o.optionEndDate || null,
      eventId: o.eventId || null,
    })),
    allowMultiple: Boolean(poll?.allowMultiple),
    anonymous: Boolean(poll?.anonymous),
  };
}

/** Options that will be saved: those with text. */
export function filledOptions(poll: PollForm): PollOptionForm[] {
  return poll.options.filter((o) => o.optionText.trim() !== '');
}

/** @returns an error message for the user, or null if the poll can be saved */
export function validatePoll(poll: PollForm): string | null {
  if (!poll.question.trim()) return 'Bitte gib eine Umfrage-Frage ein.';
  const filled = filledOptions(poll);
  if (filled.length < 2) return 'Bitte gib mindestens 2 Optionen ein.';
  if (filled.length > MAX_POLL_OPTIONS) return `Eine Umfrage darf höchstens ${MAX_POLL_OPTIONS} Optionen haben.`;
  return null;
}

/** Request body for /forum/poll/create and /forum/poll/update. */
export function toPollPayload(poll: PollForm): PollPayload {
  return {
    question: poll.question.trim(),
    allowMultiple: poll.allowMultiple,
    anonymous: poll.anonymous,
    options: filledOptions(poll).map((o) => ({
      id: o.id,
      optionText: o.optionText.trim(),
      optionDate: o.optionDate || null,
      optionEndDate: o.optionDate ? (o.optionEndDate || null) : null,
    })),
  };
}
