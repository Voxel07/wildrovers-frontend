import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../helper/api';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableSortLabel from '@mui/material/TableSortLabel';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ForumIcon from '@mui/icons-material/Forum';
import EventNoteIcon from '@mui/icons-material/EventNote';
import Tooltip from '@mui/material/Tooltip';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// Eigene
import Post from '../../components/Forum/Posts';
import { convertTimestamp } from '../../helper/converter';

export default function Forum_Topic() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [topicData, setTopicData] = useState({});
  const [sort, setSort] = useState({ field: 'creationDate', direction: 'asc' });

  useEffect(() => {
    const controller = new AbortController();

    api.get('/forum/post', {
      params: { topic: id },
      signal: controller.signal,
    })
      .then(response => setPosts(response.data))
      .catch(error => {
        if (error.code === 'ERR_CANCELED') return;
        console.error(error);
      });

    api.get('/forum/topic', {
      params: { topicId: id },
      signal: controller.signal,
    })
      .then(response => setTopicData(response.data[0] || {}))
      .catch(error => {
        if (error.code === 'ERR_CANCELED') return;
        console.error(error);
      });

    return () => {
      controller.abort();
    };
  }, [id]);

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

  const { topic, postCount, creationDate, creator } = topicData;

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, md: 3 }, py: 3 }}>

      {/* Topic header */}
      <Accordion expanded sx={{ mb: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
        <AccordionSummary
          aria-controls="topic-header-content"
          id="topic-header"
          sx={{ cursor: 'default', '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}
        >
          <Grid container direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {topic}
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                <Tooltip title="Ersteller" placement="top">
                  <Chip icon={<PersonOutlineIcon />} label={creator} variant="outlined" size="small" />
                </Tooltip>
                <Tooltip title="Erstellungsdatum" placement="top">
                  <Chip icon={<EventNoteIcon />} label={convertTimestamp(creationDate)} variant="outlined" size="small" />
                </Tooltip>
                <Tooltip title="Beiträge" placement="top">
                  <Chip icon={<ForumIcon />} label={postCount} variant="outlined" size="small" />
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </AccordionSummary>

        <Divider />

        {/* Sort toolbar */}
        <Box sx={{
          px: 3,
          py: 1.5,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: { xs: 'none', md: 'block' },
        }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Sortieren:
            </Typography>
            <TableSortLabel
              active={sort.field === 'creationDate'}
              direction={sort.field === 'creationDate' ? sort.direction : 'asc'}
              onClick={() => handleSort('creationDate')}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Datum</Typography>
            </TableSortLabel>
            <TableSortLabel
              active={sort.field === 'likes'}
              direction={sort.field === 'likes' ? sort.direction : 'asc'}
              onClick={() => handleSort('likes')}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Likes</Typography>
            </TableSortLabel>
            <TableSortLabel
              active={sort.field === 'title'}
              direction={sort.field === 'title' ? sort.direction : 'asc'}
              onClick={() => handleSort('title')}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Titel</Typography>
            </TableSortLabel>
            <TableSortLabel
              active={sort.field === 'answerCount'}
              direction={sort.field === 'answerCount' ? sort.direction : 'asc'}
              onClick={() => handleSort('answerCount')}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Antworten</Typography>
            </TableSortLabel>
          </Stack>
        </Box>

        <AccordionDetails sx={{ p: 0 }}>
          <Post posts={sortedPosts} topicId={id} topic={topic} />
        </AccordionDetails>
      </Accordion>

    </Container>
  );
}
