/**
 * This is the Modal to add a new Category
 */
import React, { useState, useEffect, use, useMemo } from 'react';
import api from '../../helper/api';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Feedback
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';

// Category name
import TextField from '@mui/material/TextField';

// Button
import Button from '@mui/material/Button';
import { Container, Typography, Box } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { red } from '@mui/material/colors';
import { AlertsContext } from '../../components/utils/AlertsManager';

// Auth
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

    const validationSchema = yup.object({
        Name: yup
            .string()
            .required("Du musst dem Ding schon einen Namen geben")
            .min(4, "Name muss min. 3 Zeichen haben")
            .max(20, "Name darf max. 20 Zeichen haben"),
    });

    const { register, handleSubmit: handleFormSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            Name: props.categoryToEdit ? props.categoryToEdit.category : '',
        }
    });

    // Reset name if categoryToEdit changes
    useEffect(() => {
        reset({
            Name: props.categoryToEdit ? props.categoryToEdit.category : '',
        });
        if (props.categoryToEdit && props.categoryToEdit.position != null) {
            setSelectedValuePos({ label: String(props.categoryToEdit.position), id: props.categoryToEdit.position });
        } else {
            setSelectedValuePos(null);
        }
        if (props.categoryToEdit && props.categoryToEdit.visibility) {
            setSelectedValueVis(posibleRanks.find(r => r.label === props.categoryToEdit.visibility) || null);
        } else {
            setSelectedValueVis(null);
        }
    }, [props.categoryToEdit, reset]);

    async function saveCategoryToDB(vals) {
        const isEdit = !!props.categoryToEdit;
        const url = '/forum/category';
        const data = isEdit ? {
            id: props.categoryToEdit.id,
            category: vals.Name
        } : {
            category: vals.Name,
            position: selectedValuePos ? selectedValuePos.id : null,
            visibility: selectedValueVis ? selectedValueVis.label : 'Besucher'
        };
        const method = isEdit ? 'post' : 'put';

        try {
            const response = await api({
                method,
                url,
                data
            });

            setState({ resCode: response.status, resData: "" });
            alertsManagerRef.current.showAlert('success', isEdit ? 'Kategorie erfolgreich aktualisiert' : 'Kategorie: ' + vals.Name + ' Erfolgreich erstellt');

            props.callback();
            props.onAddCategory();
            reset({ Name: '' });
            setSelectedValuePos(null);
            setSelectedValueVis(null);
        } catch (error) {
            console.log(error.response?.data);
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
        }
    }

    const onSubmit = async (data) => {
        await saveCategoryToDB(data);
    };

    const { resCode, resData } = state;

    return (
        <div ref={ref} tabIndex={-1}>
            <Container className="Form-Container" sx={{ ...style, width: 0.33 }}>
                <Typography sx={{ marginBottom: 5 }}>
                    {props.categoryToEdit ? 'Kategorie editieren' : 'Neue Kategorie hinzufügen'}
                </Typography>
                <form onSubmit={handleFormSubmit(onSubmit)} className="Form">
                    <TextField
                        variant="outlined"
                        label="Name der Kategorie"
                        error={!!errors.Name}
                        helperText={errors.Name?.message}
                        {...register("Name")}
                        sx={{ mb: 3, width: '100%' }}
                    />
                    
                    {possibleCategories.length ? (
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
                                    sx={{
                                        color: red,
                                        marginTop: 3,
                                        mb: 3
                                    }}
                                    label="Reihenfolge"
                                    variant="outlined"
                                />
                            )}
                        />
                    ) : null}

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
                                sx={{
                                    color: red,
                                    marginTop: 3,
                                    mb: 3
                                }}
                                label="Sichtbarkeit"
                                variant="outlined"
                            />
                        )}
                    />

                    <Grid container direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Button variant="outlined" onClick={props.callback} color="error" sx={{ marginTop: 2 }}>
                            Abbrechen
                        </Button>
                        <Button variant="outlined" disabled={isSubmitting} type="submit" sx={{ marginTop: 2 }}>
                            {props.categoryToEdit ? 'Speichern' : 'Hinzufügen'}
                        </Button>
                    </Grid>
                </form>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mt: 2 }}>
                    <Stack spacing={2}>
                        {!!resData && resCode > 200 ? (
                            <Alert severity="error" style={{ whiteSpace: "pre-wrap" }}>{resData}</Alert>
                        ) : null}
                    </Stack>
                </Box>
            </Container>
        </div>
    );
};

const posibleRanks = [
    { label: 'Besucher', id: 1 },
    { label: 'Frischling', id: 2 },
    { label: 'Mitglied', id: 3 },
    { label: 'Vorstand', id: 4 }
];

export default AddCategory;
