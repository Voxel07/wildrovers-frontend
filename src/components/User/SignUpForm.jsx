import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';

// MUI
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

// Feedback
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

function SignUpForm() {
    const [state, setState] = useState({ resCode: null, resData: null });
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        await axios.put('http://localhost:8080/user', {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            userName: formData.userName,
            password: formData.password
        })
        .then(response => {
            console.log(JSON.stringify(response.data));
            setState({ resCode: response.status, resData: response.data });
            navigate("/Regestrieren/Erfolgreich", { replace: true });
        })
        .catch(error => {
            console.log("Error during registration:", error.response);
            setState({ resCode: error.response.status, resData: error.response.data });
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
            <Grid container direction="column" alignItems="center" spacing={2}>
                <Grid item>
                    <TextField
                        variant="outlined"
                        label="Vorname"
                        type="text"
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        {...register("firstName")}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        variant="outlined"
                        label="Nachname"
                        type="text"
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        {...register("lastName")}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        variant="outlined"
                        label="Benutzername"
                        type="text"
                        error={!!errors.userName}
                        helperText={errors.userName?.message}
                        {...register("userName")}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        variant="outlined"
                        label="Email"
                        type="email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        {...register("email")}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        variant="outlined"
                        label="Passwort"
                        type="password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        {...register("password")}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        variant="outlined"
                        label="Passwort wiederholen"
                        type="password"
                        error={!!errors.passwordWdh}
                        helperText={errors.passwordWdh?.message}
                        {...register("passwordWdh")}
                    />
                </Grid>
                <Grid item>
                    <Button variant="outlined" disabled={isSubmitting} type="submit">
                        Jetzt Regestrieren
                    </Button>
                </Grid>
                <Grid item>
                    <Stack spacing={2} marginTop={2}>
                        {!!resData && resCode > 200 ? <Alert severity="error">{resData}</Alert> : null}
                    </Stack>
                </Grid>
            </Grid>
        </form>
    );
}

export default SignUpForm;