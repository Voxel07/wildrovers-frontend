//React
import React, { useContext, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useLocation } from 'react-router-dom';

//Mui
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@mui/material/Typography';

//Form
import { Formik, Field, Form } from 'formik';
import * as yup from 'yup';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

//Auth
import useAuth from '../../context/useAuth';

import { UserContext } from '../../context/UserContext';
// import  LogIn  from '../../components/utils/util_LogIn';
//Cookie


export function SignIn(props) {

    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const {user, setUser} = useContext(UserContext);
    const [state, setState] = useState({ resCode: null, resData: null });

function testLogin(){
    console.log("jwt:" + localStorage.getItem("jwt"));
    axios.get('http://localhost:8080/secured/permit-all', {headers: { Authorization: `Bearer ${user.jwt}` }})
    .then(response => {
        console.log(response.data)
    })
    .catch(error => {
        console.log(error)
    })
}

const LogOut = () =>{
    setUser({valid:false, jwt:null});
}

const submitForms = async(formData) =>{

    await axios.post('http://localhost:8080/user/login',
    {
       userName: formData.username,
       password: formData.password,
    })
    .then(response => {//handels only status code 200-300?
        console.log(response.data);
        console.log(response.status);
        setState({resCode: response.status, resData: ""})
        setUser({valid: true, name: response.data.USER.Name});
        setAuth({JWT: response.data.JWT, roles: response.data.USER.Role, user: user});
        console.log(props);
        {
            if(!props.popUp)
            {
                navigate(from, {replace: true});
            }
        }
    })
    .catch(error => {//handle response codes over 400 here
        console.log(error.response.status);
        console.log(error.response.data);
        setState({resCode:error.response.status, resData:error.response.data})
    });

}
const validationSchema = yup.object({
    username: yup.string().min(3, "Mindestens 3 Zeichen").max(7,"Max 8 Zeichen").required("Pflichtfeld"),
    password: yup.string().required("Pflichtfeld"),
})



    const {resCode, resData} = state;
    return (
        <div>
        <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async(data, { setSubmitting , resetForm, }) => {
                setSubmitting(true);
                //Post From
                await submitForms(data); //async call
                resetForm({values:{
                    username:data.username,
                    password:""
                }});
             }}
            validationSchema={validationSchema}
        >
        {({values, errors, isSubmitting, touched }) => (
            <Form>
                <Grid container direction="column" alignItems="center" spacing={2}>
                    <Grid item>
                        <Typography sx={{marginBottom:5}}>Melde dich an</Typography>
                    </Grid>
                    <Grid item>
                        <Field variant="outlined"  label="Nickname" name="username" type="input" error={!!errors.username && !!touched.username} helperText={!!touched.username && !!errors.username && String(errors.username)} as={TextField} />
                    </Grid>
                    <Grid item>
                        <Field variant="outlined" label="Passwort" name="password" type="password" error={!!errors.password && !!touched.password} helperText={!!touched.password &&  !!errors.password && String(errors.password)} as={TextField} />
                    </Grid>
                    <Grid item>
                        <Button  variant="outlined" disabled={isSubmitting || !errors} type='submit'> LogIn </Button>
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
        )}
        </Formik>

        <Grid container direction="column" alignItems="center" spacing={2}>
            <Grid item>
                <Button onClick={testLogin} variant="outlined">TestLogin</Button>
            </Grid>
            <Grid item>
                <Button onClick={LogOut} variant="outlined">LogOut</Button>
            </Grid>
        </Grid>

        </div>
    )
}

export default SignIn
