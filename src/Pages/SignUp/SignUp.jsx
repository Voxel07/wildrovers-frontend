import React from 'react'
import SignUpForm from '../../components/User/SignUpForm'

import Typography from '@mui/material/Typography';
import Grid from '@material-ui/core/Grid';

export default function SignUp() {
  return (
    <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
            <Typography>Regestrier dich</Typography>
        </Grid>
        <Grid item>
            <SignUpForm />
        </Grid>

    </Grid>
  )
}
