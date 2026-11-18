// Small helpers that every page may import. The OpenObserve SDKs live in telemetrySdk.ts and
// are loaded only after the visitor agreed to monitoring, once the page is idle.

// Routes that handle credentials, one-time tokens/codes or personal settings.
// Session replay never records them (replay meta records contain the full URL).
const SENSITIVE_ROUTES = [
  /^\/login/i,
  /^\/password-reset/i,
  /^\/regestrieren/i,
  /^\/registrieren/i,
  /^\/profil/i,
  /^\/admin\//i,
];

const CONSENT_KEY = 'wr-monitoring-consent';
export const CONSENT_GRANTED = 'granted';
export const CONSENT_DENIED = 'denied';
const CONSENT_EVENT = 'wr-monitoring-consent-changed';

export interface TelemetryConfig {
  site: string | undefined;
  clientToken: string | undefined;
  appId: string;
  org: string;
  insecure: boolean;
  enabled: boolean;
}

export interface TelemetryUser {
  id: string;
  name: string;
  [key: string]: string;
}

type TelemetrySdk = typeof import('./telemetrySdk');

let sdk: TelemetrySdk | null = null;
let loading: Promise<void> | null = null;
let currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
let currentUser: TelemetryUser | null = null;

/**
 * Removes query string and fragment from a URL. They can carry password-reset
 * tokens, OIDC authorization codes/state and signed image URLs.
 */
export function scrubUrl<T>(value: T): T {
  if (typeof value !== 'string' || value === '') return value;
  try {
    const url = new URL(value, window.location.origin);
    url.search = '';
    url.hash = '';
    return url.toString() as T;
  } catch {
    return value.split(/[?#]/)[0] as T;
  }
}

export function isSensitiveRoute(pathname: string | null | undefined): boolean {
  return SENSITIVE_ROUTES.some((pattern) => pattern.test(pathname || ''));
}

function config(): TelemetryConfig {
  const env = import.meta.env;
  return {
    site: env.VITE_OPENOBSERVE_SITE,
    clientToken: env.VITE_OPENOBSERVE_RUM_KEY,
    appId: env.VITE_OPENOBSERVE_APP_ID || 'wildrovers-frontend',
    org: env.VITE_OPENOBSERVE_ORG || 'default',
    insecure: env.VITE_OPENOBSERVE_INSECURE_HTTP === 'true',
    enabled: env.VITE_OPENOBSERVE_ENABLED !== 'false',
  };
}

/** Whether this deployment has monitoring at all (only then is consent asked for). */
export function isTelemetryConfigured(): boolean {
  const c = config();
  // Unreplaced container placeholders count as "not configured".
  const set = (v: string | undefined) => Boolean(v) && !String(v).startsWith('PLACEHOLDER_');
  return c.enabled && set(c.site) && set(c.clientToken);
}

export function getTelemetryConsent(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

/**
 * Stores the visitor's choice. Granting starts monitoring right away; withdrawing stops the
 * replay and reloads the page, because the SDKs cannot be unloaded once started.
 */
export function setTelemetryConsent(value: string): void {
  const wasRunning = sdk !== null;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Private mode without storage: the choice holds for this page view only.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  if (value === CONSENT_GRANTED) {
    loadSdk();
  } else if (wasRunning) {
    sdk?.stopReplay();
    window.location.reload();
  }
}

export function onTelemetryConsentChange(listener: (value: string) => void): () => void {
  const handler = (e: Event) => listener((e as CustomEvent<string>).detail);
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

function loadSdk(): Promise<void> | null {
  if (sdk || loading || !isTelemetryConfigured()) return loading;
  loading = import('./telemetrySdk')
    .then((module) => {
      module.start(config());
      sdk = module;
      if (currentUser) module.setUser(currentUser);
      module.syncReplay(currentPath);
    })
    .catch((err) => {
      console.warn('Monitoring could not be started', err);
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}

/**
 * Starts monitoring after the first render, when the browser is idle, and only with consent.
 * Called once from main.tsx.
 */
export function initTelemetry(): void {
  if (!isTelemetryConfigured() || getTelemetryConsent() !== CONSENT_GRANTED) return;
  const start = () => loadSdk();
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(start, { timeout: 5000 });
  } else {
    window.setTimeout(start, 2000);
  }
}

/** Tags monitoring data with the logged-in account (applied once the SDK is running). */
export function setTelemetryUser(user: TelemetryUser): void {
  currentUser = user;
  if (sdk) sdk.setUser(user);
}

/** Starts session replay on ordinary pages and stops it on sensitive ones. */
export function syncReplayWithRoute(pathname: string): void {
  currentPath = pathname;
  if (sdk) sdk.syncReplay(pathname);
}

/** Removes one-time secrets (tokens, codes) from the address bar once they were read. */
export function removeQueryParams(...names: string[]): void {
  const url = new URL(window.location.href);
  let changed = false;
  names.forEach((name) => {
    if (url.searchParams.has(name)) {
      url.searchParams.delete(name);
      changed = true;
    }
  });
  if (changed) {
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  }
}
