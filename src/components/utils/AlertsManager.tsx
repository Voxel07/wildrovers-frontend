import { useState, useImperativeHandle, createContext, useCallback, useEffect, useRef, type Ref, type RefObject } from 'react';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
//styling
import './AlertsManager.css';
import type { AlertSeverity } from '../../types';

/** Imperative API of the AlertsManager, reached through AlertsContext. */
export interface AlertsHandle {
  /** `message` may be a string or an error body ({ message, error, details }). */
  showAlert: (severity: AlertSeverity, message: unknown) => void;
}

interface AlertItem {
  id: number;
  severity: AlertSeverity;
  message: unknown;
  duration: number;
}

const AlertsContext = createContext<RefObject<AlertsHandle | null>>({ current: null });

// Errors and warnings usually need reading; confirmations only a glance.
const DURATION_MS: Record<AlertSeverity, number> = { error: 8000, warning: 6000, info: 4000, success: 4000 };
const MAX_ALERTS = 5;

/**
 * Format alert messages: handle strings, objects with .message, and fallback to JSON.
 */
function formatAlertMessage(msg: unknown): string {
  if (typeof msg === 'string') return msg;
  if (typeof msg === 'object' && msg !== null) {
    const body = msg as { message?: string; error?: string; details?: string };
    return body.message || body.error || body.details || JSON.stringify(msg);
  }
  return String(msg);
}

let nextAlertId = 0;

const AlertsManager = ({ ref }: { ref?: Ref<AlertsHandle> }) => {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

    const removeAlert = useCallback((id: number) => {
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
    }, []);

    // One timeout per alert; the countdown bar is a CSS animation, so nothing re-renders while it runs.
    const showAlert = useCallback((severity: AlertSeverity, message: unknown) => {
      const id = ++nextAlertId;
      const duration = DURATION_MS[severity] ?? 4000;
      setAlerts((prevAlerts) => [...prevAlerts, { id, severity, message, duration }].slice(-MAX_ALERTS));
      timers.current.set(id, setTimeout(() => removeAlert(id), duration));
    }, [removeAlert]);

    useEffect(() => {
      const pending = timers.current;
      return () => pending.forEach(clearTimeout);
    }, []);

    useImperativeHandle(ref, () => ({ showAlert }), [showAlert]);

    return (
      <div className='alerts-manager' aria-live="polite">
        {alerts.map((alert) => (
          <Slide key={alert.id} direction="left" in={true} mountOnEnter unmountOnExit>
            <div className="alerts-manager__item">
              <Alert severity={alert.severity} onClose={() => removeAlert(alert.id)} sx={{ mb: 1 }}>
                {formatAlertMessage(alert.message)}
              </Alert>
              <div
                className={`alerts-manager__progress alerts-manager__progress--${alert.severity}`}
                style={{ animationDuration: `${alert.duration}ms` }}
                aria-hidden="true"
              />
            </div>
          </Slide>
        ))}
      </div>
    );
};
export { AlertsManager, AlertsContext };
