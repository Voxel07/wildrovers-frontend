import { useNavigate, useLocation } from "react-router-dom";
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginIcon from '@mui/icons-material/Login';
import useAuth from '../../context/useAuth';

const Unauthorized = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth } = useAuth();

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Card>
                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                    <LockOutlinedIcon color="primary" sx={{ fontSize: 56, mb: 2 }} aria-hidden="true" />
                    <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Kein Zugriff
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        {auth.isAuthenticated
                            ? 'Für diese Seite fehlt deinem Konto die nötige Berechtigung. Wende dich an den Vorstand, wenn du glaubst, dass das ein Fehler ist.'
                            : 'Diese Seite ist nur für angemeldete Mitglieder sichtbar.'}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                            Zurück
                        </Button>
                        {!auth.isAuthenticated && (
                            <Button
                                variant="contained"
                                startIcon={<LoginIcon />}
                                onClick={() => navigate('/Login', { state: { from: location.state?.from ?? location } })}
                            >
                                Anmelden
                            </Button>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
}

export default Unauthorized
