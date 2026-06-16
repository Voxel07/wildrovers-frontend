import React, { useReducer, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { extractErrorMessage } from '../../helper/api';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableSortLabel from '@mui/material/TableSortLabel';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import RefreshIcon from '@mui/icons-material/Refresh';

import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import ForumIcon from '@mui/icons-material/Forum';
import EventNoteIcon from '@mui/icons-material/EventNote';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// Eigene
import Post from '../../components/Forum/Posts';
import { convertTimestamp } from '../../helper/converter';
import ForumBreadcrumbs from '../../components/Forum/ForumBreadcrumbs';
import ForumChips from '../../components/Forum/ForumChips';

const initialFetchState = { posts: [], topicData: null, loading: true, error: null, errorStatus: null };

function fetchReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true, error: null, errorStatus: null };
    case 'FETCH_SUCCESS': return { posts: action.posts, topicData: action.topicData, loading: false, error: null, errorStatus: null };
    case 'FETCH_ERROR': return { ...state, loading: false, error: action.payload, errorStatus: action.status };
    default: return state;
  }
}

export default function Forum_Topic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetchState, dispatch] = useReducer(fetchReducer, initialFetchState);
  const { posts, topicData, loading, error, errorStatus } = fetchState;
  const [sort, setSort] = useState({ field: 'creationDate', direction: 'asc' });

  const fetchTopicData = useCallback(() => {
    const controller = new AbortController();
    dispatch({ type: 'FETCH_START' });

    Promise.all([
      api.get('/forum/post', {
        params: { topic: id },
        signal: controller.signal,
      }),
      api.get('/forum/topic', {
        params: { topicId: id },
        signal: controller.signal,
      })
    ])
      .then(([postsRes, topicRes]) => {
        dispatch({
          type: 'FETCH_SUCCESS',
          posts: postsRes.data || [],
          topicData: topicRes.data?.[0] || null,
        });
      })
      .catch(error => {
        if (error.code === 'ERR_CANCELED') return;
        console.error(error);
        dispatch({
          type: 'FETCH_ERROR',
          payload: extractErrorMessage(error),
          status: error.response?.status || 0,
        });
      });

    return () => {
      controller.abort();
    };
  }, [id]);

  useEffect(() => {
    const cleanup = fetchTopicData();
    return cleanup;
  }, [fetchTopicData]);

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedPosts = [...posts].sort((a, b) => {
    const valA = a[sort.field] ?? 0;
    const valB = b[sort.field] ?? 0;
    const cmp = typeof valA === 'string'
      ? valA.localeCompare(valB)
      : valA < valB ? -1 : valA > valB ? 1 : 0;
    return sort.direction === 'asc' ? cmp : -cmp;
  });

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
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={fetchTopicData}>
              Erneut versuchen
            </Button>
          }
        >
          {isRateLimit
            ? 'Zu viele Anfragen — bitte warte einen Moment.'
            : `Fehler beim Laden des Themas: ${error}`}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 1 }}>
          Zurück
        </Button>
      </Container>
    );
  }

  if (!topicData || !topicData.id) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Dieses Thema existiert nicht oder Sie haben keine Berechtigung, es anzusehen.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 3 }}>
          Zurück
        </Button>
      </Container>
    );
  }

  const { topic, postCount, creationDate, creator } = topicData;

  const topicChips = [
    { tooltip: "Ersteller", icon: <PersonOutlineIcon />, label: creator || 'Unbekannt' },
    { tooltip: "Erstellungsdatum", icon: <EventNoteIcon />, label: convertTimestamp(creationDate, true) },
    { tooltip: "Beiträge", icon: <ForumIcon />, label: postCount }
  ];

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, md: 3 }, py: 3, pb: 6 }}>
      <ForumBreadcrumbs
        categoryId={topicData.categoryId}
        categoryName={topicData.categoryName}
        topicId={id}
        topicName={topic}
      />

      {/* Topic header */}
      <Accordion expanded sx={{ mb: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
        <AccordionSummary
          aria-controls="topic-header-content"
          id="topic-header"
          sx={{
            cursor: 'default',
            py: 0.5,
            '& .MuiAccordionSummary-content': {
              width: '100%',
              margin: 0,
            },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
          }}
        >
          <Grid container spacing={2} sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {topic}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
              <Box sx={{ display: { xs: 'none', md: 'block' }, '@media (min-width: 450px)': { display: 'block' } }}>
                <ForumChips items={topicChips} />
              </Box>
            </Grid>
          </Grid>
        </AccordionSummary>

        <Divider />


        <AccordionDetails sx={{ p: 0 }}>
          <Post posts={sortedPosts} topicId={id} topic={topic} />
        </AccordionDetails>
      </Accordion>

    </Container>
  );
}
