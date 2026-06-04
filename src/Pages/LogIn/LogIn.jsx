import React, { use, useState, useEffect, useReducer } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Mui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LoginIcon from '@mui/icons-material/Login';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

// Auth & OIDC
import useAuth from '../../context/useAuth';
import { redirectToAuthentik, exchangeCodeForToken, parseJwt } from '../../helper/oidc';
import api from '../../helper/api';

// Map OIDC groups to local DB roles
function mapGroupsToRole(groups) {
  if (!groups || !groups.length) return "Besucher";
  
  let isAdmin = false;
  let isVorstand = false;
  let isMitglied = false;
  let isFrischling = false;

  groups.forEach(g => {
    const lower = g.toLowerCase();
    if (lower.includes("admin")) {
      isAdmin = true;
    } else if (lower.includes("vorstand") || lower.includes("aldermen")) {
      isVorstand = true;
    } else if (lower.includes("mitglied") || lower.includes("member") || lower.includes("user") || lower.includes("wrw")) {
      isMitglied = true;
    } else if (lower.includes("frischling") || lower.includes("freshman")) {
      isFrischling = true;
    }
  });

  if (isAdmin) return "Admin";
  if (isVorstand) return "Vorstand";
  if (isMitglied) return "Mitglied";
  if (isFrischling) return "Frischling";
  return "Besucher";
}

const initialLoginState = { loading: false, error: null };

function loginReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':   return { loading: true, error: null };
    case 'LOGIN_SUCCESS': return { loading: false, error: null };
    case 'LOGIN_ERROR':   return { loading: false, error: action.payload };
    case 'VERIFYING':     return { loading: true, error: null };
    case 'STOP_LOADING':  return { ...state, loading: false };
    default: return state;
  }
}

const SignIn = ({ ref, ...props }) => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginState, dispatch] = useReducer(loginReducer, initialLoginState);
  const { loading, error } = loginState;

  const from = location.state?.from?.pathname || "/";

  // Check URL for authorization code
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const hasVerifier = localStorage.getItem("oidc_verifier");

    if (code && hasVerifier) {
      dispatch({ type: 'VERIFYING' });
      exchangeCodeForToken(code)
        .then((tokens) => {
          if (!tokens) return;
          const payload = parseJwt(tokens.access_token || tokens.id_token);
          if (payload) {
            const username = payload.preferred_username || payload.sub;
            const groups = payload.groups || [];
            const role = mapGroupsToRole(groups);

            const authData = {
              JWT: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresAt: tokens.expires_in ? (Date.now() + tokens.expires_in * 1000) : null,
              user: username,
              roles: role
            };

            setAuth(authData);

            // Fetch /user/me to trigger backend DB JIT-provisioning for first-time OIDC users
            api.get('/user/me')
              .then(() => {
                navigate(from, { replace: true });
              })
              .catch((err) => {
                console.error("JIT-provisioning via /user/me failed", err);
                navigate(from, { replace: true });
              });
          } else {
            throw new Error("Invalid token payload");
          }
        })
        .catch((err) => {
          console.error("Token exchange error", err);
          dispatch({ type: 'LOGIN_ERROR', payload: "Anmeldung fehlgeschlagen. Bitte versuche es erneut." });
        })
        .finally(() => {
          dispatch({ type: 'STOP_LOADING' });
        });
    }
  }, [location, setAuth, navigate, from]);

  const handleLoginClick = async () => {
    try {
      dispatch({ type: 'LOGIN_START' });
      await redirectToAuthentik();
    } catch (err) {
      console.error("Redirect to Authentik failed", err);
      dispatch({ type: 'LOGIN_ERROR', payload: "Verbindung zum Authentik-Server fehlgeschlagen." });
    }
  };

  const style = props.modal ? {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 400 },
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 3
  } : {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: { xs: '90%', sm: 400 },
    mx: 'auto'
  };

  return (
    <div {...props} ref={ref}>
      <Container maxWidth="xs" sx={{ mt: props.modal ? 0 : 8 }}>
        <Card sx={{ ...style, position: 'relative' }}>
          {props.modal && (
            <IconButton
              color="error"
              onClick={props.callback}
              aria-label="close"
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          )}

          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
              <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {loading ? "Verifizierung..." : "Wild Rovers"}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
                {loading 
                  ? "Der OIDC-Token wird überprüft. Bitte warten..." 
                  : "Melde dich über unseren zentralen Authentik-Identity-Provider an."}
              </Typography>

              {loading ? (
                <CircularProgress color="primary" sx={{ my: 2 }} />
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={<LoginIcon />}
                  onClick={handleLoginClick}
                  sx={{ py: 1.5, fontSize: '1rem' }}
                >
                  Mit Authentik anmelden
                </Button>
              )}

              {error && (
                <Alert severity="error" sx={{ width: '100%', mt: 3 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default SignIn;
