/**
 * This is the Modal to add a new Topic
 */
import React, { useState, useEffect, use } from 'react';
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
import { AlertsContext } from '../../components/utils/AlertsManager';

// Auth
import useAuth from '../../context/useAuth';

const style = {
    position: 'absolute',
    top: '10%',
    left: '50%',
    transform: 'translate(-50%, 0)',
    width: { xs: '90%', sm: 450, md: 500 },
    maxWidth: '95%',
    maxHeight: '85vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    boxShadow: 24,
    p: { xs: 2.5, sm: 4 },
    boxSizing: 'border-box',
};

const AddTopic = ({ ref, ...props }) => {
    const { auth } = useAuth();
    const [state, setState] = useState({ resCode: null, resData: null });
    const alertsManagerRef = use(AlertsContext);

    const validationSchema = yup.object({
        Topic: yup.string().required("Name des Themas ist erforderlich").min(3, "Name muss min. 3 Zeichen haben").max(35, "Name darf max. 35 Zeichen haben"),
    });

    const { register, handleSubmit: handleFormSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            Topic: props.topicToEdit ? props.topicToEdit.topic : '',
        }
    });
    const topicName = watch("Topic") || "";

    // Reset form values if topicToEdit changes
    useEffect(() => {
        reset({
            Topic: props.topicToEdit ? props.topicToEdit.topic : '',
        });
    }, [props.topicToEdit, reset]);

    async function saveTopicToDB(vals) {
        const isEdit = !!props.topicToEdit;
        const url = '/forum/topic';
        const data = isEdit ? {
            id: props.topicToEdit.id,
            topic: vals.Topic
        } : {
            topic: vals.Topic
        };
        const method = isEdit ? 'post' : 'put';
        const params = isEdit ? {} : { category: props.category.id };

        try {
            const response = await api({
                method,
                url,
                data,
                params
            });

            setState({ resCode: response.status, resData: "" });
            alertsManagerRef.current.showAlert('success', isEdit ? 'Thema erfolgreich aktualisiert' : 'Thema: ' + vals.Topic + ' Erfolgreich erstellt');

            props.callback();
            if (isEdit) {
                props.onAddTopic();
            } else if (props.onAddTopicSuccess) {
                props.onAddTopicSuccess(response.data);
            }
            reset({ Topic: '' });
        } catch (error) {
            let resCode = error.response ? error.response.status : 500;
            let resData;

            if (resCode === 401) {
                resData = "Nicht angemeldet!";
            } else if (resCode === 403 || resCode === 406) {
                resData = error.response.data || "Du bist für diese Aktion nicht berechtigt!";
            } else if (resCode === 429) {
                resData = "Zu viele Anfragen — bitte warte einen Moment.";
                alertsManagerRef.current.showAlert('warning', resData);
            } else {
                resData = error.response?.data?.message || error.response?.data || "Ein Fehler ist aufgetreten.";
            }

            setState({ resCode, resData });
            if (!isEdit && props.onAddTopicFailure) {
                props.onAddTopicFailure();
            }
        }
    }

    const onSubmit = async (data) => {
        if (!props.topicToEdit && props.onOptimisticAdd) {
            props.onOptimisticAdd(data.Topic);
        }
        await saveTopicToDB(data);
    };

    const { resCode, resData } = state;

    return (
        <div ref={ref} tabIndex={-1}>
            <Container className="Form-Container" sx={style}>
                <Typography sx={{ marginBottom: 5 }}>
                    {props.topicToEdit ? 'Thema editieren' : `Neues Thema zu ${props.category.name} hinzufügen`}
                </Typography>
                <form onSubmit={handleFormSubmit(onSubmit)} className="Form">
                    <TextField
                        variant="outlined"
                        label="Name des Themas"
                        error={!!errors.Topic}
                        helperText={errors.Topic ? `${errors.Topic.message} (${topicName.length}/35)` : `${topicName.length}/35`}
                        inputProps={{ maxLength: 35 }}
                        {...register("Topic")}
                        sx={{ mb: 3, width: '100%' }}
                    />
                    <Grid container sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Button onClick={props.callback} color="error"> Abbrechen </Button>
                        <Button disabled={isSubmitting} type="submit">
                            {props.topicToEdit ? 'Speichern' : 'Hinzufügen'}
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

export default AddTopic;
