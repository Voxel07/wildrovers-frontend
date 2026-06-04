import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Prefer .jsx over .js so that renamed components are found correctly
    // even if old stub .js files still exist alongside them.
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-vendor';
            }
            if (id.includes('@mui/') || id.includes('@emotion/')) {
              return 'mui-vendor';
            }
            if (id.includes('date-fns') || id.includes('axios') || id.includes('formik') || id.includes('yup')) {
              return 'utils-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})

