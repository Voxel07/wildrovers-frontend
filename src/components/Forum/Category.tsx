import { useState, useEffect, use, useReducer, useRef, type MouseEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { extractErrorMessage, getErrorStatus } from '../../helper/api';

// MUI
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

// Eigene
import Topic from "./Topic";
import AddTopic from './AddTopic';
import { AlertsContext } from '../../components/utils/AlertsManager';
import { convertTimestamp, formatNumber, hasRequiredRole, isModerator } from '../../helper/converter';
import useAuth from '../../context/useAuth';
import ForumChips, { type ForumChipItem } from './ForumChips';
import type { ForumCategory, ForumTopic, StoppableEvent } from '../../types';

interface CategoryState {
  topics: ForumTopic[];
  category: ForumCategory;
  updateData: boolean;
  topicsError: string | null;
}

type CategoryAction =
  | { type: 'FETCH_SUCCESS'; payload: { topics: ForumTopic[]; category: ForumCategory } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_CATEGORY'; payload: ForumCategory }
  | { type: 'INCREMENT_TOPIC_COUNT' }
  | { type: 'DECREMENT_TOPIC_COUNT'; payload: number }
  | { type: 'ADD_TOPIC_OPTIMISTIC'; payload: ForumTopic }
  | { type: 'ADD_TOPIC_SUCCESS'; payload: ForumTopic }
  | { type: 'ADD_TOPIC_FAILURE' }
  | { type: 'TRIGGER_REFETCH' };

interface CategoryProps {
  vals: ForumCategory;
  /** Topics already loaded by the parent; used for the first render only. */
  topics?: ForumTopic[];
  currentIndex?: number;
  editCallback: (category: ForumCategory) => void;
  deleteCallback: (category: ForumCategory) => void;
  onCategoryUpdate?: (category: ForumCategory) => void;
}

type TopicSortField = 'topic' | 'creationDate' | 'postCount' | 'views';

function categoryReducer(state: CategoryState, action: CategoryAction): CategoryState {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return {
        ...state,
        topics: action.payload.topics,
        category: action.payload.category,
        topicsError: null,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        topicsError: action.payload,
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

export default function Category(props: CategoryProps) {
  const { auth } = useAuth();
  const alertsManagerRef = use(AlertsContext);

  const [open, setOpen] = useState(false);
  const handleOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };

  const [state, dispatch] = useReducer(categoryReducer, {
    topics: [],
    category: props.vals,
    updateData: false,
    topicsError: null,
  });
  const { topics, category, updateData, topicsError } = state;

  const [editingTopic, setEditingTopic] = useState<ForumTopic | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  // Menu onClose passes the backdrop click or key event, typed only as {}.
  const handleMenuClose = (e?: StoppableEvent | object) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    setMenuAnchorEl(null);
  };

  const handleEditTopic = (topicToEdit: ForumTopic) => {
    setEditingTopic(topicToEdit);
  };

  const handleDeleteTopic = (deletedTopic: ForumTopic) => {
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
  // Topics are listed alphabetically.
  const sort: { field: TopicSortField; direction: 'asc' | 'desc' } = { field: 'topic', direction: 'asc' };

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
    setexpandAccordion(true);
  }, []);

  const handleExpandClick = (e: StoppableEvent) => {
    e.stopPropagation();
    setexpandAccordion(!expandAccordion);
  };

  useEffect(() => {
    if (props.vals) {
      dispatch({ type: 'SET_CATEGORY', payload: props.vals });
    }
  }, [props.vals]);

  // Topics preloaded by the parent (forum overview) are used for the first render only;
  // later refreshes (after adding/editing a topic) fetch this category again.
  const preloadedTopics = useRef<ForumTopic[] | null | undefined>(props.topics);

  useEffect(() => {
    if (!props.vals) return;
    if (preloadedTopics.current) {
      dispatch({ type: 'FETCH_SUCCESS', payload: { topics: preloadedTopics.current, category: props.vals } });
      preloadedTopics.current = null;
      return;
    }
    api.get<ForumTopic[]>("/forum/topic", {
      params: { category: props.vals.id, size: 200 }
    })
      .then(response => {
        dispatch({ type: 'FETCH_SUCCESS', payload: { topics: response.data, category: props.vals } });
      })
      .catch(error => {
        console.error("Failed to fetch topics", error);
        dispatch({ type: 'FETCH_ERROR', payload: extractErrorMessage(error) });
        dispatch({ type: 'SET_CATEGORY', payload: props.vals });
      });
  }, [props.vals.id, updateData]);

  function redirectToCategory(e: StoppableEvent) {
    e.stopPropagation();
    if (!location.pathname.toLowerCase().includes("forum/category")) {
      navigate("/Forum/Category/" + props.vals.id);
    }
  }

  function handleDelete(e: StoppableEvent) {
    e.stopPropagation();
    api.delete('/forum/category', {
      data: { id: category.id }
    })
      .then(() => {
        alertsManagerRef.current?.showAlert('success', 'Kategorie: ' + category.category + ' erfolgreich gelöscht');
        props.deleteCallback(category);
      })
      .catch(error => {
        console.error(error);
        const status = getErrorStatus(error) || 500;
        const msg = extractErrorMessage(error);
        alertsManagerRef.current?.showAlert('error', `${status}: ${msg}`);
      });
  }

  function handleEdit(e: StoppableEvent) {
    e.stopPropagation();
    props.editCallback(category);
  }

  const sortedTopics = [...topics].sort((a, b) => {
    const valA = a[sort.field] ?? 0;
    const valB = b[sort.field] ?? 0;
    const cmp = typeof valA === 'string'
      ? valA.localeCompare(String(valB))
      : (valA as number) < (valB as number) ? -1 : (valA as number) > (valB as number) ? 1 : 0;
    return sort.direction === 'asc' ? cmp : -cmp;
  });

  const isCreatorOrAdmin = auth.user === category.creator || isModerator(auth.roles);

  const categoryChipsDesktop: ForumChipItem[] = [
    { tooltip: "Ersteller", icon: <PersonIcon />, label: category.creator || 'Unbekannt' },
    { tooltip: "Erstellungsdatum", icon: <EventNoteIcon />, label: category.creationDate != null ? convertTimestamp(category.creationDate) : '' },
    { tooltip: "Themen", icon: <TopicIcon />, label: formatNumber(category.topicCount ?? 0) },
    { tooltip: "Sichtbarkeit", icon: <GroupIcon />, label: category.visibility, color: "error" }
  ];

  return (
    <Accordion expanded={expandAccordion} sx={{ border: '1px solid rgba(255, 255, 255, 0.08)', ml: { xs: 1, sm: 2, md: 3 } }}>
      <AccordionSummary
        expandIcon={
          <span onClick={handleExpandClick} style={{ display: 'flex', alignItems: 'center', padding: 4, cursor: 'pointer' }}>
            <ExpandMoreIcon />
          </span>
        }
        aria-controls={`panel-${category.id}-content`}
        id={`panel-${category.id}-header`}
        sx={{
          py: 0.5,
          pb: 0.75,
          position: 'relative',
          '& .MuiAccordionSummary-content': {
            width: '100%',
            margin: 0,
          },
          '& .MuiAccordionSummary-expandIconWrapper': {
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 8,
            display: 'flex',
            alignItems: 'center',
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)'
          }
        }}
      >
        <Grid 
          container 
          spacing={1} 
          sx={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            width: '100%',
            pr: isCreatorOrAdmin ? { xs: 10, sm: 14 } : 5
          }}
        >
          <Grid size={{ xs: 12, sm: 4, md: 3 }} onClick={redirectToCategory} sx={{ cursor: 'pointer' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'inline-block' }}>
              {category.category}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 8, md: 9 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, mx: 'auto', width: 'fit-content' }}>
              <ForumChips items={categoryChipsDesktop} />
            </Box>
          </Grid>
        </Grid>

        {/* Action Controls (Edit/Delete or Burger Menu) */}
        {isCreatorOrAdmin && (
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 40,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Desktop edit/delete buttons */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Kategorie editieren">
                  <IconButton size="small" onClick={handleEdit} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Kategorie löschen">
                  <IconButton size="small" onClick={handleDelete} color="error">
                    <DeleteForeverIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
            {/* Mobile burger menu */}
            <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
              <IconButton aria-label="Weitere Aktionen" size="small" onClick={handleMenuOpen} color="inherit">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}
      </AccordionSummary>
      <Divider />
      <AccordionDetails sx={{ bgcolor: 'rgba(0, 0, 0, 0.1)', p: 0 }}>
        {topicsError ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="warning.main">
              Themen konnten nicht geladen werden: {topicsError}
            </Typography>
          </Box>
        ) : sortedTopics.length ? (
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
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          {(auth.roles !== 'Besucher' || auth.canCreateCategory) && hasRequiredRole(auth.roles, category.visibility) && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              onClick={handleOpen}
            >
              Thema hinzufügen
            </Button>
          )}
        </Box>
      </Box>

      <Modal
        disableScrollLock
        open={open}
        onClose={handleClose}
      >
        <Box>
          <AddTopic
            onOptimisticAdd={(topicName) => {
              const tempTopic: ForumTopic = {
                // Negative: never collides with a server id.
                id: -Date.now(),
                topic: topicName,
                creator: auth.user ?? undefined,
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

      {/* Mobile burger menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Kategorie editieren
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteForeverIcon fontSize="small" sx={{ mr: 1 }} />
          Kategorie löschen
        </MenuItem>
      </Menu>
    </Accordion>
  );
}
