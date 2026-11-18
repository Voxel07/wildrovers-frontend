import axios, { isAxiosError, type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Never wait for the session restore, refresh before, or retry after a 401. */
    _skipAuthRetry?: boolean;
    /** Set once a request was retried after a refresh. */
    _retried?: boolean;
  }
}

/** Session JSON returned by /auth/login, /auth/oidc, /auth/refresh and /auth/session. */
export interface SessionInfo {
  authenticated: boolean;
  userName?: string;
  userId?: number;
  role?: string;
  canCreateCategory?: boolean;
  photoUrl?: string | null;
  oidcLinked?: boolean;
  /** Remaining lifetime of the access cookie in ms. */
  accessExpiresIn?: number;
  /** Expiry of the access cookie (epoch ms, server clock). */
  accessExpiresAt?: number;
}

/** Body of an error answer: {"status":"error","code":"...","message":"..."}. */
export interface ApiErrorBody {
  status?: string;
  code?: string;
  message?: string;
  details?: string;
  error?: string;
  title?: string;
}

interface AuthBroadcast {
  session: SessionInfo;
  accessExpiresAt: number | null;
  refreshAt: number | null;
  expired: boolean;
}

/**
 * The session lives in two HttpOnly cookies set by the backend (wr_at: access token,
 * wr_rt: refresh token, sent only to /auth). JavaScript never sees either token;
 * requests just carry the cookies (withCredentials) and the X-Requested-With header
 * the backend requires as CSRF protection.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/** Absolute URL for a backend path such as a photo URL returned by the API. */
export function apiUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  return /^https?:\/\//.test(path) ? path : API_BASE + path;
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

// Refresh this long (at most half the token lifetime) before the access cookie expires.
const REFRESH_MARGIN_MS = 60 * 1000;
// After a refresh failed for a transient reason (offline, 5xx, 429), wait this long before retrying.
const TRANSIENT_RETRY_MS = 10 * 1000;

// When the current access cookie expires, in this browser's clock (ms); null while no session is known.
let accessExpiresAt: number | null = null;
// When to refresh, in this browser's clock (ms).
let refreshAt: number | null = null;
let lastSession: SessionInfo | null = null;
let refreshPromise: Promise<SessionInfo> | null = null;
let retryRefreshAfter = 0;

// On page load the access cookie (short-lived) is often already gone while the refresh
// cookie is still valid. Until AuthProvider has restored the session, other requests
// wait: public endpoints would otherwise answer them as for a visitor, without a 401
// that could trigger a refresh. The cap keeps a hanging session check from blocking the app.
const SESSION_RESTORE_MAX_WAIT_MS = 20 * 1000;
let resolveSessionRestored: () => void = () => {};
const sessionRestored = Promise.race([
  new Promise<void>((resolve) => { resolveSessionRestored = resolve; }),
  new Promise<void>((resolve) => setTimeout(resolve, SESSION_RESTORE_MAX_WAIT_MS)),
]);

/** Called by AuthProvider once the initial session check has finished (either way). */
export function markSessionRestored(): void {
  resolveSessionRestored();
}

// Tabs share the cookies, so they also share refreshes, logins and logouts.
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('wr-auth') : null;

/**
 * The refresh request failed without ending the session: the browser is offline, the
 * backend is restarting or rate-limiting. The cookies are still valid; keep the session.
 */
export function isTransientAuthError(err: unknown): boolean {
  const status = isAxiosError(err) ? err.response?.status : undefined;
  return !status || status === 429 || status >= 500;
}

/**
 * Remembers the session returned by /auth/login, /auth/oidc, /auth/refresh or /auth/session.
 * The expiry is taken from the remaining lifetime, so a wrong client clock does not matter.
 */
export function rememberSession(
  session: SessionInfo | null | undefined,
  { broadcast = false, expired = false }: { broadcast?: boolean; expired?: boolean } = {},
): void {
  if (session?.authenticated) {
    const remaining = typeof session.accessExpiresIn === 'number'
      ? session.accessExpiresIn
      : (session.accessExpiresAt ?? Date.now() + 10 * 60 * 1000) - Date.now();
    accessExpiresAt = Date.now() + remaining;
    refreshAt = accessExpiresAt - Math.min(REFRESH_MARGIN_MS, remaining / 2);
    lastSession = session;
    retryRefreshAfter = 0;
  } else {
    accessExpiresAt = null;
    refreshAt = null;
    lastSession = null;
  }
  if (broadcast) {
    const message: AuthBroadcast = { session: session?.authenticated ? session : { authenticated: false }, accessExpiresAt, refreshAt, expired };
    channel?.postMessage(message);
  }
}

function announce(session: SessionInfo, expired: boolean): void {
  window.dispatchEvent(new CustomEvent<SessionInfo>('auth-session', { detail: session }));
  if (expired) {
    window.dispatchEvent(new Event('auth-expired'));
  }
}

