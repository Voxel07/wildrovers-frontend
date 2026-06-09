import React from 'react'
import SignUpForm from '../../components/User/SignUpForm'

import Box from '@mui/material/Box';

export default function SignUp() {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 400px)',
      width: '100%',
      px: 3
    }}>
      <SignUpForm />
    </Box>
  )
}
