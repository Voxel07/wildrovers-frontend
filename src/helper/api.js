import axios from 'axios';
import { refreshTokens, parseJwt } from './oidc';
import { getCookie, setCookie, deleteCookie } from './cookies';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.request.use(
  async (config) => {
    try {
      const storedAuth = getCookie('auth:v1');
      if (storedAuth) {
        const auth = JSON.parse(storedAuth);
        if (auth && auth.JWT) {
          // Check if token is expired or close to expiring (within 30 seconds)
          const isExpired = auth.expiresAt && (auth.expiresAt - 30 * 1000 < Date.now());

          if (isExpired && auth.refreshToken) {
            if (!isRefreshing) {
              isRefreshing = true;
              try {
                const tokens = await refreshTokens(auth.refreshToken);
                const payload = parseJwt(tokens.access_token || tokens.id_token);
                let username = auth.user;
                if (payload) {
                  username = payload.preferred_username || payload.sub;
                }
                const computedExpiresAt = payload?.exp
                  ? payload.exp * 1000
                  : (tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null);

                const updatedAuth = {
                  ...auth,
                  JWT: tokens.access_token,
                  refreshToken: tokens.refresh_token || auth.refreshToken,
                  expiresAt: computedExpiresAt,
                  user: username,
                };
                setCookie('auth:v1', JSON.stringify(updatedAuth), 7);
                window.dispatchEvent(new Event('auth-updated'));
                isRefreshing = false;
                onRefreshed(tokens.access_token);
              } catch (err) {
                isRefreshing = false;
                console.error('Token refresh failed in interceptor', err);
                // Clear auth to force relogin
                deleteCookie('auth:v1');
                window.dispatchEvent(new Event('auth-updated'));
                return config;
              }
            }

            // Wait for token refresh to complete
            const newToken = await new Promise((resolve) => {
              subscribeTokenRefresh((token) => {
                resolve(token);
              });
            });
            config.headers.Authorization = `Bearer ${newToken}`;
          } else {
            config.headers.Authorization = `Bearer ${auth.JWT}`;
          }
        }
      }
    } catch (e) {
      console.error('Error in API request interceptor', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — retry on 401 by refreshing token (OIDC sessions only)
// Local-JWT sessions (no refreshToken) are NOT cleared on 401 — only OIDC refresh failures clear auth.
// On 403, the user is blocked — terminate the session immediately.
// On 429, dispatch a global event so the UI can show a rate-limit warning.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Rate-limited: dispatch global event for the UI to display
    if (error.response?.status === 429) {
      const msg = extractErrorMessage(error);
      window.dispatchEvent(new CustomEvent('api-ratelimited', {
        detail: { message: msg, url: originalRequest?.url }
      }));
      return Promise.reject(error);
    }

    // Blocked user: end the session immediately
    if (error.response?.status === 403) {
      deleteCookie('auth:v1');
      window.dispatchEvent(new Event('auth-updated'));
      if (!window.location.pathname.toLowerCase().includes('/login')) {
        window.location.href = '/Login?blocked=true';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const storedAuth = getCookie('auth:v1');
        if (storedAuth) {
          const auth = JSON.parse(storedAuth);
          if (auth && auth.refreshToken) {
            // OIDC session: attempt token refresh
            if (!isRefreshing) {
              isRefreshing = true;
              try {
                const tokens = await refreshTokens(auth.refreshToken);
                const payload = parseJwt(tokens.access_token || tokens.id_token);
                let username = auth.user;
                if (payload) {
                  username = payload.preferred_username || payload.sub;
                }
                const computedExpiresAt = payload?.exp
                  ? payload.exp * 1000
                  : (tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null);

                const updatedAuth = {
                  ...auth,
                  JWT: tokens.access_token,
                  refreshToken: tokens.refresh_token || auth.refreshToken,
                  expiresAt: computedExpiresAt,
                  user: username,
                };
                setCookie('auth:v1', JSON.stringify(updatedAuth), 7);
                window.dispatchEvent(new Event('auth-updated'));
                isRefreshing = false;
                onRefreshed(tokens.access_token);
              } catch (err) {
                isRefreshing = false;
                console.error('Token refresh failed in response interceptor', err);
                // Refresh failed for an OIDC session — clear auth and force re-login
                deleteCookie('auth:v1');
                window.dispatchEvent(new Event('auth-updated'));
                if (!window.location.pathname.toLowerCase().includes('/login')) {
                  window.location.href = '/Login';
                }
                return Promise.reject(error);
              }
            }

            // Wait for token refresh to complete
            const newToken = await new Promise((resolve) => {
              subscribeTokenRefresh((token) => {
                resolve(token);
              });
            });

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
          // Local-JWT session (no refreshToken): don't clear auth on 401 — just propagate the error
        }
      } catch (e) {
        console.error('Error in API response interceptor 401 retry', e);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extract a human-readable error message from an Axios error response.
 * Handles the backend's JSON format: {"status":"error","message":"..."}
 * as well as plain strings and objects.
 */
export function extractErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return error?.message || 'Unbekannter Fehler';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    return data.message || data.details || data.error || JSON.stringify(data);
  }
  return String(data);
}

export default api;
