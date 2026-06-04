import axios from 'axios';
import { refreshAccessToken, parseJwt } from './oidc';

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
      const storedAuth = localStorage.getItem('auth:v1');
      if (storedAuth) {
        const auth = JSON.parse(storedAuth);
        if (auth && auth.JWT) {
          // Check if token is expired or close to expiring (within 30 seconds)
          const isExpired = auth.expiresAt && (auth.expiresAt - 30 * 1000 < Date.now());

          if (isExpired && auth.refreshToken) {
            if (!isRefreshing) {
              isRefreshing = true;
              try {
                const tokens = await refreshAccessToken(auth.refreshToken);
                const payload = parseJwt(tokens.access_token || tokens.id_token);
                let username = auth.user;
                if (payload) {
                  username = payload.preferred_username || payload.sub;
                }
                const updatedAuth = {
                  ...auth,
                  JWT: tokens.access_token,
                  refreshToken: tokens.refresh_token || auth.refreshToken,
                  expiresAt: tokens.expires_in ? (Date.now() + tokens.expires_in * 1000) : null,
                  user: username,
                };
                localStorage.setItem('auth:v1', JSON.stringify(updatedAuth));
                window.dispatchEvent(new Event('auth-updated'));
                isRefreshing = false;
                onRefreshed(tokens.access_token);
              } catch (err) {
                isRefreshing = false;
                console.error('Token refresh failed in interceptor', err);
                // Clear auth to force relogin
                localStorage.removeItem('auth:v1');
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

// Response interceptor — auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth and redirect to login
      localStorage.removeItem('auth:v1');
      window.dispatchEvent(new Event('auth-updated'));
      // Only redirect if not already on the login page
      if (!window.location.pathname.toLowerCase().includes('/login')) {
        window.location.href = '/Login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
