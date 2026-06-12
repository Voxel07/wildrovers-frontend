import React, { useEffect, useState, use } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../helper/api';

// Mui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TopicIcon from '@mui/icons-material/Topic';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

// Eigene
import { convertTimestamp } from '../../helper/converter';
import useAuth from '../../context/useAuth';
import ForumChips from './ForumChips';
import { AlertsContext } from '../../components/utils/AlertsManager';

export default function Topic(props) {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [allPostsViewed, setAllPostsViewed] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const { topic, id, postCount, views, creationDate, creator } = props.topic;
  const alertsManagerRef = use(AlertsContext);

  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    if (e) e.stopPropagation();
    setMenuAnchorEl(null);
  };

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

  useEffect(() => {
    if (postCount > 0) {
      api.get("/forum/post", { params: { topic: id } })
        .then(response => {
          const posts = response.data || [];
          const allViewed = posts.every(p => p.viewed);
          setAllPostsViewed(allViewed);
        })
        .catch(error => {
          console.error("Error fetching posts for topic viewed status", error);
        });
    } else {
      setAllPostsViewed(true);
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

  const topicChipsDesktop = [
    { tooltip: "Beiträge", icon: <TopicIcon />, label: postCount },
    { tooltip: "Aufrufe", icon: <VisibilityIcon />, label: views }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Grid
        container
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
          px: 3,
          py: 1,
          minHeight: 70,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.01)'
          }
        }}
      >
        <Grid size={{ xs: 12, sm: 6, md: 5, lg: 6 }} onClick={redirectToTopic} sx={{ cursor: 'pointer', pl: { xs: 1, sm: 0 } }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <LibraryBooksIcon
              color={allPostsViewed ? "disabled" : "primary"}
              fontSize="medium"
              sx={{ opacity: allPostsViewed ? 0.5 : 1, flexShrink: 0 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {topic}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Erstellt am {convertTimestamp(creationDate, true)} von {creator}
              </Typography>
            </Box>
            {/* Burger menu – only on mobile */}
            {isCreatorOrAdmin && (
              <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexShrink: 0 }}>
                <IconButton size="small" onClick={handleMenuOpen} color="inherit">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 3, md: 3, lg: 2 }} sx={{ display: { xs: 'none', sm: 'block' } }}>
          <ForumChips items={topicChipsDesktop} />
        </Grid>

        <Grid size={{ xs: 12, sm: 3, md: 3, lg: 3 }} sx={{ display: { xs: 'none', sm: 'block' } }}>
          {postCount > 0 && post ? lastEntry() : (
            <Typography variant="caption" color="text.secondary">
              Keine Beiträge
            </Typography>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 1, lg: 1 }} sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'flex-end' }}>
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
          Thema editieren
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteForeverIcon fontSize="small" sx={{ mr: 1 }} />
          Thema löschen
        </MenuItem>
      </Menu>

      <Divider />
    </Box>
  );
}
