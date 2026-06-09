import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import LoginIcon from '@mui/icons-material/Login';
import SignIn from '../../Pages/LogIn/LogIn';

const Navbar_LoginPromt = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const isLoginPage = location.pathname.toLowerCase() === "/login";

  return (
    <React.Fragment>
      {!isLoginPage ? (
        <Button 
          onClick={handleOpen} 
          variant="outlined" 
          color="primary"
          size="medium" 
          startIcon={<LoginIcon />} 
          sx={{ 
            px: { xs: 1.5, sm: 3 }, 
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

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="login-modal-title"
        aria-describedby="login-modal-description"
      >
        <SignIn modal={true} callback={handleClose} />
      </Modal>
    </React.Fragment>
  );
};

export default Navbar_LoginPromt;
