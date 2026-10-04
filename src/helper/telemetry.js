import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';

// Routes that handle credentials, one-time tokens/codes or personal settings.
// Session replay never records them (replay meta records contain the full URL).
const SENSITIVE_ROUTES = [
  /^\/login/i,
  /^\/password-reset/i,
  /^\/regestrieren/i,
  /^\/profil/i,
  /^\/admin\//i,
];

let telemetryEnabled = false;
let replayRunning = false;

/**
 * Removes query string and fragment from a URL. They can carry password-reset
 * tokens, OIDC authorization codes/state and signed image URLs.
 */
export function scrubUrl(value) {
  if (typeof value !== 'string' || value === '') return value;
  try {
    const url = new URL(value, window.location.origin);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return value.split(/[?#]/)[0];
  }
}

function scrubRumEvent(event) {
  if (event.view) {
    event.view.url = scrubUrl(event.view.url);
    if (event.view.referrer) event.view.referrer = scrubUrl(event.view.referrer);
  }
  if (event.resource?.url) event.resource.url = scrubUrl(event.resource.url);
  if (event.error?.resource?.url) event.error.resource.url = scrubUrl(event.error.resource.url);
  return true;
}

function scrubLogEvent(log) {
  if (log.view?.url) log.view.url = scrubUrl(log.view.url);
  if (log.view?.referrer) log.view.referrer = scrubUrl(log.view.referrer);
  if (log.http?.url) log.http.url = scrubUrl(log.http.url);
  return true;
}

export function isSensitiveRoute(pathname) {
  return SENSITIVE_ROUTES.some((pattern) => pattern.test(pathname || ''));
}

export function initTelemetry() {
  const ooSite = import.meta.env.VITE_OPENOBSERVE_SITE;
  const ooClientToken = import.meta.env.VITE_OPENOBSERVE_RUM_KEY;
  const ooAppId = import.meta.env.VITE_OPENOBSERVE_APP_ID || 'wildrovers-frontend';
  const ooOrg = import.meta.env.VITE_OPENOBSERVE_ORG || 'default';
  const ooInsecure = import.meta.env.VITE_OPENOBSERVE_INSECURE_HTTP === 'true';
  const ooEnabled = import.meta.env.VITE_OPENOBSERVE_ENABLED !== 'false';

  if (!ooEnabled || !ooSite || !ooClientToken) return;

  openobserveRum.init({
    applicationId: ooAppId,
    clientToken: ooClientToken,
    site: ooSite,
    organizationIdentifier: ooOrg,
    service: 'wildrovers-frontend',
    env: import.meta.env.MODE || 'production',
    version: '1.0.0',
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    apiVersion: 'v1',
    insecureHTTP: ooInsecure,
    // Replays never contain page text or form input; sensitive views are not recorded at all.
    defaultPrivacyLevel: 'mask',
    startSessionReplayRecordingManually: true,
    beforeSend: scrubRumEvent,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 50
  });

  openobserveLogs.init({
    clientToken: ooClientToken,
    site: ooSite,
    organizationIdentifier: ooOrg,
    service: 'wildrovers-frontend',
    env: import.meta.env.MODE || 'production',
    version: '1.0.0',
    apiVersion: 'v1',
    insecureHTTP: ooInsecure,
    forwardErrorsToLogs: true,
    beforeSend: scrubLogEvent
  });

  telemetryEnabled = true;
  syncReplayWithRoute(window.location.pathname);
}

/** Starts session replay on ordinary pages and stops it on sensitive ones. */
export function syncReplayWithRoute(pathname) {
  if (!telemetryEnabled) return;
  const sensitive = isSensitiveRoute(pathname);
  if (sensitive && replayRunning) {
    openobserveRum.stopSessionReplayRecording();
    replayRunning = false;
  } else if (!sensitive && !replayRunning) {
    openobserveRum.startSessionReplayRecording();
    replayRunning = true;
  }
}

/** Removes one-time secrets (tokens, codes) from the address bar once they were read. */
export function removeQueryParams(...names) {
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
