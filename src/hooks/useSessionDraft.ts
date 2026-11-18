import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';

/**
 * useState that survives a reload, a login redirect or an expired session in this
 * tab (sessionStorage). Pass a null key to disable persistence. Call clear() once
 * the text has been saved.
 */
export default function useSessionDraft<T>(
  key: string | null | undefined,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (!key) return initialValue;
    try {
      const stored = sessionStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (!key) return;
    try {
      if (value === initialValue || value === '' || value === '<p><br></p>') {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Storage full or blocked: the draft just isn't kept.
    }
    // initialValue is only the fallback for an empty draft
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value]);

  const clear = useCallback(() => {
    if (key) {
      try { sessionStorage.removeItem(key); } catch { /* ignore */ }
    }
    setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue, clear];
}
