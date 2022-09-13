/**
 * This is the Modal to Login
 */
 import React from 'react';
 import { useLocation } from 'react-router-dom';

 //Button
 import Button from '@mui/material/Button';

 import Modal from '@mui/material/Modal';
 import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';

import SignIn from '../../Pages/LogIn/LogIn';

const Navbar_LoginPromt = () => {

//------------Modal-------------------------------------

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };

    const location = useLocation()
    return (
    <React.Fragment>
        {location.pathname !="/login" ? <Button onClick={handleOpen} variant="outlined" size="medium" startIcon={<AddCircleOutlineOutlinedIcon />} sx={{marginTop: 2}}>LogIn</Button> : null}
        <Modal
            disableScrollLock
            open={open}
            onClose={handleClose}
        >
        <SignIn modal="true" callback={handleClose} />

        </Modal>
    </React.Fragment>
  )
}

export default Navbar_LoginPromt;
