// Loaded with a dynamic import() only after the visitor agreed to monitoring (see telemetry.js),
// so neither SDK is part of the first page load.
import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';
import { scrubUrl, isSensitiveRoute } from './telemetry';

// Share of sessions that send RUM data, and share of those that are also recorded as a
// replay. Enough to see errors and slow pages; most visits are not recorded at all.
const SESSION_SAMPLE_RATE = 50;
const SESSION_REPLAY_SAMPLE_RATE = 10;

let replayRunning = false;

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

export function start(config) {
  openobserveRum.init({
    applicationId: config.appId,
    clientToken: config.clientToken,
    site: config.site,
    organizationIdentifier: config.org,
    service: 'wildrovers-frontend',
    env: import.meta.env.MODE || 'production',
    version: '1.0.0',
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    apiVersion: 'v1',
    insecureHTTP: config.insecure,
    // Replays never contain page text or form input; sensitive views are not recorded at all.
    defaultPrivacyLevel: 'mask',
    startSessionReplayRecordingManually: true,
    beforeSend: scrubRumEvent,
    sessionSampleRate: SESSION_SAMPLE_RATE,
    sessionReplaySampleRate: SESSION_REPLAY_SAMPLE_RATE
  });

  openobserveLogs.init({
    clientToken: config.clientToken,
    site: config.site,
    organizationIdentifier: config.org,
    service: 'wildrovers-frontend',
    env: import.meta.env.MODE || 'production',
    version: '1.0.0',
    apiVersion: 'v1',
    insecureHTTP: config.insecure,
    forwardErrorsToLogs: true,
    beforeSend: scrubLogEvent
  });
}

export function setUser(user) {
  openobserveRum.setUser(user);
}

/** Starts session replay on ordinary pages and stops it on sensitive ones. */
export function syncReplay(pathname) {
  const sensitive = isSensitiveRoute(pathname);
  if (sensitive && replayRunning) {
    openobserveRum.stopSessionReplayRecording();
    replayRunning = false;
  } else if (!sensitive && !replayRunning) {
    openobserveRum.startSessionReplayRecording();
    replayRunning = true;
  }
}

export function stopReplay() {
  if (replayRunning) {
    openobserveRum.stopSessionReplayRecording();
    replayRunning = false;
  }
}
