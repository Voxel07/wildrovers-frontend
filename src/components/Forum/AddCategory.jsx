/**
 * This is the Modal to add a ne Category
 */
import React, { useRef, useState, useEffect, use, useMemo } from 'react';
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
import Autocomplete from '@mui/material/Autocomplete'; // native MUI Autocomplete, no formik-mui needed
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

const AddCategory = ({ ref, ...props }) => {

    const formikRef = useRef();
    const { auth } = useAuth();
    const [state, setState] = useState({ resCode: null, resData: null });
    const alertsManagerRef = use(AlertsContext);

    const [selectedValuePos, setSelectedValuePos] = useState(() => {
        if (props.categoryToEdit && props.categoryToEdit.position != null) {
            return { label: String(props.categoryToEdit.position), id: props.categoryToEdit.position };
        }
        return null;
    });
    const [selectedValueVis, setSelectedValueVis] = useState(() => {
        if (props.categoryToEdit && props.categoryToEdit.visibility) {
            return posibleRanks.find(r => r.label === props.categoryToEdit.visibility) || null;
        }
        return null;
    });

    const possibleCategories = useMemo(() => {
        return (props.aviableCategories || []).map((element) => ({
            label: element.category,
            id: element.id,
        }));
    }, [props.aviableCategories]);


    //------------Modal-------------------------------------


    //------------Modal Ende-----Yump-----------------------

    const validationSchema = yup.object({
        Name: yup
            .string()
            .required("Du musst dem Ding schon einen Namen geben")
            .min(4, "Name muss min. 3 Zeichen haben")
            .max(20, "Name darf max. 20 Zeichen haben"),
    });

    //----Functions-------------------------



    async function saveCategoryToDB(vals) {
        const isEdit = !!props.categoryToEdit;
        const url = 'http://localhost:8080/forum/category';
        const data = isEdit ? {
            id: props.categoryToEdit.id,
            category: vals.Name
        } : {
            category: vals.Name,
            position: selectedValuePos ? selectedValuePos.id : null,
            visibility: selectedValueVis ? selectedValueVis.label : 'Besucher'
        };
        const method = isEdit ? 'post' : 'put';

        axios({
            method,
            url,
            data,
            headers: { Authorization: `Bearer ${auth.JWT}` }
        }).then(
            response => {
                setState({ resCode: response.status, resData: "" });
                alertsManagerRef.current.showAlert('success', isEdit ? 'Kategorie erfolgreich aktualisiert' : 'Kategorie: ' + vals.Name + ' Erfolgreich erstellt');

                props.callback();
                props.onAddCategory();
            }
        )
            .catch(error => {
                console.log(error.response.data)
                let resCode = error.response.status;
                let resData;

                if (resCode === 401) {
                    resData = "Nicht angemeldet!";
                } else if (resCode === 403 || resCode === 406) {
                    resData = error.response.data || "Du bist für diese Aktion nicht berechtigt!";
                } else {
                    resData = error.response.data || "Ein Fehler ist aufgetreten.";
                }

                setState({ resCode, resData });
            })
    }
    const { resCode, resData } = state;

    return (
        <React.Fragment >
            <Formik
                innerRef={formikRef}
                validateOnChange={true}
                initialValues={{
                    Name: props.categoryToEdit ? props.categoryToEdit.category : '',
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
                    ({ values, errors, isSubmitting, touched }) => (
                        <div ref={ref} tabIndex={-1}>
                            <Container className="Form-Container" sx={{ ...style, width: 0.33 }} >
                                <Typography sx={{ marginBottom: 5 }}>
                                    {props.categoryToEdit ? 'Kategorie editieren' : 'Neue Kategorie hinzufügen'}
                                </Typography>
                                <Form className="Form">
                                    <Field variant="outlined" label="Name der Kategorie" name="Name" type="input" error={!!errors.Name} helperText={errors.Name} as={TextField} />
                                    {possibleCategories.length ?
                                        <Autocomplete
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
                                                        color: red,
                                                        marginTop: 3
                                                    }}
                                                    label="Reihenfolge"
                                                    variant="outlined"
                                                />
                                            )}
                                        /> : null
                                    }

                                    <Autocomplete
                                        name="Visibility"
                                        options={posibleRanks}
                                        getOptionLabel={(option) => option.label}
                                        isOptionEqualToValue={(option, value) => option.label === value.label}
                                        onChange={(event, newValue) => setSelectedValueVis(newValue)}
                                        value={selectedValueVis || null}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                name="Visibility"
                                                error={!!touched['Visibility'] && !!errors['Visibility']}
                                                helperText={!!touched['Visibility'] && !!errors['Visibility'] && String(errors.Visibility)}
                                                sx={{
                                                    color: red,
                                                    marginTop: 3
                                                }}
                                                label="Sichtbarkeit"
                                                variant="outlined"
                                            />
                                        )}
                                    />

                                    <Grid container direction="row" justifyContent="space-between">
                                        <Button variant='outlined' onClick={props.callback} color="error" sx={{ marginTop: 2 }}> Abbrechen </Button>
                                        <Button variant='outlined' disabled={isSubmitting || !errors} type='submit' sx={{ marginTop: 2 }}>
                                            {props.categoryToEdit ? 'Speichern' : 'Hinzufügen'}
                                        </Button>
                                    </Grid>
                                    {/* <pre> {JSON.stringify(values, null, 2)} </pre> */}
                                </Form>
                                <Grid container alignItems="center" justifyContent="start">
                                    <Grid item>
                                        <Stack spacing={2} marginTop={2}>
                                            {
                                                !!resData && resCode > 200 ? <Alert severity="error" style={{ whiteSpace: "pre-wrap" }}>{resData}</Alert> : null
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


const posibleRanks = [
    { label: 'Besucher', id: 1 },
    { label: 'Frischling', id: 2 },
    { label: 'Mitglied', id: 3 },
    { label: 'Vorstand', id: 4 }
];

export default AddCategory;
