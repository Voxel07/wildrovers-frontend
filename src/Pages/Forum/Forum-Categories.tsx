import { useReducer, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api, { extractErrorMessage, getErrorStatus } from '../../helper/api';
import useAuth from '../../context/useAuth';

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
import type { ForumCategory } from '../../types';

interface State {
    /** The requested category (the endpoint answers with a list). */
    category: ForumCategory[];
    loading: boolean;
    error: string | null;
    errorStatus: number | null;
}

type Action =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: ForumCategory[] }
    | { type: 'FETCH_ERROR'; payload: string; status: number }
    | { type: 'UPDATE_CATEGORY'; payload: ForumCategory };

const initialState: State = { category: [], loading: true, error: null, errorStatus: null };

function reducer(state: State, action: Action): State {
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
    const { auth, ready } = useAuth();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { category, loading, error, errorStatus } = state;

    const fetchCategory = () => {
        const controller = new AbortController();
        dispatch({ type: 'FETCH_START' });

        api.get<ForumCategory[]>('/forum/category', {
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
                status: getErrorStatus(err) || 0,
            });
        });

        return () => controller.abort();
    };

    // Loaded once the session is known, and again when the viewer changes: what is visible
    // depends on the role. (While loading, the spinner replaces the category, so it remounts
    // and reloads its topics.)
    useEffect(() => {
        if (!ready) return;
        const cleanup = fetchCategory();
        return cleanup;
    }, [ready, id, auth.userId, auth.roles]);

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

    const handleCategoryUpdate = (updatedCategory: ForumCategory) => {
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
