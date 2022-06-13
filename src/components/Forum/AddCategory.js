/**
 * This is the Modal to add a ne Category
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Field, Form } from 'formik';
import * as yup from 'yup';
// import * as React from 'react';
//Feedback
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
// Category name
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

//Select Boxes
// import Autocomplete from '@mui/material/Autocomplete';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl, { useFormControl } from '@mui/material/FormControl';

//Button
import Button from '@mui/material/Button';
import { Container, Typography } from '@mui/material';

import { Autocomplete } from 'formik-mui'; //https://stackworx.github.io/formik-mui/
import { red } from '@mui/material/colors';
import Modal from '@mui/material/Modal';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
// import { connect } from "react-redux";
export default function AddCategory(props) {

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

//------------Modal Ende-----Yump-----------------------

    const validationSchema = yup.object({
        Name: yup
            .string()
            .required()
            .min(3, "Name muss min. 3 Zeichen haben")
            .max(20,"Name darf max. 20 Zeichen haben"),
        Position: yup.mixed().required(),
        Visibility: yup.mixed().required()
    })

//----Functions-------------------------

    function saveCategoryToDB(vals){
        const result = axios.create({
            validateStatus: (status) => {
                return status >= 100 && status < 600
              },
        }).put(
        'http://localhost:8080/forum/category?creator=' + 1,
        {
            category: vals.Name,
            position: vals.Position.pos,
            cisibility: vals.Visibility.pos
        }
        ).then(
            response =>{
                setRequestResponseCode(response.status)
                setRequestResponseText(response.data)
            }
        )

        console.log("result: ");
        console.log(result);
    }

  return (
    <React.Fragment>
        <Button onClick={handleOpen} variant="outlined" size="medium" startIcon={<AddCircleOutlineOutlinedIcon />} sx={{marginTop: 2}}>Kategorie erstellen</Button>
        <Modal
            disableScrollLock
            // hideBackdrop
            open={open}
            onClose = {(_, reason) => {
                if (reason !== "backdropClick") {
                handleClose();
                }
            }}
        >
        <Formik
            validateOnChange={true}
            initialValues={{
                Name: '',
                Position: '',
                Visibility: ''
            }}
            validationSchema={validationSchema}
            onSubmit={
                (data, { setSubmitting, resetForm }) => {
                    setSubmitting(true);
                    //Post From
                    setSubmitting(false);
                    saveCategoryToDB(data);
                    resetForm(true);

                }
            }
        >
            {
            ({ values, errors, isSubmitting , touched}) => (
            <div>
                <Container className="Form-Container" sx={{...style, width:0.33}} >
                    <Typography sx={{marginBottom:5}}>Neue Kategorie hinzufügen</Typography>
                    <Form className="Form">
                    <Field variant="outlined" label="Name der Kategorie" name="Name" type="input" error={!!errors.Name} helperText={errors.Name} as={TextField} />
                    <Field name="Position" component={Autocomplete} options={possibleCategorys} getOptionLabel={possibleCategorys.lable}renderInput={(params) => (
                        <TextField
                        {...params}
                        // We have to manually set the corresponding fields on the input component
                        name="Position"
                        error={touched['Position'] && !!errors['Position']}
                        helperText={errors['Position']}
                        sx={{
                            color:red,
                            marginTop: 3
                        }}
                        label="Reihenfolge"
                        variant="outlined"
                        />
                    )}
                    />
                    <Field name="Visibility" component={Autocomplete} options={possibleCategorys} getOptionLabel={possibleCategorys.lable}renderInput={(params) => (
                        <TextField
                        {...params}
                        // We have to manually set the corresponding fields on the input component
                        name="Visibility"
                        error={touched['Visibility'] && !!errors['Visibility']}
                        helperText={errors['Visibility']}
                        sx={{
                            color:red,
                            marginTop: 3
                        }}
                        label="Sichtbarkeit"
                        variant="outlined"
                        />
                    )}
                    />
                    <Grid container direction="row" justifyContent="space-between">
                    <Button disabled={isSubmitting || !errors} type='submit'> Hinzufügen </Button>
                    <Button onClick={handleClose} color="error"> Abbrechen </Button>
                    </Grid>
                        {/* <pre> {JSON.stringify(values, null, 2)} </pre> */}
                    </Form>
                </Container>
                <Grid container alignItems="center" justifyContent="center">
                    <Stack sx={{ width: '33%' }} spacing={2}>
                    {
                        requestResponseText ?
                        requestResponseCode > 200 ? <Alert severity="error">{requestResponseText}</Alert>:<Alert severity="success">{requestResponseText}</Alert>
                        : null
                    }
                    </Stack>
                </Grid >
            </div>
            )
            }
        </Formik>
        </Modal>
    </React.Fragment>
  );
}
const possibleCategorys = [
    { label: 'Allgemein', pos: "1" },
    { label: 'Vorstand', pos: "2" },
    { label: 'Intern', pos: "3" },
    { label: 'Das ist eine lange Kategorie', pos: "4" }
  ];
const posibleRanks = [
    { label: 'Besucher', id: 1 },
    { label: 'Frischling', id: 2 },
    { label: 'Mitglied', id: 3 },
    { label: 'Vorstand', id: 4 }
];

// export default connect(null, null, null, {forwardRef: true})(AddCategory);