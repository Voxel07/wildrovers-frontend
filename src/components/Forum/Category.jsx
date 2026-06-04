import React, { useMemo, useState, useEffect, use } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../helper/api';

// MUI
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import TopicIcon from '@mui/icons-material/Topic';
import Button from '@mui/material/Button';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GroupIcon from '@mui/icons-material/Group';
import Modal from '@mui/material/Modal';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import TableSortLabel from '@mui/material/TableSortLabel';

// Eigene
import Topic from "./Topic";
import AddTopic from './AddTopic';
import { AlertsContext } from '../../components/utils/AlertsManager';
import { convertTimestamp, formatNumber, hasRequiredRole } from '../../helper/converter';
import useAuth from '../../context/useAuth';

export default function Category(props) {
  const { auth } = useAuth();
  const alertsManagerRef = use(AlertsContext);

  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const handleOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };
  const [category, setCategory] = useState({ category: null, id: null, creator: null, creationDate: null, topicCount: null, visibility: null, position: null });
  const navigate = useNavigate();
  const location = useLocation();
  const [expandAccordion, setexpandAccordion] = useState(false);
  const [updateData, setUpdateData] = useState(false);
  const [sort, setSort] = useState({ field: 'topic', direction: 'asc' });

  const handleUpdate = () => {
    setUpdateData(prev => !prev);
    // Optimistically increment the topic count so it's immediately visible
    setCategory(prev => ({ ...prev, topicCount: (prev.topicCount ?? 0) + 1 }));
  };

  useEffect(() => {
    if (props.currentIndex === 0) {
      setexpandAccordion(true);
    } else {
      setexpandAccordion(false);
    }
  }, [props.currentIndex]);

  const handleExpandClick = (e) => {
    e.stopPropagation();
    setexpandAccordion(!expandAccordion);
  };

  useEffect(() => {
    if (props.vals) {
      api.get("/forum/topic", {
        params: { category: props.vals.id }
      })
      .then(response => {
        setTopics(response.data);
      })
      .catch(error => {
        console.error("Failed to fetch topics", error);
      });
      setCategory(props.vals);
    }
  }, [props.vals, updateData]);

  function redirectToCategory(e) {
    e.stopPropagation();
    if (!location.pathname.toLowerCase().includes("forum/category")) {
      navigate("/Forum/Category/" + props.vals.id);
    }
  }

  function handleDelete(e) {
    e.stopPropagation();
    api.delete('/forum/category', {
      data: { id: category.id }
    })
    .then(response => {
      alertsManagerRef.current.showAlert('success', 'Kategorie: ' + category.category + ' erfolgreich gelöscht');
      props.deleteCallback(category);
    })
    .catch(error => {
      console.error(error);
      const resCode = error.response?.status || 500;
      const resData = error.response?.data || "Serverfehler beim Löschen";
      alertsManagerRef.current.showAlert('error', `${resCode}: ${resData}`);
    });
  }

  function handleEdit(e) {
    e.stopPropagation();
    props.editCallback(category);
  }

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedTopics = [...topics].sort((a, b) => {
    const valA = a[sort.field] ?? 0;
    const valB = b[sort.field] ?? 0;
    const cmp = typeof valA === 'string'
      ? valA.localeCompare(valB)
      : valA < valB ? -1 : valA > valB ? 1 : 0;
    return sort.direction === 'asc' ? cmp : -cmp;
  });

  const isCreatorOrAdmin = auth.user === category.creator || auth.roles === "Admin";

  return (
    <Accordion expanded={expandAccordion} sx={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <AccordionSummary
        expandIcon={
          <span onClick={handleExpandClick} style={{ display: 'flex', alignItems: 'center', padding: 4, cursor: 'pointer' }}>
            <ExpandMoreIcon />
          </span>
        }
        aria-controls={`panel-${category.id}-content`}
        id={`panel-${category.id}-header`}
        sx={{
          py: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)'
          }
        }}
      >
        <Grid container direction="row" alignItems="center" spacing={2}>
          <Grid item xs={12} md={3} onClick={redirectToCategory} sx={{ cursor: 'pointer' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'inline-block' }}>
              {category.category}
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
              <Tooltip title="Ersteller" placement="top">
                <Chip icon={<PersonIcon />} label={category.creator || 'Unbekannt'} variant="outlined" size="small" />
              </Tooltip>
              <Tooltip title="Erstellungsdatum" placement="top">
                <Chip icon={<EventNoteIcon />} label={convertTimestamp(category.creationDate)} variant="outlined" size="small" />
              </Tooltip>
              <Tooltip title="Themen" placement="top">
                <Chip icon={<TopicIcon />} label={formatNumber(category.topicCount)} variant="outlined" size="small" />
              </Tooltip>
              <Tooltip title="Sichtbarkeit" placement="top">
                <Chip icon={<GroupIcon />} label={category.visibility} variant="outlined" size="small" color="secondary" />
              </Tooltip>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {isCreatorOrAdmin && (
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Kategorie editieren">
                  <IconButton component="span" size="small" onClick={handleEdit} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Kategorie löschen">
                  <IconButton component="span" size="small" onClick={handleDelete} color="error">
                    <DeleteForeverIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Grid>
        </Grid>
      </AccordionSummary>
      <Divider />
      <AccordionDetails sx={{ bgcolor: 'rgba(0, 0, 0, 0.1)', p: 0 }}>
        {/* Sort toolbar */}
        {topics.length > 0 && (
          <Box sx={{
            px: 3,
            py: 1,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 3,
          }}>
            <Typography variant="caption" color="text.secondary">Sortieren:</Typography>
            <TableSortLabel
              active={sort.field === 'topic'}
              direction={sort.field === 'topic' ? sort.direction : 'asc'}
              onClick={() => handleSort('topic')}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Name</Typography>
            </TableSortLabel>
            <TableSortLabel
              active={sort.field === 'postCount'}
              direction={sort.field === 'postCount' ? sort.direction : 'asc'}
              onClick={() => handleSort('postCount')}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Beiträge</Typography>
            </TableSortLabel>
            <TableSortLabel
              active={sort.field === 'creationDate'}
              direction={sort.field === 'creationDate' ? sort.direction : 'asc'}
              onClick={() => handleSort('creationDate')}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Datum</Typography>
            </TableSortLabel>
            <TableSortLabel
              active={sort.field === 'views'}
              direction={sort.field === 'views' ? sort.direction : 'asc'}
              onClick={() => handleSort('views')}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Aufrufe</Typography>
            </TableSortLabel>
          </Box>
        )}
        {sortedTopics.length ? (
          sortedTopics.map(topic => <Topic key={topic.id} topic={topic} />)
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">In dieser Kategorie gibt es noch keine Themen</Typography>
          </Box>
        )}
      </AccordionDetails>
      <Divider />
      {hasRequiredRole(auth.roles, category.visibility) && (
        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-start' }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<AddCircleOutlineOutlinedIcon />} 
            onClick={handleOpen}
          >
            Thema hinzufügen
          </Button>
        </Box>
      )}

      <Modal
        disableScrollLock
        open={open}
        onClose={handleClose}
      >
        <Box>
          <AddTopic onAddTopic={handleUpdate} callback={handleClose} topics={topics} category={{ id: category.id, name: category.category }} />
        </Box>
      </Modal>
    </Accordion>
  );
}
