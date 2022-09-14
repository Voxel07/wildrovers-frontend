import React from 'react'
import { useNavigate } from "react-router-dom"

//Mui
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@material-ui/core/Grid';

export default function RegestrationSucessfull() {

    const navigate = useNavigate();

    const goHome = () => navigate("/");
    const goLogin = () => navigate("/LogIn");

  return (
    <Grid container direction="column" alignItems="center">
        <Grid item>
            <Typography>Du hast dich erfolgreich regestriert. Wir haben dir eine Email zur verifizierung deines Kontos gesendet.</Typography>
            <Typography>Du musst dein Konto verifizieren bevor du dich anmelden kannst</Typography>
        </Grid>
        <Grid item>
            <Grid container direction="row" alignItems="center">
                <Grid item>
                    <Button variante="outlined" onClick={goHome}>Startseite</Button>
                </Grid>
                <Grid item>
                    <Button variante="outlined" onClick={goLogin}>LogIn</Button>
                </Grid>
            </Grid>
        </Grid>


    </Grid>

  )
}
