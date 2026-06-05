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

// Response interceptor — retry on 401 by refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const storedAuth = getCookie('auth:v1');
        if (storedAuth) {
          const auth = JSON.parse(storedAuth);
          if (auth && auth.refreshToken) {
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
        }
      } catch (e) {
        console.error('Error in API response interceptor 401 retry', e);
      }

      // If no stored auth or refresh token, clean up and redirect
      deleteCookie('auth:v1');
      window.dispatchEvent(new Event('auth-updated'));
      if (!window.location.pathname.toLowerCase().includes('/login')) {
        window.location.href = '/Login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
