import React, { useMemo, useState, useEffect, use, useReducer } from 'react';
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
import ForumChips from './ForumChips';

function categoryReducer(state, action) {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return {
        ...state,
        topics: action.payload.topics,
        category: action.payload.category,
      };
    case 'SET_CATEGORY':
      return {
        ...state,
        category: action.payload,
      };
    case 'INCREMENT_TOPIC_COUNT':
      return {
        ...state,
        category: {
          ...state.category,
          topicCount: (state.category.topicCount ?? 0) + 1,
        },
      };
    case 'DECREMENT_TOPIC_COUNT':
      return {
        ...state,
        topics: state.topics.filter(t => t.id !== action.payload),
        category: {
          ...state.category,
          topicCount: Math.max(0, (state.category.topicCount ?? 0) - 1),
        },
      };
    case 'ADD_TOPIC_OPTIMISTIC':
      return {
        ...state,
        topics: [...state.topics, action.payload],
        category: {
          ...state.category,
          topicCount: (state.category.topicCount ?? 0) + 1,
        },
      };
    case 'ADD_TOPIC_SUCCESS':
      return {
        ...state,
        topics: state.topics.map(t => t.isOptimistic ? action.payload : t),
      };
    case 'ADD_TOPIC_FAILURE':
      return {
        ...state,
        topics: state.topics.filter(t => !t.isOptimistic),
        category: {
          ...state.category,
          topicCount: Math.max(0, (state.category.topicCount ?? 0) - 1),
        },
      };
    case 'TRIGGER_REFETCH':
      return {
        ...state,
        updateData: !state.updateData,
      };
    default:
      return state;
  }
}

export default function Category(props) {
  const { auth } = useAuth();
  const alertsManagerRef = use(AlertsContext);

  const [open, setOpen] = useState(false);
  const handleOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };

  const [state, dispatch] = useReducer(categoryReducer, {
    topics: [],
    category: props.vals || { category: null, id: null, creator: null, creationDate: null, topicCount: null, visibility: null, position: null },
    updateData: false,
  });
  const { topics, category, updateData } = state;

  const [editingTopic, setEditingTopic] = useState(null);

  const handleEditTopic = (topicToEdit) => {
    setEditingTopic(topicToEdit);
  };

  const handleDeleteTopic = (deletedTopic) => {
    dispatch({ type: 'DECREMENT_TOPIC_COUNT', payload: deletedTopic.id });
    if (props.onCategoryUpdate) {
      props.onCategoryUpdate({
        ...category,
        topicCount: Math.max(0, (category.topicCount ?? 0) - 1)
      });
    }
  };

  const navigate = useNavigate();
  const location = useLocation();
  const [expandAccordion, setexpandAccordion] = useState(false);
  const [sort, setSort] = useState({ field: 'topic', direction: 'asc' });

  const handleUpdate = () => {
    dispatch({ type: 'INCREMENT_TOPIC_COUNT' });
    if (props.onCategoryUpdate) {
      props.onCategoryUpdate({
        ...category,
        topicCount: (category.topicCount ?? 0) + 1
      });
    }
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
      dispatch({ type: 'SET_CATEGORY', payload: props.vals });
    }
  }, [props.vals]);

  useEffect(() => {
    if (!props.vals) return;
    api.get("/forum/topic", {
      params: { category: props.vals.id }
    })
      .then(response => {
        dispatch({ type: 'FETCH_SUCCESS', payload: { topics: response.data, category: props.vals } });
      })
      .catch(error => {
        console.error("Failed to fetch topics", error);
        dispatch({ type: 'SET_CATEGORY', payload: props.vals });
      });
  }, [props.vals.id, updateData]);

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

  const categoryChips = [
    { tooltip: "Ersteller", icon: <PersonIcon />, label: category.creator || 'Unbekannt' },
    { tooltip: "Erstellungsdatum", icon: <EventNoteIcon />, label: convertTimestamp(category.creationDate) },
    { tooltip: "Themen", icon: <TopicIcon />, label: formatNumber(category.topicCount) },
    { tooltip: "Sichtbarkeit", icon: <GroupIcon />, label: category.visibility, color: "error" }
  ];

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
          '& .MuiAccordionSummary-content': {
            width: '100%',
            margin: 0,
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)'
          }
        }}
      >
        <Grid container direction="row" sx={{ alignItems: 'center', width: '100%' }} spacing={2}>
          <Grid size={{ xs: 12, md: 3 }} onClick={redirectToCategory} sx={{ cursor: 'pointer' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'inline-block' }}>
              {category.category}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <ForumChips items={categoryChips} />
          </Grid>

          <Grid size={{ xs: 12, md: 1 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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

        {sortedTopics.length ? (
          sortedTopics.map(topic => (
            <Topic
              key={topic.id}
              topic={topic}
              editCallback={handleEditTopic}
              deleteCallback={handleDeleteTopic}
            />
          ))
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
          <AddTopic 
            onOptimisticAdd={(topicName) => {
              const tempTopic = {
                id: 'temp-' + Date.now(),
                topic: topicName,
                creator: auth.user,
                creationDate: Date.now(),
                views: 0,
                postCount: 0,
                isOptimistic: true
              };
              dispatch({ type: 'ADD_TOPIC_OPTIMISTIC', payload: tempTopic });
            }}
            onAddTopicSuccess={(realTopic) => {
              dispatch({ type: 'ADD_TOPIC_SUCCESS', payload: realTopic });
              if (props.onCategoryUpdate) {
                props.onCategoryUpdate({
                  ...category,
                  topicCount: (category.topicCount ?? 0) + 1
                });
              }
            }}
            onAddTopicFailure={() => {
              dispatch({ type: 'ADD_TOPIC_FAILURE' });
            }}
            onAddTopic={handleUpdate} 
            callback={handleClose} 
            topics={topics} 
            category={{ id: category.id, name: category.category }} 
          />
        </Box>
      </Modal>

      <Modal
        disableScrollLock
        open={!!editingTopic}
        onClose={() => setEditingTopic(null)}
      >
        <Box>
          <AddTopic
            topicToEdit={editingTopic}
            onAddTopic={() => {
              dispatch({ type: 'TRIGGER_REFETCH' });
            }}
            callback={() => setEditingTopic(null)}
            topics={topics}
            category={{ id: category.id, name: category.category }}
          />
        </Box>
      </Modal>
    </Accordion>
  );
}
