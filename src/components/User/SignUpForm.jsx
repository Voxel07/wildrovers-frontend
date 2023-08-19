import React, { useContext, useState } from 'react'
// import './SignUp.csks';
import { useNavigate } from 'react-router-dom';

//Form
import { Formik, Field, Form } from 'formik';
import * as yup from 'yup';
import axios from 'axios'


//MUI
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';

//Eigene
import { UserContext } from '../../context/UserContext';

//Feedback
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import differenceInYears from "date-fns/differenceInYears";




function SignUpForm() {

    const [state, setState] = useState({ resCode: null, resData: null });
    const navigate = useNavigate();

    const handleSubmit = async(formData) =>{

        await axios.put('http://localhost:8080/user',
        {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            userName: formData.userName,
            password: formData.password
        })
        .then(response => {//handels only status code 200-300?
            console.log(JSON.stringify(response.data))
            setState({resCode:response.status, resData:response.data})
            navigate("/Regestrieren/Erfolgreich", {replace: true});


        })
        .catch(error => {//handle response codes over 400 here
            console.log("fuck")
            console.log(error.response)
            setState({resCode:error.response.status, resData:error.response.data})
        });

    }

    const validationSchema = yup.object({
        firstName: yup.string().required().min(3).max(20, "Max Länge 20"),
        lastName: yup.string().required().min(3,"Min. 3 Zeichen").max(20, "Max 20 Zeichen"),
        userName: yup.string().required().max(20, "Max Länge 20"),
        password: yup.string().required().min(8, "Passwort muss min. 8 Zeichen haben").max(256, "Password darf max. 256 Zeichen haben"),
        passwordWdh: yup.string().required().oneOf([yup.ref('password'), null], 'Passwörter müssen übereinstimmen'),
        email: yup.string().required().email(),
        // birthday: yup.date().nullable()
        // .test("dob", "Du musst min. 18 Jahre alt sein", function (value) {
        //   return differenceInYears(new Date(), new Date(value)) >= 18;
        // })
    })

    const {resCode, resData} = state;

    return (
    <Formik
        validateOnChange={true}
        initialValues={
            {
                firstName: '',
                lastName: '',
                userName:'',
                email:'',
                password:'',
                passwordWdh:'',
                // birthday:''
            }
        }
        validationSchema={validationSchema}
        onSubmit={async(data, { setSubmitting, resetForm }) => {
                setSubmitting(true);
                //Post From
                await handleSubmit(data); //async call
                setSubmitting(false);
                // resetForm(true);

            }
        }

    >
        {
            ({ values, errors, isSubmitting, touched }) => (
                <Form className="Form-Container" >
                    <Grid container direction="column" alignItems="center" spacing={2}>
                        <Grid item>
                            <Field variant="outlined" label="Vorname" name="firstName" type="input" error={!!errors.firstName && !!touched.firstName} helperText={!!touched.firstName && !!errors.firstName && String(errors.firstName)} as={TextField} />
                        </Grid>
                        <Grid item>
                            <Field variant="outlined" label="Nachname" name="lastName" type="input" error={!!errors.lastName && !!touched.lastName} helperText={!!touched.lastName && !!errors.lastName && String(errors.lastName)} as={TextField} />
                        </Grid>
                        <Grid item>
                            <Field variant="outlined" label="Benutzername" name="userName" type="input" error={!!errors.userName && !!touched.userName} helperText={!!touched.userName && !!errors.userName && String(errors.userName)} as={TextField} />
                        </Grid>
                        <Grid item>
                            <Field variant="outlined" label="Email" name="email" type="email" error={!!errors.email && !!touched.email} helperText={!!touched.email && !!errors.email && String(errors.email)} as={TextField} />
                        </Grid>
                        <Grid item>
                            <Field variant="outlined" label="Passwort" name="password" type="password" error={!!errors.password && !!touched.password} helperText={!!touched.password && !!errors.password && String(errors.password)} as={TextField}/>
                        </Grid>
                        <Grid item>
                            <Field variant="outlined" label="Passwort wiederholen" name="passwordWdh" type="password" error={!!errors.passwordWdh && !!touched.passwordWdh} helperText={!!touched.passwordWdh && !!errors.passwordWdh && String(errors.passwordWdh)} as={TextField} />
                        </Grid>
                        <Grid item>
                            {/* <Field variant="outlined"  name="geburtstag" type="date" error={!!errors.geburtstag && !!touched.geburtstag} helperText={!!touched.geburtstag && !!errors.geburtstag && String(errors.geburtstag)} as={TextField} /> */}
                        </Grid>
                        <Grid item>
                            <Button variant="outlined" disabled={isSubmitting || !errors} type='submit'> Jetzt Regestrieren </Button>
                        </Grid>
                        <Grid item>
                        <Stack  spacing={2} marginTop={2}>
                        {
                            !!resData && resCode > 200 ? <Alert severity="error">{resData}</Alert>:null
                        }
                        </Stack>
                    </Grid>
                    </Grid>
                </Form>
            )
        }
    </Formik>

    );
}

export default SignUpForm