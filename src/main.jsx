import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import faviconUrl from './images/Tab_Logo.png';

const faviconLink = document.querySelector("link[rel*='icon']");
if (faviconLink) {
  faviconLink.type = 'image/png';
  faviconLink.href = faviconUrl;
}

import { AuthProvider } from './context/AuthProvider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';

const ooSite = import.meta.env.VITE_OPENOBSERVE_SITE;
const ooClientToken = import.meta.env.VITE_OPENOBSERVE_RUM_KEY;
const ooAppId = import.meta.env.VITE_OPENOBSERVE_APP_ID || 'wildrovers-frontend';
const ooOrg = import.meta.env.VITE_OPENOBSERVE_ORG || 'default';
const ooInsecure = import.meta.env.VITE_OPENOBSERVE_INSECURE_HTTP === 'true';
const ooEnabled = import.meta.env.VITE_OPENOBSERVE_ENABLED !== 'false';

if (ooEnabled && ooSite && ooClientToken) {
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
    defaultPrivacyLevel: 'allow',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 50
  });

  openobserveRum.startSessionReplayRecording();

  openobserveLogs.init({
    clientToken: ooClientToken,
    site: ooSite,
    organizationIdentifier: ooOrg,
    service: 'wildrovers-frontend',
    env: import.meta.env.MODE || 'production',
    version: '1.0.0',
    apiVersion: 'v1',
    insecureHTTP: ooInsecure,
    forwardErrorsToLogs: true
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  </StrictMode>
);
