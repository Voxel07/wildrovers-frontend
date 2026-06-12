import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../helper/api';

// Mui
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export default function RegestrationSucessfull() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const initialEmail = location.state?.email || '';
    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState('');
    const [isEmailReadOnly, setIsEmailReadOnly] = useState(!!initialEmail);
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [success, setSuccess] = useState(false);

    const goHome = () => navigate("/");
    const goLogin = () => navigate("/Login");

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!email) {
            setErrorMsg("Bitte gib deine E-Mail-Adresse ein.");
            return;
        }
        if (code.length !== 6 || !/^\d+$/.test(code)) {
            setErrorMsg("Der Code muss eine 6-stellige Zahl sein.");
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            const response = await api.post('/secrets/verify', {
                email: email.trim(),
                code: code.trim()
            });
            
            if (response.status === 200) {
                setSuccess(true);
            } else {
                setErrorMsg(response.data?.message || "Verifizierung fehlgeschlagen.");
            }
        } catch (error) {
            console.error("Verification error:", error);
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
        px: 3
      }}>
        <Card sx={{
          maxWidth: 500,
          width: '100%',
          bgcolor: 'rgba(30, 30, 30, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 4,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
          p: 4,
          textAlign: 'center',
          transition: 'border-color 0.3s',
          '&:hover': {
            borderColor: 'rgba(255, 152, 0, 0.3)'
          }
        }}>
          <CardContent>
            {success ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <VerifiedUserIcon sx={{ fontSize: 64, color: 'success.main', mb: 3 }} />
                
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
                  Erfolgreich verifiziert!
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                  Dein Konto wurde erfolgreich aktiviert. Du kannst dich jetzt einloggen.
                </Typography>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={goLogin}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 'bold' }}
                >
                  Zum Login
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleVerify} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <MarkEmailReadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 3 }} />
                
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
                  Registrierung erfolgreich!
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  Wir haben dir einen 6-stelligen Verifizierungscode an deine E-Mail-Adresse gesendet.
                </Typography>
                
                {errorMsg && (
                  <Alert severity="error" sx={{ width: '100%', mb: 3, textAlign: 'left' }}>
                    {typeof errorMsg === 'object' ? (errorMsg.message || JSON.stringify(errorMsg)) : errorMsg}
                  </Alert>
                )}

                <Stack spacing={2} sx={{ width: '100%', mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      variant="outlined"
                      label="E-Mail-Adresse"
                      type="email"
                      fullWidth
                      value={email}
                      disabled={isEmailReadOnly}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {isEmailReadOnly && (
                      <Button 
                        variant="text" 
                        size="small" 
                        onClick={() => setIsEmailReadOnly(false)}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        Ändern
                      </Button>
                    )}
                  </Box>

                  <TextField
                    variant="outlined"
                    label="6-stelliger Code"
                    type="text"
                    fullWidth
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCode(val);
                    }}
                    placeholder="123456"
                    slotProps={{
                      htmlInput: {
                        maxLength: 6,
                        style: { textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold' }
                      }
                    }}
                    required
                  />
                </Stack>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={goHome}
                    fullWidth
                    disabled={loading}
                    sx={{ py: 1.2, fontWeight: 'bold' }}
                  >
                    Startseite
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    fullWidth
                    disabled={loading}
                    sx={{ py: 1.2, fontWeight: 'bold' }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Verifizieren"}
                  </Button>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
}
