import React from 'react'
import { useNavigate } from "react-router-dom"
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import './PageNotFound.css';

import DeadLink from './DeadLink.jpg';


export default function PageNotFound() {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);
  const goHome = () => navigate("/");

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        px: 2,
      }}
    >
      <Typography variant="h1" component="h1" sx={{ mb: 3 }}>
        404
      </Typography>
      <Box
        component="img"
        src={DeadLink}
        alt="Dead Link"
        sx={{ maxWidth: '100%', height: 'auto', mb: 3 }}
      />
      <Typography sx={{ mb: 3 }}>Hier gibt es nichts</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={goHome}>Startseite</Button>
        <Button variant="outlined" onClick={goBack}>Zurück</Button>
      </Stack>
    </Box>
  )
}
