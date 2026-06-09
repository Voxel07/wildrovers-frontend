import React from 'react';
import { useNavigate } from 'react-router-dom';

// Mui
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

export default function RegestrationSucessfull() {
    const navigate = useNavigate();

    const goHome = () => navigate("/");
    const goLogin = () => navigate("/Login");

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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                Wir haben dir eine E-Mail zur Verifizierung deines Kontos gesendet.
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontStyle: 'italic' }}>
                Bitte verifiziere dein Konto über den Link in der E-Mail, bevor du dich anmeldest.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={goHome}
                  fullWidth
                  sx={{ py: 1.2, fontWeight: 'bold' }}
                >
                  Startseite
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={goLogin}
                  fullWidth
                  sx={{ py: 1.2, fontWeight: 'bold' }}
                >
                  Zum Login
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
}
