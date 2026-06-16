import React, { useReducer, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api, { extractErrorMessage } from '../../helper/api';

// Mui
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import RefreshIcon from '@mui/icons-material/Refresh';

// Eigene
import Category from '../../components/Forum/Category';
import ForumBreadcrumbs from '../../components/Forum/ForumBreadcrumbs';

const initialState = { category: [], loading: true, error: null, errorStatus: null };

function reducer(state, action) {
    switch (action.type) {
        case 'FETCH_START':  return { ...state, loading: true, error: null, errorStatus: null };
        case 'FETCH_SUCCESS': return { category: action.payload, loading: false, error: null, errorStatus: null };
        case 'FETCH_ERROR':  return { ...state, loading: false, error: action.payload, errorStatus: action.status };
        case 'UPDATE_CATEGORY':
            return {
                ...state,
                category: state.category.map(c => c.id === action.payload.id ? action.payload : c)
            };
        default: return state;
    }
}

export default function Forum_Categories() {
    const { id } = useParams();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { category, loading, error, errorStatus } = state;

    const fetchCategory = () => {
        const controller = new AbortController();
        dispatch({ type: 'FETCH_START' });

        api.get('/forum/category', {
            params: { categoryId: id },
            signal: controller.signal,
        })
        .then(response => {
            dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
        })
        .catch(err => {
            if (err.code === 'ERR_CANCELED') return;
            console.error(err);
            dispatch({
                type: 'FETCH_ERROR',
                payload: extractErrorMessage(err),
                status: err.response?.status || 0,
            });
        });

        return () => controller.abort();
    };

    useEffect(() => {
        const cleanup = fetchCategory();
        return cleanup;
    }, [id]);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
            </Container>
        );
    }

    if (error) {
        const isRateLimit = errorStatus === 429;
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <Alert
                    severity={isRateLimit ? 'warning' : 'error'}
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={fetchCategory}>
                            Erneut versuchen
                        </Button>
                    }
                >
                    {isRateLimit
                        ? `Zu viele Anfragen — bitte warte einen Moment.`
                        : `Fehler beim Laden der Kategorie: ${error}`}
                </Alert>
            </Container>
        );
    }

    const handleCategoryUpdate = (updatedCategory) => {
        dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCategory });
    };

    return (
        <Container maxWidth="xl" sx={{ px: { xs: 1, md: 3 }, py: 2 }}>
            {category.length > 0 && (
                <ForumBreadcrumbs categoryName={category[0].category} />
            )}
            {category.length
                ? category.map((cat, index) => (
                    <Category
                        key={cat.id}
                        currentIndex={index}
                        vals={cat}
                        editCallback={() => {}}
                        deleteCallback={() => {}}
                        onCategoryUpdate={handleCategoryUpdate}
                    />
                ))
                : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">Kategorie existiert nicht oder Sie haben keine Berechtigung, sie anzusehen.</Typography>
                    </Box>
                )
            }
        </Container>
    );
}