if (channel) {
  channel.onmessage = ({ data }: MessageEvent<AuthBroadcast | undefined>) => {
    if (!data?.session) return;
    if (data.session.authenticated) {
      accessExpiresAt = data.accessExpiresAt;
      refreshAt = data.refreshAt;
      lastSession = data.session;
      retryRefreshAfter = 0;
    } else {
      accessExpiresAt = null;
      refreshAt = null;
      lastSession = null;
    }
    announce(data.session, !!data.expired);
  };
}

/** Runs fn while holding a lock shared by all tabs (where the browser supports it). */
function withTabLock<T>(fn: () => Promise<T>): Promise<T> {
  return navigator.locks?.request ? navigator.locks.request('wr-auth-refresh', fn) : fn();
}

/**
 * Exchanges the refresh cookie for a new access cookie. Concurrent callers share one
 * request, and tabs take turns: the backend rotates the refresh token on every use, so
 * two tabs presenting the same token in a row could otherwise end the session.
 * Rejects with the request error; check isTransientAuthError() before treating it as a logout.
 */
export function refreshSession(): Promise<SessionInfo> {
  if (!refreshPromise) {
    const knownExpiry = accessExpiresAt;
    refreshPromise = withTabLock(async () => {
      // Another tab refreshed while this one waited for the lock: its cookies are ours too.
      if (lastSession && accessExpiresAt !== knownExpiry && refreshAt !== null && Date.now() < refreshAt) {
        return lastSession;
      }
      const hadSession = accessExpiresAt !== null;
      try {
        const res = await api.post<SessionInfo>('/auth/refresh', null, { _skipAuthRetry: true, timeout: 15000 });
        const expired = hadSession && !res.data?.authenticated;
        rememberSession(res.data, { broadcast: true, expired });
        announce(res.data, expired);
        return res.data;
      } catch (err) {
        if (isTransientAuthError(err)) {
          retryRefreshAfter = Date.now() + TRANSIENT_RETRY_MS;
          throw err;
        }
        // 401: the backend ended the session and cleared the cookies. 403: blocked or rejected.
        const status = isAxiosError(err) ? err.response?.status : undefined;
        const expired = hadSession && status !== 403;
        rememberSession(null, { broadcast: true, expired });
        if (status !== 403) {
          announce({ authenticated: false }, expired);
        }
        throw err;
      }
    }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise!;
}

// Refresh shortly before the access cookie expires, so requests never go out
// without it (public endpoints would otherwise silently answer as for a visitor).
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // The session endpoints are what restores the session; everything else waits for it.
  if (!config._skipAuthRetry && !String(config.url || '').startsWith('/auth/')) {
    await sessionRestored;
  }
  if (!config._skipAuthRetry && refreshAt !== null
      && Date.now() >= refreshAt && Date.now() >= retryRefreshAfter) {
    try {
      await refreshSession();
    } catch {
      // The response interceptor and the auth-expired event handle the outcome.
    }
  }
  return config;
});

// 401: refresh once and retry. 403 with X-Account-Status: denied: account blocked, end the session.
// 429: global event so the UI can show a rate-limit warning.
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config: Partial<InternalAxiosRequestConfig> = error.config || {};
    const status = error.response?.status;

    if (status === 429) {
      window.dispatchEvent(new CustomEvent('api-ratelimited', {
        detail: { message: extractErrorMessage(error), url: config.url }
      }));
      return Promise.reject(error);
    }

    if (status === 403 && error.response?.headers?.['x-account-status'] === 'denied') {
      rememberSession(null);
      announce({ authenticated: false }, false);
      if (!window.location.pathname.toLowerCase().includes('/login')) {
        window.location.href = '/Login?blocked=true';
      }
      return Promise.reject(error);
    }

    if (status === 401 && !config._retried && !config._skipAuthRetry && !String(config.url || '').startsWith('/auth/')) {
      config._retried = true;
      let session: SessionInfo | null = null;
      try {
        session = await refreshSession();
      } catch (refreshError) {
        // Offline or backend unavailable: the session may well be fine, report the original error.
        if (isTransientAuthError(refreshError)) return Promise.reject(error);
        // Otherwise the session ended; the backend cleared the cookies.
      }
      // With a new session every request is retried. Without one only reads are:
      // they succeed as a visitor now that the stale cookie is gone.
      if (session?.authenticated || (config.method || 'get').toLowerCase() === 'get') {
        return api(config as InternalAxiosRequestConfig);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extract a human-readable error message from an Axios error response.
 * The backend answers errors as {"status":"error","code":"...","message":"..."}.
 */
export function extractErrorMessage(error: unknown): string {
  const data: unknown = isAxiosError(error) ? error.response?.data : undefined;
  if (!data) return (error as Error | null | undefined)?.message || 'Unbekannter Fehler';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const body = data as ApiErrorBody;
    return body.message || body.details || body.error || body.title || JSON.stringify(data);
  }
  return String(data);
}

export default api;

/** HTTP status of a failed request; undefined for network errors and non-Axios errors. */
export function getErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

/** Response body of a failed request, if there was one. */
export function getErrorData<T = ApiErrorBody | string>(error: unknown): T | undefined {
  return isAxiosError(error) ? (error.response?.data as T | undefined) : undefined;
}
