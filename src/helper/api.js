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

// When the current access cookie expires (ms); null while no session is known.
let accessExpiresAt = null;
let refreshPromise = null;

/** Remembers the session returned by /auth/login, /auth/oidc, /auth/refresh or /auth/session. */
export function rememberSession(session) {
  accessExpiresAt = session?.authenticated ? (session.accessExpiresAt ?? Date.now() + 10 * 60 * 1000) : null;
}

function announce(session, expired) {
  window.dispatchEvent(new CustomEvent('auth-session', { detail: session }));
  if (expired) {
    window.dispatchEvent(new Event('auth-expired'));
  }
}

/**
 * Exchanges the refresh cookie for a new access cookie. Concurrent callers share one
 * request; the backend rotates the refresh token and tolerates parallel tabs.
 */
export function refreshSession() {
  if (!refreshPromise) {
    const hadSession = accessExpiresAt !== null;
    refreshPromise = api.post('/auth/refresh', null, { _skipAuthRetry: true })
      .then((res) => {
        rememberSession(res.data);
        announce(res.data, hadSession && !res.data?.authenticated);
        return res.data;
      })
      .catch((err) => {
        rememberSession(null);
        if (err.response?.status !== 403) {
          announce({ authenticated: false }, hadSession);
        }
        throw err;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// Refresh shortly before the access cookie expires, so requests never go out
// without it (public endpoints would otherwise silently answer as for a visitor).
api.interceptors.request.use(async (config) => {
  if (!config._skipAuthRetry && accessExpiresAt !== null && Date.now() > accessExpiresAt - 30 * 1000) {
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
      } catch {
        // Session ended; the backend cleared the cookies.
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
