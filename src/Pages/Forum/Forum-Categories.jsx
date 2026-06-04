import React, { useReducer, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../helper/api';

// Mui
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

// Eigene
import Category from '../../components/Forum/Category';

const initialState = { category: [], loading: true };

function reducer(state, action) {
    switch (action.type) {
        case 'FETCH_START':  return { ...state, loading: true };
        case 'FETCH_SUCCESS': return { category: action.payload, loading: false };
        case 'FETCH_ERROR':  return { ...state, loading: false };
        default: return state;
    }
}

export default function Forum_Categories() {
    const { id } = useParams();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { category, loading } = state;

    useEffect(() => {
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
            dispatch({ type: 'FETCH_ERROR' });
        });

        return () => controller.abort();
    }, [id]);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ px: { xs: 1, md: 3 }, py: 2 }}>
            {category.length
                ? category.map((cat, index) => (
                    <Category
                        key={cat.id}
                        currentIndex={index}
                        vals={cat}
                        editCallback={() => {}}
                        deleteCallback={() => {}}
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
