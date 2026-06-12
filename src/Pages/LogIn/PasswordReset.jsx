import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../helper/api';

// Mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LockResetIcon from '@mui/icons-material/LockReset';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function PasswordReset() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine mode from query token
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  const goLogin = () => navigate("/Login");

  // Reset page state when token query changes
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsFinished(false);
  }, [token]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/secrets/reset-request', {
        email: email.trim()
      });

      if (response.status === 200) {
        setSuccessMsg(response.data?.message || "E-Mail wurde erfolgreich gesendet.");
        setIsFinished(true);
      } else {
        setErrorMsg(response.data?.message || "Fehler beim Anfordern des Links.");
      }
    } catch (error) {
      console.error("Reset request error:", error);
      setErrorMsg(error.response?.data?.message || error.response?.data || "Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg("Bitte fülle alle Passwortfelder aus.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/secrets/reset-password', {
        token: token.trim(),
        password: password
      });

      if (response.status === 200) {
        setSuccessMsg(response.data?.message || "Passwort erfolgreich zurückgesetzt.");
        setIsFinished(true);
      } else {
        setErrorMsg(response.data?.message || "Zurücksetzen des Passworts fehlgeschlagen.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setErrorMsg(error.response?.data?.message || error.response?.data || "Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 100px)',
      width: '100%',
      px: 3,
      py: 4
    }}>
      <Card sx={{
        maxWidth: 500,
        width: '100%',
        bgcolor: 'rgba(25, 25, 25, 0.65)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 4,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
        p: { xs: 3, sm: 4 },
        textAlign: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: 'rgba(255, 152, 0, 0.35)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8)'
        }
      }}>
        <CardContent sx={{ p: 0 }}>
          {isFinished ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: 'success.main', mb: 3 }} />
              
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: 'Outfit', 
                  fontWeight: 800, 
                  mb: 2, 
                  background: 'linear-gradient(45deg, #4caf50, #81c784)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent' 
                }}
              >
                Erfolgreich!
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6, px: 2 }}>
                {successMsg}
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={goLogin}
                fullWidth
                sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
              >
                Zum Login
              </Button>
            </Box>
          ) : token ? (
            /* Reset password form (Token present) */
            <Box component="form" onSubmit={handleResetPassword} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <LockResetIcon sx={{ fontSize: 64, color: 'primary.main', mb: 3 }} />
              
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: 'Outfit', 
                  fontWeight: 800, 
                  mb: 2, 
                  background: 'linear-gradient(45deg, #ff9800, #ffb74d)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent' 
                }}
              >
                Neues Passwort festlegen
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Bitte gib dein neues Passwort ein und bestätige es.
              </Typography>
              
              {errorMsg && (
                <Alert severity="error" sx={{ width: '100%', mb: 3, textAlign: 'left', borderRadius: 2 }}>
                  {errorMsg}
                </Alert>
              )}

              <Stack spacing={2.5} sx={{ width: '100%', mb: 4 }}>
                <TextField
                  variant="outlined"
                  label="Neues Passwort"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <TextField
                  variant="outlined"
                  label="Passwort bestätigen"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  onClick={goLogin}
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2, border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  Abbrechen
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  type="submit"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Speichern"}
                </Button>
              </Stack>
            </Box>
          ) : (
            /* Request password reset link form (No token) */
            <Box component="form" onSubmit={handleRequestReset} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <EmailIcon sx={{ fontSize: 64, color: 'primary.main', mb: 3 }} />
              
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: 'Outfit', 
                  fontWeight: 800, 
                  mb: 2, 
                  background: 'linear-gradient(45deg, #ff9800, #ffb74d)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent' 
                }}
              >
                Passwort vergessen?
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, px: 1 }}>
                Trage deine E-Mail-Adresse ein, um einen Link zum Zurücksetzen deines Passworts anzufordern.
              </Typography>
              
              {errorMsg && (
                <Alert severity="error" sx={{ width: '100%', mb: 3, textAlign: 'left', borderRadius: 2 }}>
                  {errorMsg}
                </Alert>
              )}

              <Stack spacing={2.5} sx={{ width: '100%', mb: 4 }}>
                <TextField
                  variant="outlined"
                  label="E-Mail-Adresse"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  onClick={goLogin}
                  fullWidth
                  disabled={loading}
                  startIcon={<ArrowBackIcon />}
                  sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2, border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  Zurück zum Login
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  type="submit"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Link anfordern"}
                </Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
