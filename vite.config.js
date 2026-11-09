import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Only libraries that every page needs get a shared vendor chunk. Everything else (Quill,
// DataGrid, the telemetry SDKs, form validation, ...) stays with the lazily loaded route or
// component that imports it, so the first visit downloads only what the landing page uses.
const REACT_PACKAGES = ['react', 'react-dom', 'scheduler', 'react-router', 'react-router-dom'];
const MUI_CORE_PACKAGES = ['@mui/material', '@mui/system', '@mui/styled-engine', '@mui/utils', '@mui/private-theming', '@emotion/'];

function packageName(id) {
  const path = id.split('node_modules/').pop();
  const parts = path.split('/');
  return path.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
}

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          if (!normalized.includes('node_modules/')) return undefined;
          const name = packageName(normalized);
          if (REACT_PACKAGES.includes(name)) return 'react-vendor';
          if (MUI_CORE_PACKAGES.some((prefix) => (prefix.endsWith('/') ? name.startsWith(prefix) : name === prefix))) {
            return 'mui-vendor';
          }
          return undefined;
        }
      }
    }
  }
})
