import axios from 'axios';

/**
 * The session lives in two HttpOnly cookies set by the backend (wr_at: access token,
 * wr_rt: refresh token, sent only to /auth). JavaScript never sees either token;
 * requests just carry the cookies (withCredentials) and the X-Requested-With header
 * the backend requires as CSRF protection.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/** Absolute URL for a backend path such as a photo URL returned by the API. */
export function apiUrl(path) {
  if (!path) return null;
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
let accessExpiresAt = null;
// When to refresh, in this browser's clock (ms).
let refreshAt = null;
let lastSession = null;
let refreshPromise = null;
let retryRefreshAfter = 0;

// Tabs share the cookies, so they also share refreshes, logins and logouts.
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('wr-auth') : null;

/**
 * The refresh request failed without ending the session: the browser is offline, the
 * backend is restarting or rate-limiting. The cookies are still valid; keep the session.
 */
export function isTransientAuthError(err) {
  const status = err?.response?.status;
  return !status || status === 429 || status >= 500;
}

/**
 * Remembers the session returned by /auth/login, /auth/oidc, /auth/refresh or /auth/session.
 * The expiry is taken from the remaining lifetime, so a wrong client clock does not matter.
 */
export function rememberSession(session, { broadcast = false, expired = false } = {}) {
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
    channel?.postMessage({ session: session?.authenticated ? session : { authenticated: false }, accessExpiresAt, refreshAt, expired });
  }
}

function announce(session, expired) {
  window.dispatchEvent(new CustomEvent('auth-session', { detail: session }));
  if (expired) {
    window.dispatchEvent(new Event('auth-expired'));
  }
}

if (channel) {
  channel.onmessage = ({ data }) => {
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
function withTabLock(fn) {
  return navigator.locks?.request ? navigator.locks.request('wr-auth-refresh', fn) : fn();
}

/**
 * Exchanges the refresh cookie for a new access cookie. Concurrent callers share one
 * request, and tabs take turns: the backend rotates the refresh token on every use, so
 * two tabs presenting the same token in a row could otherwise end the session.
 * Rejects with the request error; check isTransientAuthError() before treating it as a logout.
 */
export function refreshSession() {
  if (!refreshPromise) {
    const knownExpiry = accessExpiresAt;
    refreshPromise = withTabLock(async () => {
      // Another tab refreshed while this one waited for the lock: its cookies are ours too.
      if (lastSession && accessExpiresAt !== knownExpiry && Date.now() < refreshAt) {
        return lastSession;
      }
      const hadSession = accessExpiresAt !== null;
      try {
        const res = await api.post('/auth/refresh', null, { _skipAuthRetry: true, timeout: 15000 });
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
        const expired = hadSession && err.response?.status !== 403;
        rememberSession(null, { broadcast: true, expired });
        if (err.response?.status !== 403) {
          announce({ authenticated: false }, expired);
        }
        throw err;
      }
    }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// Refresh shortly before the access cookie expires, so requests never go out
// without it (public endpoints would otherwise silently answer as for a visitor).
api.interceptors.request.use(async (config) => {
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
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const status = error.response?.status;

    if (status === 429) {
      window.dispatchEvent(new CustomEvent('api-ratelimited', {
        detail: { message: extractErrorMessage(error), url: config.url }
      }));
      return Promise.reject(error);
    }

    if (status === 403 && error.response.headers?.['x-account-status'] === 'denied') {
      rememberSession(null);
      announce({ authenticated: false }, false);
      if (!window.location.pathname.toLowerCase().includes('/login')) {
        window.location.href = '/Login?blocked=true';
      }
      return Promise.reject(error);
    }

    if (status === 401 && !config._retried && !config._skipAuthRetry && !String(config.url || '').startsWith('/auth/')) {
      config._retried = true;
      let session = null;
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
        return api(config);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extract a human-readable error message from an Axios error response.
 * The backend answers errors as {"status":"error","code":"...","message":"..."}.
 */
export function extractErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return error?.message || 'Unbekannter Fehler';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    return data.message || data.details || data.error || data.title || JSON.stringify(data);
  }
  return String(data);
}

export default api;
