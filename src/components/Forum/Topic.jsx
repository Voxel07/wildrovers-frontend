import React, { useEffect, useState, use } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../helper/api';

// Mui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TopicIcon from '@mui/icons-material/Topic';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';

// Eigene
import { convertTimestamp } from '../../helper/converter';
import useAuth from '../../context/useAuth';
import ForumChips from './ForumChips';
import { AlertsContext } from '../../components/utils/AlertsManager';

export default function Topic(props) {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const { topic, id, postCount, views, creationDate, creator } = props.topic;
  const alertsManagerRef = use(AlertsContext);

  function redirectToTopic() {
    navigate("/Forum/Topic/" + id);
  }

  function redirectToPost() {
    if (post && post.id) {
      navigate("/Forum/Post/" + post.id);
    }
  }

  function lastEntry() {
    if (!post) return null;
    return (
      <Box
        onClick={redirectToPost}
        sx={{
          cursor: 'pointer',
          textAlign: 'left',
          p: 1,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
          }
        }}
      >
        <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', color: 'primary.main', maxWidth: 150 }}>
          {post.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          von {post.creator || 'System'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {convertTimestamp(post.creationDate)}
        </Typography>
      </Box>
    );
  }

  useEffect(() => {
    if (postCount > 0) {
      api.get("/forum/post/latest", { params: { topic: id } })
        .then(response => {
          setPost(response.data);
        })
        .catch(error => {
          console.error("Error fetching latest post", error);
        });
    } else {
      setPost(null);
    }
  }, [id, postCount]);

  function handleDelete(e) {
    e.stopPropagation();
    api.delete('/forum/topic', {
      data: { id: id }
    })
      .then(response => {
        alertsManagerRef.current.showAlert('success', 'Thema: ' + topic + ' erfolgreich gelöscht');
        if (props.deleteCallback) props.deleteCallback(props.topic);
      })
      .catch(error => {
        console.error(error);
        const resCode = error.response?.status || 500;
        const resData = error.response?.data || "Fehler beim Löschen";
        alertsManagerRef.current.showAlert('error', `${resCode}: ${resData}`);
      });
  }

  function handleEdit(e) {
    e.stopPropagation();
    if (props.editCallback) props.editCallback(props.topic);
  }

  const isCreatorOrAdmin = auth.user === creator || auth.roles === "Admin";

  const topicChips = [
    { tooltip: "Beiträge", icon: <TopicIcon />, label: postCount },
    { tooltip: "Aufrufe", icon: <VisibilityIcon />, label: views }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Grid
        container
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          px: 3,
          py: 1,
          minHeight: 70,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.01)'
          }
        }}
      >
        <Grid item xs={12} sm={6} md={5} lg={6} onClick={redirectToTopic} sx={{ cursor: 'pointer' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <LibraryBooksIcon color="primary" fontSize="medium" />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {topic}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Erstellt am {convertTimestamp(creationDate)} von {creator}
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={3} md={3} lg={2}>
          <ForumChips items={topicChips} />
        </Grid>

        <Grid item xs={12} sm={3} md={3} lg={3}>
          {postCount > 0 && post ? lastEntry() : (
            <Typography variant="caption" color="text.secondary">
              Keine Beiträge
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} sm={12} md={1} lg={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {isCreatorOrAdmin && (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Thema editieren">
                <IconButton size="small" onClick={handleEdit} color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Thema löschen">
                <IconButton size="small" onClick={handleDelete} color="error">
                  <DeleteForeverIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Grid>
      </Grid>
      <Divider />
    </Box>
  );
}
