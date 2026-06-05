/**
 * This is the Modal to add a ne Category
 */
import React, {useRef , useState, useEffect, use } from 'react';

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
 // Autocomplete handled via native MUI if needed
 import { red } from '@mui/material/colors';
 import { AlertsContext } from '../../components/utils/AlertsManager';

 //Auth
 import useAuth from '../../context/useAuth';

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

const AddTopic = ({ ref, ...props }) => {
     const formikRef = useRef();
     const{ auth } = useAuth();
     const [state, setState] = useState({ resCode: null, resData: null });
     const alertsManagerRef = use(AlertsContext);



     const validationSchema = yup.object({
        Topic: yup.string().required().min(3, "Name muss min. 3 Zeichen haben").max(20,"Name darf max. 20 Zeichen haben"),
     })

 //----Functions-------------------------




    async function saveTopicToDB(vals){
        const isEdit = !!props.topicToEdit;
        const url = 'http://localhost:8080/forum/topic';
        const data = isEdit ? {
            id: props.topicToEdit.id,
            topic: vals.Topic
        } : {
            topic: vals.Topic
        };
        const method = isEdit ? 'post' : 'put';
        const params = isEdit ? {} : { category: props.category.id };

        axios({
            method,
            url,
            data,
            params,
            headers: { Authorization: `Bearer ${auth.JWT}` }
        }).then(
            response =>{
                setState({resCode: response.status, resData: ""});
                alertsManagerRef.current.showAlert('success', isEdit ? 'Thema erfolgreich aktualisiert' : 'Thema: '+ vals.Topic +' Erfolgreich erstellt');

                props.callback();
                if (isEdit) {
                    props.onAddTopic();
                } else if (props.onAddTopicSuccess) {
                    props.onAddTopicSuccess(response.data);
                }
            }
        )
    .catch(error=>{
        let resCode = error.response ? error.response.status : 500;
        let resData;

        if (resCode === 401) {
            resData = "Nicht angemeldet!";
        } else if (resCode === 403 || resCode === 406) {
            resData = error.response.data || "Du bist für diese Aktion nicht berechtigt!";
        } else {
            resData = error.response.data || "Ein Fehler ist aufgetreten.";
        }

        setState({ resCode, resData });
        if (!isEdit && props.onAddTopicFailure) {
            props.onAddTopicFailure();
        }
    })
    }
    const {resCode, resData} = state;

   return (
    <React.Fragment >
        <Formik
            innerRef={formikRef}
            validateOnChange={true}
            initialValues={{
                Topic: props.topicToEdit ? props.topicToEdit.topic : '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (data, { setSubmitting, resetForm }) => {
                setSubmitting(true);
                if (!props.topicToEdit && props.onOptimisticAdd) {
                    props.onOptimisticAdd(data.Topic);
                }
                await saveTopicToDB(data);
                resetForm(true);
                setSubmitting(false);
                }
            }
        >
            {
            ({ values, errors, isSubmitting , touched}) => (
            <div ref={ref} tabIndex={-1}>
                <Container className="Form-Container" sx={{...style, width:0.33}} >
                    <Typography sx={{marginBottom:5}}>
                        {props.topicToEdit ? 'Thema editieren' : `Neues Thema zu ${props.category.name} hinzufügen`}
                    </Typography>
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
                        <Button disabled={isSubmitting || !errors} type='submit'>
                            {props.topicToEdit ? 'Speichern' : 'Hinzufügen'}
                        </Button>
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
};

export default AddTopic;
