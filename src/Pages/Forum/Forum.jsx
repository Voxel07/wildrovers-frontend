import React, { useState, useEffect, use } from 'react';
import api, { extractErrorMessage } from '../../helper/api';
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
import Alert from '@mui/material/Alert';
import RefreshIcon from '@mui/icons-material/Refresh';

// Eigene
import Category from '../../components/Forum/Category';
import AddCategory from '../../components/Forum/AddCategory';
import Skeleton_Category from '../../components/Forum/Skeleton_Category';
import { AlertsContext } from '../../components/utils/AlertsManager';

const Forum = () => {
    const { auth } = useAuth();
    const alertsManagerRef = use(AlertsContext);
    const [categories, setCategories] = useState([]);
    const [loading, setloading] = useState(false);
    const [error, setError] = useState(null);
    const [errorStatus, setErrorStatus] = useState(null);
    const [open, setOpen] = useState(false);
    const handleOpen = () => { setOpen(true); };
    const handleClose = () => { setOpen(false); };
    const [updateData, setUpdateData] = useState(false);
    const [sort, setSort] = useState({ field: "position", direction: "asc" });

    // Category edit state
    const [editingCategory, setEditingCategory] = useState(null);

    const handleUpdate = () => {
      setUpdateData(prev => !prev);
    }

    const fetchCategories = () => {
        setloading(true);
        setError(null);
        setErrorStatus(null);
        api.get("/forum/category")
        .then(response => {
            setCategories(response.data);
            setloading(false);
        })
        .catch(err => {
            console.error(err);
            setError(extractErrorMessage(err));
            setErrorStatus(err.response?.status || 0);
            setloading(false);
        });
    };

    // Get all categories
    useEffect(() => {
        fetchCategories();
    }, [updateData]);

    const handleDelete = (deletedCategory) => {
        setCategories((prevCategories) => 
            prevCategories.filter(category => category.id !== deletedCategory.id)
        );
    }

    const handleCategoryUpdate = (updatedCategory) => {
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    };

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
          editCallback={(cat) => setEditingCategory(cat)}
          deleteCallback={handleDelete}
          onCategoryUpdate={handleCategoryUpdate}
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
                {auth?.JWT && (auth.roles !== 'Besucher' || auth.canCreateCategory) && (
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
                <Grid container sx={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Grid size={{ xs: 3 }}>
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
                    <Grid size={{ xs: 9 }}>
                        <Grid container spacing={4} sx={{ flexDirection: 'row', pl: 2 }}>
                            <Grid size={{ xs: 3 }}>
                                <TableSortLabel
                                  active={sort.field === "creator"}
                                  direction={sort.direction}
                                  onClick={() => handleSort("creator")}
                                >
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Ersteller</Typography>
                                </TableSortLabel>
                            </Grid>
                            <Grid size={{ xs: 3 }}>
                                <TableSortLabel
                                  active={sort.field === "creationDate"}
                                  direction={sort.direction}
                                  onClick={() => handleSort("creationDate")}
                                >
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Erstellungsdatum</Typography>
                                </TableSortLabel>
                            </Grid>
                            <Grid size={{ xs: 3 }}>
                                <TableSortLabel
                                  active={sort.field === "topicCount"}
                                  direction={sort.direction}
                                  onClick={() => handleSort("topicCount")}
                                >
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Themen</Typography>
                                </TableSortLabel>
                            </Grid>
                            <Grid size={{ xs: 3 }}>
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

            <Stack spacing={2} sx={{ mt: { xs: 0, md: 2 } }}>
                {error && (
                    <Alert
                        severity={errorStatus === 429 ? 'warning' : 'error'}
                        action={
                            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={fetchCategories}>
                                Erneut versuchen
                            </Button>
                        }
                        sx={{ mb: 2 }}
                    >
                        {errorStatus === 429
                            ? 'Zu viele Anfragen — bitte warte einen Moment.'
                            : `Fehler beim Laden der Kategorien: ${error}`}
                    </Alert>
                )}
                {!error && categories.length ? (
                    categoryComponents
                ) : !error && loading ? (
                    <Skeleton_Category />
                ) : !error ? (
                    <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 2 }}>
                        <Typography color="text.secondary">Keine Kategorien vorhanden. Erstelle die erste!</Typography>
                    </Box>
                ) : null}
            </Stack>

            <Modal
                disableScrollLock
                open={open || !!editingCategory}
                onClose={() => { handleClose(); setEditingCategory(null); }}
            >
                <Box>
                    <AddCategory 
                        categoryToEdit={editingCategory}
                        onAddCategory={handleUpdate} 
                        callback={() => { handleClose(); setEditingCategory(null); }} 
                        aviableCategories={categories} 
                    />
                </Box>
            </Modal>
        </Container>
    );
}

export default Forum;
