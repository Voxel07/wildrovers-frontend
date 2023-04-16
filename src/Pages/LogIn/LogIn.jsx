//React
import React, { useContext, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useLocation } from 'react-router-dom';

//Mui
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
//Form
import { Formik, Field, Form } from 'formik';
import * as yup from 'yup';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

//Auth
import useAuth from '../../context/useAuth';

import { UserContext } from '../../context/UserContext';

const SignIn = React.forwardRef((props, ref) => {

    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const {user, setUser} = useContext(UserContext);
    const [state, setState] = useState({ resCode: null, resData: null });

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


function myCloseButton (){
  return(
    <IconButton color="error" onClick={props.callback} aria-label="Schliesen" sx={{
        position:"absolute",
        right:"0",
        top:"0"

    }}>
        <CloseIcon />
    </IconButton>
  )
}

const submitForms = async(formData) =>{

    await axios.post('https://localhost/user/login',
    {
       userName: formData.username,
       password: formData.password,
    })
    .then(response => {//handels only status code 200-300?
        // console.log(response.data);
        // console.log(response.status);
        setState({resCode: response.status, resData: ""})
        setUser({name: response.data.USER.Name, roles: response.data.USER.Role});
        setAuth({JWT: response.data.JWT, user: response.data.USER.Name, roles: response.data.USER.Role});
        // console.log(props);
        {
            if(!!!props.modal)
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
        <div {...props} ref={ref}>
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
                <Container sx={{...style}}>
                {!!props.modal ? myCloseButton():null}

                <Grid container direction="column" alignItems="center" spacing={2} >
                    <Grid item >
                        <Typography>Melde dich an</Typography>
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
                </Container>
            </Form>
        )}
        </Formik>
        </div>
    )
}
)
export default SignIn
