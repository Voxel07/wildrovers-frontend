import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

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
import TextField from '@mui/material/TextField';
import LoginIcon from '@mui/icons-material/Login';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

// Auth & OIDC
import useAuth from '../../context/useAuth';
import { redirectToAuthentik, exchangeCodeForToken, parseJwt } from '../../helper/oidc';
import api, { extractErrorMessage } from '../../helper/api';

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

const SignIn = React.forwardRef((props, ref) => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginState, dispatch] = useReducer(loginReducer, initialLoginState);
  const { loading, error } = loginState;

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = location.state?.from?.pathname || "/";
  const [blockedByAdmin, setBlockedByAdmin] = useState(false);

  // Show blocked banner if redirected here with ?blocked=true
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('blocked') === 'true') {
      setBlockedByAdmin(true);
    }
  }, [location.search]);

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

            const computedExpiresAt = payload.exp
              ? payload.exp * 1000
              : (tokens.expires_in ? (Date.now() + tokens.expires_in * 1000) : null);

            const authData = {
              JWT: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresAt: computedExpiresAt,
              user: username,
              roles: role
            };

            setAuth(authData);

            // Fetch /user/me to trigger backend DB JIT-provisioning for first-time OIDC users
            api.get('/user/me')
              .then((res) => {
                const dbUser = res.data;
                setAuth(prev => ({
                  ...prev,
                  canCreateCategory: dbUser?.canCreateCategory || false
                }));
                navigate(from, { replace: true });
              })
              .catch((err) => {
                console.error("JIT-provisioning via /user/me failed", err);
                setAuth({});
                const errorMsg = extractErrorMessage(err);
                dispatch({ type: 'LOGIN_ERROR', payload: errorMsg });
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

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      dispatch({ type: 'LOGIN_ERROR', payload: 'Bitte Benutzername/E-Mail und Passwort eingeben.' });
      return;
    }

    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await api.post('/user/login', {
        userName: usernameOrEmail,
        password: password
      });

      const authObject = response.data;
      const payload = parseJwt(authObject.JWT);
      const computedExpiresAt = payload?.exp ? payload.exp * 1000 : null;

      setAuth({
        JWT: authObject.JWT,
        user: authObject.USER.Name,
        roles: authObject.USER.Role,
        canCreateCategory: authObject.USER.canCreateCategory,
        expiresAt: computedExpiresAt
      });

      if (props.callback) {
        props.callback();
      }
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Local login failed", err);
      const errorMsg = extractErrorMessage(err);
      dispatch({ type: 'LOGIN_ERROR', payload: errorMsg });
    }
  };

  const cardContentInner = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold', fontFamily: 'Outfit' }}>
        {loading ? "Verifizierung..." : "Wild Rovers"}
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        {loading 
          ? "Der Token wird überprüft. Bitte warten..." 
          : "Melde dich mit deinem Konto an."}
      </Typography>

      {loading ? (
        <CircularProgress color="primary" sx={{ my: 2 }} />
      ) : (
        <Box component="form" onSubmit={handleLocalLogin} sx={{ width: '100%' }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Benutzername oder E-Mail"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            autoComplete="username"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
            <Link 
              to="/password-reset" 
              onClick={() => { if (props.callback) props.callback(); }}
              style={{ color: '#ff9800', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}
            >
              Passwort vergessen?
            </Link>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, py: 1.2, fontWeight: 'bold' }}
          >
            Einloggen
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              oder
            </Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          </Box>

          <Button
            variant="outlined"
            color="primary"
            size="large"
            fullWidth
            startIcon={<LoginIcon />}
            onClick={handleLoginClick}
            sx={{ py: 1.2, fontSize: '0.95rem' }}
          >
            Mit Authentik anmelden
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Noch kein Konto?{' '}
              <Link 
                to="/Regestrieren" 
                onClick={() => { if (props.callback) props.callback(); }}
                style={{ color: '#ff9800', textDecoration: 'none', fontWeight: 'bold' }}
              >
                Jetzt registrieren
              </Link>
            </Typography>
          </Box>
        </Box>
      )}

      {blockedByAdmin && (
        <Alert severity="warning" sx={{ width: '100%', mt: 3 }}>
          Dein Account wurde gesperrt. Bitte wende dich an einen Administrator.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ width: '100%', mt: 3 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  if (props.modal) {
    return (
      <Card 
        ref={ref}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 3,
          outline: 'none'
        }}
      >
        <IconButton
          color="error"
          onClick={props.callback}
          aria-label="close"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <CardContent sx={{ width: '100%', p: 0 }}>
          {cardContentInner}
        </CardContent>
      </Card>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Card sx={{ width: { xs: '90%', sm: 400 }, mx: 'auto', position: 'relative' }}>
        <CardContent sx={{ width: '100%' }}>
          {cardContentInner}
        </CardContent>
      </Card>
    </Container>
  );
});

export default SignIn;
