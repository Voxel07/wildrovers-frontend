/**
 * This is the Modal to add a ne Category
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Field, Form } from 'formik';
import * as yup from 'yup';

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
import { Container } from '@mui/material';

import { Autocomplete } from 'formik-mui'; //https://stackworx.github.io/formik-mui/
import { red } from '@mui/material/colors';

export default function AddCategory(props) {

    const [possibleCategories, setPossibleCategories] = useState({ hits: [] });
    const [filteredCategories, setFilteredCategories] = useState({ hits: [] });
    const [requestResponseText, setRequestResponseText] = useState();
    const [requestResponseCode, setRequestResponseCode] = useState();

    const validationSchema = yup.object({
        Name: yup
            .string()
            .required()
            .min(3, "Name muss min. 3 Zeichen haben")
            .max(20,"Name darf max. 20 Zeichen haben"),
        Position: yup.mixed().required(),
        Visibility: yup.mixed().required()
    })

    function test(data){
        console.log("filtering data: ");
        let filtered;
        let i = 0;
        for (const element of data) {
            // filtered.push(element.category);
             console.log(element.category);
            console.log(i);
            i++;

        }
        // console.log("awdawdw");
        console.log(filtered);
        setFilteredCategories(filtered);
    }
    function addCategory(vals){
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

    useEffect(() => {
    const fetchCategories = async () => {
        const result = await axios.get(
        'http://localhost:8080/forum/category',
        );
        setPossibleCategories(result.data);
        test(result.data);

    };


    fetchCategories();
    }, []);


  return (

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
            console.log(data);
            setSubmitting(false);
            addCategory(data);
            // resetForm(true);

        }
    }
   >
    {
         ({ values, errors, isSubmitting , touched}) => (
            <div>
             <Container className="Form-Container" sx={{width:0.25, marginTop:5}} >
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
                 <Button disabled={isSubmitting || !errors} type='submit'> submit </Button>
                    <pre> {JSON.stringify(values, null, 2)} </pre>
                 </Form>

             </Container>
             <Grid container alignItems="center" justifyContent="center">
                <Stack sx={{ width: '33%' }} spacing={2}>

                {
                    requestResponseCode > 200 ?
                    <Alert severity="error">{requestResponseText}</Alert>
                    :
                    <Alert severity="success">{requestResponseText}</Alert>
                }

                </Stack>
            </Grid >
             </div>
         )

    }

   </Formik>
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

