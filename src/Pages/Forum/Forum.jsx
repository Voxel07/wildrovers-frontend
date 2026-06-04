import React, { useState, useEffect, use, useReducer } from 'react';
import api from '../../helper/api';
import useAuth from '../../context/useAuth';

// Mui
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TableSortLabel from '@mui/material/TableSortLabel';
import Box from '@mui/material/Box';

// Eigene
import Category from '../../components/Forum/Category';
import AddCategory from '../../components/Forum/AddCategory';
import Skeleton_Category from '../../components/Forum/Skeleton_Category';
import { AlertsContext } from '../../components/utils/AlertsManager';

const initialForumState = {
  categories: [],
  loading: false,
  updateData: false,
};

function forumReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, categories: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false };
    case 'TRIGGER_UPDATE':
      return { ...state, updateData: !state.updateData };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload.id)
      };
    default:
      return state;
  }
}

const Forum = () => {
    const { auth } = useAuth();
    const alertsManagerRef = use(AlertsContext);
    const [state, dispatch] = useReducer(forumReducer, initialForumState);
    const { categories, loading, updateData } = state;

    const [open, setOpen] = useState(false);
    const handleOpen = () => { setOpen(true); };
    const handleClose = () => { setOpen(false); };
    const [sort, setSort] = useState({ field: "position", direction: "asc" });

    const handleUpdate = () => {
      dispatch({ type: 'TRIGGER_UPDATE' });
    }

    // Get all categories
    useEffect(() => {
        dispatch({ type: 'FETCH_START' });
        api.get("/forum/category")
        .then(response => {
            dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
        })
        .catch(err => {
            console.error(err);
            dispatch({ type: 'FETCH_FAILURE' });
        });
    }, [updateData]);

    const handleDelete = (deletedCategory) => {
        dispatch({ type: 'DELETE_CATEGORY', payload: deletedCategory });
    }

    const handleEdit = (editedCategory) => {
        // Reload categories on edit success
        dispatch({ type: 'TRIGGER_UPDATE' });
    }

    const sortedCategories = [...categories].sort((a, b) => {
        const fieldA = a[sort.field] ?? 0;
        const fieldB = b[sort.field] ?? 0;
        const comparison = fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
        return sort.direction === "asc" ? comparison : -comparison;
    });

    const categoryComponents = sortedCategories.map((category, index) => (
        <Category
          key={category.id}
          currentIndex={index}
          vals={category}
          editCallback={handleEdit}
          deleteCallback={handleDelete}
        />
    ));

    const handleSort = (field) => {
        const newDirection = sort.direction === "asc" ? "desc" : "asc";
        setSort({ field, direction: newDirection });
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 1, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Forum
                </Typography>
                {auth?.JWT && (
                    <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<AddCircleOutlineOutlinedIcon />} 
                        onClick={handleOpen}
                    >
                        Kategorie hinzufügen
                    </Button>
                )}
            </Box>

            {/* Table Header */}
            <Box sx={{ 
                px: 3, 
                py: 2, 
                backgroundColor: 'background.paper', 
                borderRadius: '8px 8px 0 0',
                borderBottom: '2px solid rgba(255, 255, 255, 0.08)',
                display: { xs: 'none', md: 'block' }
            }}>
                <Grid container direction="row" alignItems="center">
                    <Grid item xs={3}>
                        <Stack direction="row" spacing={2}>
                            <TableSortLabel
                                active={sort.field === "position"}
                                direction={sort.direction}
                                onClick={() => handleSort("position")}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Pos</Typography>
                            </TableSortLabel>
                            <TableSortLabel
                                active={sort.field === "category"}
                                direction={sort.direction}
                                onClick={() => handleSort("category")}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Name</Typography>
                            </TableSortLabel>
                        </Stack>
                    </Grid>
                    <Grid item xs={9}>
                        <Grid container direction="row" spacing={4} sx={{ pl: 2 }}>
                            <Grid item xs={3}>
                                <TableSortLabel
                                    active={sort.field === "creator"}
                                    direction={sort.direction}
                                    onClick={() => handleSort("creator")}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Ersteller</Typography>
                                </TableSortLabel>
                            </Grid>
                            <Grid item xs={3}>
                                <TableSortLabel
                                    active={sort.field === "creationDate"}
                                    direction={sort.direction}
                                    onClick={() => handleSort("creationDate")}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Erstellungsdatum</Typography>
                                </TableSortLabel>
                            </Grid>
                            <Grid item xs={3}>
                                <TableSortLabel
                                    active={sort.field === "topicCount"}
                                    direction={sort.direction}
                                    onClick={() => handleSort("topicCount")}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Themen</Typography>
                                </TableSortLabel>
                            </Grid>
                            <Grid item xs={3}>
                                <TableSortLabel
                                    active={sort.field === "visibility"}
                                    direction={sort.direction}
                                    onClick={() => handleSort("visibility")}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Sichtbarkeit</Typography>
                                </TableSortLabel>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>

            <Stack spacing={2} sx={{ mt: { xs: 0, md: 1 } }}>
                {categories.length ? (
                    categoryComponents
                ) : loading ? (
                    <Skeleton_Category />
                ) : (
                    <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 2 }}>
                        <Typography color="text.secondary">Keine Kategorien vorhanden. Erstelle die erste!</Typography>
                    </Box>
                )}
            </Stack>

            <Modal
                disableScrollLock
                open={open}
                onClose={handleClose}
            >
                <Box>
                    <AddCategory onAddCategory={handleUpdate} callback={handleClose} aviableCategories={categories} />
                </Box>
            </Modal>
        </Container>
    );
}

export default Forum;
