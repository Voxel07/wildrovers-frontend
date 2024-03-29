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
// import Autocomplete from '@mui/material/Autocomplete';
import { Autocomplete } from 'formik-mui'; //https://stackworx.github.io/formik-mui/
import { red } from '@mui/material/colors';
import { AlertsContext } from '../../components/utils/AlertsManager';

//Auth
import useAuth from '../../context/useAuth';
const AddCategory = React.forwardRef((props, ref) => {

    const formikRef = useRef();
    const{ auth } = useAuth();
    const [state, setState] = useState({ resCode: null, resData: null });
    const alertsManagerRef = useContext(AlertsContext);

    const [possibleCategories, setPossibleCategories] = useState('');
    const [selectedValuePos, setSelectedValuePos] = useState(null);
    const [selectedValueVis, setSelectedValueVis] = useState(null);


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
        Name: yup
            .string()
            .required("Du musst dem Ding schon einen Namen geben")
            .min(4, "Name muss min. 3 Zeichen haben")
            .max(20,"Name darf max. 20 Zeichen haben"),
    });

//----Functions-------------------------


useEffect(() => {
  const categories = props.aviableCategories.map((element) => ({
    label: element.category,
    id: element.id,
  }));
  setPossibleCategories(categories);
}, [props.aviableCategories]);


    async function saveCategoryToDB(vals)
    {
        axios.put('http://localhost:8080/forum/category',
        {
            category: vals.Name,
            position: selectedValuePos.id,
            visibility: selectedValueVis.label
        },
        {
            headers:{ Authorization: `Bearer ${auth.JWT}`}
        }).then(
            response =>{
                setState({resCode: response.status, resData: ""});
                alertsManagerRef.current.showAlert('success', 'Kategorie: '+ vals.Name +' Erfolgreich erstellt');

                props.callback();
                props.onAddCategory();
            }
        )
        .catch(error=>{
            console.log(error.response.data)
            let resCode = error.response.status;
            let resData;

            if (resCode === 401) {
                resData = "Nicht angemeldet!";
            } else if (resCode === 403) {
                console.log(auth)
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
                Name: '',
                Position: '',
                Visibility: ''
            }}
            validationSchema={validationSchema}
            onSubmit={async (data, { setSubmitting }) => {
                    setSubmitting(true);
                    await saveCategoryToDB(data, () => formikRef.current?.resetForm(true));
                    setSubmitting(false);
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
                    {possibleCategories.length ?
                    <Field
                        component={Autocomplete}
                        name="Position"
                        options={possibleCategories}
                        getOptionLabel={(option) => (option ? option.label : "")}
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        onChange={(event, newValue) => setSelectedValuePos(newValue)}
                        value={selectedValuePos || null}
                        renderInput={(params) => (
                        <TextField
                            {...params}
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
                          />: null
                        }

                    <Field
                        name="Visibility"
                        component={Autocomplete}
                        options={posibleRanks}
                        getOptionLabel={posibleRanks.label}
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        onChange={(event, newValue) => setSelectedValueVis(newValue)}
                        value={selectedValueVis || null}
                        renderInput={(params) => (
                        <TextField
                            {...params}
                            name="Visibility"
                            error={!!touched['Visibility'] && !!errors['Visibility']}
                            helperText={!!touched['Visibility'] && errors['Visibility']&& String(errors.Visibility)}
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
                    <Button variant='outlined' onClick={props.callback} color="error" sx={{marginTop: 2}}> Abbrechen </Button>
                    <Button variant='outlined' disabled={isSubmitting || !errors} type='submit' sx={{marginTop: 2}}> Hinzufügen </Button>
                    </Grid>
                        {/* <pre> {JSON.stringify(values, null, 2)} </pre> */}
                    </Form>
                <Grid container alignItems="center" justifyContent="start">
                <Grid item>
                        <Stack spacing={2} marginTop={2}>
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


const posibleRanks = [
    { label: 'Besucher', id: 1 },
    { label: 'Frischling', id: 2 },
    { label: 'Mitglied', id: 3 },
    { label: 'Vorstand', id: 4 }
];

export default AddCategory;