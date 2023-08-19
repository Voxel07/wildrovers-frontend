/**
 * This is the Modal to add a ne Category
 */
import React, {useRef , useState, useEffect, useContext } from 'react';

 import axios from 'axios';
 import { Formik, Field, Form } from 'formik';
 import * as yup from 'yup';

 //Feedback
 import Alert from '@mui/material/Alert';
 import Stack from '@mui/material/Stack';
 import Grid from '@mui/material/Grid';

 // Category name
 import TextField from '@mui/material/TextField';

 //Button
 import Button from '@mui/material/Button';
 import { Container, Typography } from '@mui/material';
 import { Autocomplete } from 'formik-mui'; //https://stackworx.github.io/formik-mui/
 import { red } from '@mui/material/colors';
 import { AlertsContext } from '../../components/utils/AlertsManager';

 //Auth
 import useAuth from '../../context/useAuth';

 const AddTopic = React.forwardRef((props, ref) => {
    console.log(props.category)
    const formikRef = useRef();
    const alertsManagerRef = useContext(AlertsContext);


    const{ auth } = useAuth();
    const [state, setState] = useState({ resCode: null, resData: null });
    const [topics, setTopics] = useState([]);
    const possibleTopics = [];

 //------------Modal-------------------------------------

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
        Topic: yup.string().required().min(3, "Name muss min. 3 Zeichen haben").max(20,"Name darf max. 20 Zeichen haben"),
     })

 //----Functions-------------------------

    useEffect(() => {
        const topics = props.topics.map((element) => ({
            label: element.topic,
            id: element.id,
        }));

        setTopics(topics)
    }, [props.topics])


    async function saveTopicToDB(vals){
    axios.put(
    'http://localhost/forum/topic:8080',
    {
        topic: vals.Topic
    },
    {
        headers:{ Authorization: `Bearer ${auth.JWT}`}
        ,params:{category: props.category.id}
    }
    ).then(
        response =>{
            setState({resCode: response.status, resData: ""});
            alertsManagerRef.current.showAlert('success', 'Thema: '+ vals.Topic +' Erfolgreich erstellt');

            props.callback();
            props.onAddTopic();
        }
    )
    .catch(error=>{
        let resCode = error.response.status;
        let resData;

        if (resCode === 401) {
            resData = "Nicht angemeldet!";
        } else if (resCode === 403) {
            resData = "Du bist für diese Aktion nicht berechtigt!\nDein Rang: "+ auth.roles +" benötigter Rang: Frischling";
        } else {
            resData = error.response.data;
        }

        setState({ resCode, resData });
    })
    }
    const {resCode, resData} = state;

   return (
    <React.Fragment >
        <Formik
            innerRef={formikRef}
            validateOnChange={true}
            initialValues={{
                Topic: '',
            //  Position: '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (data, { setSubmitting, resetForm }) => {
                setSubmitting(true);
                await saveTopicToDB(data);
                resetForm(true);
                setSubmitting(false);
                }
            }
        >
            {
            ({ values, errors, isSubmitting , touched}) => (
            <div>
                <Container className="Form-Container" sx={{...style, width:0.33}} >
                    <Typography sx={{marginBottom:5}}>Neues Thema zu {props.category.name} hinzufügen</Typography>
                    <Form className="Form">
                    <Field variant="outlined" label="Name des Themas" name="Topic" type="input" error={!!errors.Name} helperText={errors.Name} as={TextField} />
                    {/* <Field  component={Autocomplete} name="Position" options={possibleTopics} getOptionLabel={(option)=>(option ? option.lable : "")} renderInput={(params) => (
                        <TextField
                        {...params}
                        // We have to manually set the corresponding fields on the input component
                        name="Position"
                        error={!!touched['Position'] && !!errors['Position']}
                        helperText={!!touched['Position'] && errors['Position'] && String(errors.Position)}
                        sx={{
                            color:red,
                            marginTop: 3
                        }}
                        label="Reihenfolge"
                        variant="outlined"
                        />
                    )}
                    /> */}
                    <Grid container direction="row" justifyContent="space-between">
                    <Button disabled={isSubmitting || !errors} type='submit'> Hinzufügen </Button>
                    <Button onClick={props.callback} color="error"> Abbrechen </Button>
                    </Grid>
                        {/* <pre> {JSON.stringify(values, null, 2)} </pre> */}
                    </Form>
                <Grid container alignItems="center" justifyContent="start">
                <Grid item>
                        <Stack  spacing={2} marginTop={2}>
                        {
                            !!resData && resCode > 200 ? <Alert severity="error" style={{ whiteSpace: "pre-wrap" }}>{resData}</Alert>:null

                        }
                        </Stack>
                    </Grid>
                </Grid >
                </Container>

            </div>
            )
            }
        </Formik>

    </React.Fragment>
   );
 })


 export default AddTopic;