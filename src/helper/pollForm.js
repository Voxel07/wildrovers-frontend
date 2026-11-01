import { MAX_POLL_OPTIONS } from './pollDates';

// Form model shared by all poll dialogs (new post, add to post, edit). Options carry a local
// `key` for React; `id` is the server id (null for new options).

let nextOptionKey = 0;

export function makePollOption(fields = {}) {
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

export function createEmptyPoll() {
  return {
    question: '',
    options: [makePollOption(), makePollOption()],
    allowMultiple: false,
    anonymous: false,
  };
}

/** Form state for editing an existing poll from the server. */
export function pollFromServer(poll) {
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
export function filledOptions(poll) {
  return poll.options.filter((o) => o.optionText.trim() !== '');
}

/** @returns an error message for the user, or null if the poll can be saved */
export function validatePoll(poll) {
  if (!poll.question.trim()) return 'Bitte gib eine Umfrage-Frage ein.';
  const filled = filledOptions(poll);
  if (filled.length < 2) return 'Bitte gib mindestens 2 Optionen ein.';
  if (filled.length > MAX_POLL_OPTIONS) return `Eine Umfrage darf höchstens ${MAX_POLL_OPTIONS} Optionen haben.`;
  return null;
}

/** Request body for /forum/poll/create and /forum/poll/update. */
export function toPollPayload(poll) {
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
