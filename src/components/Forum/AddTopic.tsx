/**
 * This is the Modal to add a new Topic
 */
import { useState, useEffect, use, type Ref } from 'react';
import api, { extractErrorMessage, getErrorStatus } from '../../helper/api';
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
import type { ForumTopic } from '../../types';

interface AddTopicProps {
    ref?: Ref<HTMLDivElement>;
    /** Topic to edit; without it a new topic is added to `category`. */
    topicToEdit?: ForumTopic | null;
    category: { id: number; name: string };
    topics?: ForumTopic[];
    /** Closes the dialog. */
    callback: () => void;
    /** Called after an edit was saved. */
    onAddTopic: () => void;
    /** Called with the topic name before the request, to show it right away. */
    onOptimisticAdd?: (topicName: string) => void;
    onAddTopicSuccess?: (topic: ForumTopic) => void;
    onAddTopicFailure?: () => void;
}

interface TopicFormValues {
    Topic: string;
}

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

const AddTopic = ({ ref, ...props }: AddTopicProps) => {
    const [state, setState] = useState<{ resCode: number | null; resData: string | null }>({ resCode: null, resData: null });
    const alertsManagerRef = use(AlertsContext);

    const validationSchema = yup.object({
        Topic: yup.string().required("Name des Themas ist erforderlich").min(3, "Name muss min. 3 Zeichen haben").max(35, "Name darf max. 35 Zeichen haben"),
    });

    const { register, handleSubmit: handleFormSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<TopicFormValues>({
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

    async function saveTopicToDB(vals: TopicFormValues) {
        const isEdit = !!props.topicToEdit;
        const url = '/forum/topic';
        const data = isEdit ? {
            id: props.topicToEdit!.id,
            topic: vals.Topic
        } : {
            topic: vals.Topic
        };
        const method = isEdit ? 'post' : 'put';
        const params = isEdit ? {} : { category: props.category.id };

        try {
            const response = await api<ForumTopic>({
                method,
                url,
                data,
                params
            });

            setState({ resCode: response.status, resData: "" });
            alertsManagerRef.current?.showAlert('success', isEdit ? 'Thema erfolgreich aktualisiert' : 'Thema: ' + vals.Topic + ' Erfolgreich erstellt');

            props.callback();
            if (isEdit) {
                props.onAddTopic();
            } else if (props.onAddTopicSuccess) {
                props.onAddTopicSuccess(response.data);
            }
            reset({ Topic: '' });
        } catch (error) {
            const resCode = getErrorStatus(error) ?? 500;
            let resData: string;

            if (resCode === 401) {
                resData = "Nicht angemeldet!";
            } else if (resCode === 403 || resCode === 406) {
                resData = extractErrorMessage(error) || "Du bist für diese Aktion nicht berechtigt!";
            } else if (resCode === 429) {
                resData = "Zu viele Anfragen — bitte warte einen Moment.";
                alertsManagerRef.current?.showAlert('warning', resData);
            } else {
                resData = extractErrorMessage(error) || "Ein Fehler ist aufgetreten.";
            }

            setState({ resCode, resData });
            if (!isEdit && props.onAddTopicFailure) {
                props.onAddTopicFailure();
            }
        }
    }

    const onSubmit = async (data: TopicFormValues) => {
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
                        slotProps={{ htmlInput: { maxLength: 35 } }}
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
                        {!!resData && resCode !== null && resCode > 200 ? (
                            <Alert severity="error" style={{ whiteSpace: "pre-wrap" }}>{resData}</Alert>
                        ) : null}
                    </Stack>
                </Box>
            </Container>
        </div>
    );
};

export default AddTopic;
