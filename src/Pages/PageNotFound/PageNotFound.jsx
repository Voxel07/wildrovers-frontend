import React from 'react'
import Grid from '@material-ui/core/Grid';
import { useNavigate } from "react-router-dom"
import Typography from '@mui/material/Typography';
import Button from '@material-ui/core/Button'


import './PageNotFound.css';

import DeadLink from './DeadLink.jpg';


export default function PageNotFound() {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);
  const goHome = () => navigate("/");

  return (
    <Grid container direction="column" alignItems="center" spacing={2} sx={{}}>
      <Grid item>
        <Typography align="center" variant="h1" component="h1" sx={{marginTop:10} }>404</Typography>
        <img src={DeadLink} alt='Dead Link'></img>
        <Typography sx={{marginTop:2}}>Hier gibt es nichts</Typography>

        <Grid container direction="row" alignItems="center" justifyContent="space-between" sx={{}}>
          <Grid item> <Button variant="outlined" onClick={goHome}>Startseite</Button></Grid>
          <Grid item> <Button variant="outlined" onClick={goBack}>Zurück</Button></Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
