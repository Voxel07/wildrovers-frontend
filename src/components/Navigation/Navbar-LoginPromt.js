/**
 * This is the Modal to Login
 */
 import React, { useState, useEffect } from 'react';
 import axios from 'axios';
 import { Formik, Field, Form } from 'formik';


 // Category name
 import Box from '@mui/material/Box';
 import TextField from '@mui/material/TextField';
 import Grid from '@mui/material/Grid';
 import Alert from '@mui/material/Alert';
 import Stack from '@mui/material/Stack';

 //Button
 import Button from '@mui/material/Button';
 import { Container, Typography } from '@mui/material';
 import * as yup from 'yup';

 //Cookie
 import Cookies from 'universal-cookie';

 import Modal from '@mui/material/Modal';
 import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
 // import { connect } from "react-redux";
export default function Navbar_LoginPromt() {

    const [requestResponseText, setRequestResponseText] = useState();
    const [requestResponseCode, setRequestResponseCode] = useState();
  //------------Modal-------------------------------------

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  //--------Modal-Style-------------------------------
  const style = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      border: '2px solid #000',
      boxShadow: 24,
      p: 4,
    };

//------------Modal Ende----------------------------

function saveJwtToken(token){
    // const cookies = new Cookies();
    localStorage.setItem("jwt",token);

    // cookies.set('rüdiger', token, { path: '/' });
    // console.log(cookies.get('jwt')); // Pacman
}

 //Warum wird das ausgeführt
 useEffect(() => {
    if (requestResponseCode == 200)
    {
        console.log("Mach zu das Ding");
        saveJwtToken(requestResponseText);
        handleClose();
    }});


function LogIn(vals){
    axios.create({
        validateStatus: (status) => { //this changes shit
            return status >= 100 && status < 600
          },
    }).post('http://localhost:8080/user/login',
    {
        userName: vals.userName,
        password: vals.password,

    }
    ).then(
        response =>
        {
            setRequestResponseCode(response.status)
            setRequestResponseText(response.data)

            // console.log("data:",response.data);
            // console.log("statusText:",response.statusText);
            // console.log("Code:",response.status);
            // console.log("headers:",response.headers);
            // console.log("config:",response.config);


        }
    )
}


  return (
    <React.Fragment>
        <Button onClick={handleOpen} variant="outlined" size="medium" startIcon={<AddCircleOutlineOutlinedIcon />} sx={{marginTop: 2}}>LogIn</Button>
        <Modal
            disableScrollLock
            // hideBackdrop
            open={open}
            onClose={handleClose}
            //Disables that the modal is closed when the bg is clicked
            // onClose = {(_, reason) => {
            //     if (reason !== "backdropClick") {
            //     handleClose();
            //     }
            // }}
        >
        <Formik
            initialValues={
                {
                    userName:'',
                    password:'',
                }
            }

            onSubmit={
                (data, { setSubmitting, resetForm }) => {
                    setSubmitting(true);
                    //Post From
                    LogIn(data);
                    console.log(data);
                    resetForm(true);

                }
            }
        >
            {
                ({ values, errors, isSubmitting }) => (
                    <Box>
                    <Container className="Form-Container" sx={{...style}}>
                        <Typography sx={{marginBottom:5}}>Melde dich an</Typography>

                        <Form className="Form">
                        <Grid container direction="column" justifyContent="space-between">
                            <Grid item>
                                <Field variant="outlined" label="Benutzername oder Email" name="userName" type="input"
                                        error={!!errors.userName} helperText={errors.userName} as={TextField}
                                        sx={{width:1}}
                                />
                            </Grid>
                            <Grid item>
                            <Field variant="outlined" label="Passwort" name="password" type="password"
                            error={!!errors.password} helperText={errors.password} as={TextField}
                            sx={{
                                marginTop: 2,
                                width:1
                            }}
                            />
                            </Grid>
                        </Grid>

                            <Grid container direction="row" justifyContent="space-between">
                                <Button disabled={isSubmitting || !errors} type='submit'> LogIn </Button>
                                <Button onClick={handleClose} color="error"> Abbrechen </Button>
                            </Grid>
                        </Form>
                    <Grid container alignItems="center" justifyContent="center">
                    <Stack  spacing={2}>
                    {
                        requestResponseText && requestResponseCode > 200 ? <Alert severity="error">{requestResponseText}</Alert>:null

                    }
                    </Stack>
                </Grid >
                </Container>

            </Box>
                )
            }
        </Formik>
        </Modal>
    </React.Fragment>
  )
}
