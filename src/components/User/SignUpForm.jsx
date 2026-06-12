import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../helper/api';

// MUI
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import BlockIcon from '@mui/icons-material/Block';

function SignUpForm() {
    const [state, setState] = useState({ resCode: null, resData: null });
    const [signupEnabled, setSignupEnabled] = useState(true);
    const [signupStatusLoading, setSignupStatusLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/user/signup-status')
            .then(res => setSignupEnabled(res.data.signupEnabled))
            .catch(() => setSignupEnabled(true)) // fail open
            .finally(() => setSignupStatusLoading(false));
    }, []);

    const handleSubmit = async (formData) => {
        await api.put('/user', {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            userName: formData.userName,
            password: formData.password
        })
        .then(response => {
            console.log(JSON.stringify(response.data));
            setState({ resCode: response.status, resData: response.data });
            navigate("/Regestrieren/Erfolgreich", { replace: true, state: { email: formData.email } });
        })
        .catch(error => {
            console.log("Error during registration:", error.response);
            const status = error.response?.status || 500;
            const data = error.response?.data || error.message || "Registrierung fehlgeschlagen.";
            setState({ resCode: status, resData: data });
        });
    };

    const validationSchema = yup.object({
        firstName: yup.string().required("Vorname ist erforderlich").min(3, "Mindestens 3 Zeichen").max(20, "Max Länge 20"),
        lastName: yup.string().required("Nachname ist erforderlich").min(3, "Mindestens 3 Zeichen").max(20, "Max 20 Zeichen"),
        userName: yup.string().required("Benutzername ist erforderlich").max(20, "Max Länge 20"),
        password: yup.string().required("Passwort ist erforderlich").min(8, "Passwort muss min. 8 Zeichen haben").max(256, "Password darf max. 256 Zeichen haben"),
        passwordWdh: yup.string().required("Passwortwiederholung ist erforderlich").oneOf([yup.ref('password'), null], 'Passwörter müssen übereinstimmen'),
        email: yup.string().required("E-Mail ist erforderlich").email("Muss eine gültige E-Mail-Adresse sein"),
    });

    const { register, handleSubmit: handleFormSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            userName: '',
            email: '',
            password: '',
            passwordWdh: ''
        }
    });

    const onSubmit = async (data) => {
        await handleSubmit(data);
    };

    const { resCode, resData } = state;

    return (
        <form onSubmit={handleFormSubmit(onSubmit)} className="Form-Container">
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontFamily: 'Outfit', fontWeight: 800, color: '#f5f5f5', mb: 1 }}>
                    Registrieren
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Erstelle dein Wild Rovers Konto
                </Typography>
            </Box>

            {!signupStatusLoading && !signupEnabled && (
                <Alert
                    severity="error"
                    icon={<BlockIcon />}
                    sx={{ mb: 3, fontWeight: 'bold' }}
                >
                    Die Registrierung ist derzeit deaktiviert. Bitte wende dich an einen Administrator.
                </Alert>
            )}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        variant="outlined"
                        label="Vorname"
                        type="text"
                        fullWidth
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        {...register("firstName")}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        variant="outlined"
                        label="Nachname"
                        type="text"
                        fullWidth
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        {...register("lastName")}
                    />
                </Grid>
                <Grid size={12}>
                    <TextField
                        variant="outlined"
                        label="Benutzername"
                        type="text"
                        fullWidth
                        error={!!errors.userName}
                        helperText={errors.userName?.message}
                        {...register("userName")}
                    />
                </Grid>
                <Grid size={12}>
                    <TextField
                        variant="outlined"
                        label="E-Mail-Adresse"
                        type="email"
                        fullWidth
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        {...register("email")}
                    />
                </Grid>
                <Grid size={12}>
                    <TextField
                        variant="outlined"
                        label="Passwort"
                        type="password"
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        {...register("password")}
                    />
                </Grid>
                <Grid size={12}>
                    <TextField
                        variant="outlined"
                        label="Passwort wiederholen"
                        type="password"
                        fullWidth
                        error={!!errors.passwordWdh}
                        helperText={errors.passwordWdh?.message}
                        {...register("passwordWdh")}
                    />
                </Grid>
                <Grid size={12} sx={{ mt: 2 }}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        size="large" 
                        disabled={isSubmitting || !signupEnabled || signupStatusLoading} 
                        type="submit"
                        sx={{ py: 1.5, fontWeight: 'bold' }}
                    >
                        Jetzt registrieren
                    </Button>
                </Grid>
                <Grid size={12}>
                    <Stack spacing={2} marginTop={1}>
                        {!!resData && resCode > 200 ? (
                            <Alert severity="error">
                                {typeof resData === 'object' ? (resData.message || JSON.stringify(resData)) : resData}
                            </Alert>
                        ) : null}
                    </Stack>
                </Grid>
            </Grid>
        </form>
    );
}

export default SignUpForm;