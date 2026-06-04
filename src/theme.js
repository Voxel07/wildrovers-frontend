import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff9800', // Tactical Amber/Orange
      contrastText: '#121212',
    },
    secondary: {
      main: '#8bc34a', // Tactical Green / Olive
      contrastText: '#121212',
    },
    background: {
      default: '#121212', // Dark slate background
      paper: '#1e1e1e',   // Cards & dialog panels background
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#b0bec5',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 550 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)',
          },
        },
        containedSecondary: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(139, 195, 74, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1e1e1e',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 8,
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: '8px 0',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
