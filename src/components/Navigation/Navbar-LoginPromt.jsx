import React from 'react';
import { useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import LoginIcon from '@mui/icons-material/Login';
import { redirectToAuthentik } from '../../helper/oidc';

const Navbar_LoginPromt = () => {
  const location = useLocation();

  const handleLogin = async () => {
    try {
      await redirectToAuthentik();
    } catch (e) {
      console.error("Failed to redirect to OIDC provider", e);
    }
  };

  const isLoginPage = location.pathname.toLowerCase() === "/login";

  return (
    <React.Fragment>
      {!isLoginPage ? (
        <Button 
          onClick={handleLogin} 
          variant="outlined" 
          color="primary"
          size="medium" 
          startIcon={<LoginIcon />} 
          sx={{ 
            marginTop: { xs: 1, md: 2 },
            marginBottom: { xs: 1, md: 0 },
            px: 3, 
            borderColor: 'primary.main',
            '&:hover': {
              borderColor: 'primary.light',
              backgroundColor: 'rgba(255, 152, 0, 0.08)'
            }
          }}
        >
          LogIn
        </Button>
      ) : null}
    </React.Fragment>
  );
};

export default Navbar_LoginPromt;
