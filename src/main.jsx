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

import { initTelemetry } from './helper/telemetry';

initTelemetry();

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
