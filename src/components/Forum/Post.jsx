import React, { useState, use, useReducer } from 'react';
import PropTypes from 'prop-types';
import api from '../../helper/api';

// Mui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import ForumIcon from '@mui/icons-material/Forum';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import BarChartIcon from '@mui/icons-material/BarChart';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

// Quill
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Eigene
import { convertTimestamp, formatNumber } from '../../helper/converter';
import useAuth from '../../context/useAuth';
import { AlertsContext } from '../utils/AlertsManager';

function PostStats({ answerCount, views }) {
    return (
        <Stack direction="row" spacing={1}>
            <Tooltip title="Antworten" placement="top">
                <Chip icon={<ForumIcon />} label={formatNumber(answerCount)} variant="outlined" size="small" />
            </Tooltip>
            <Tooltip title="Aufrufe" placement="top">
                <Chip icon={<VisibilityIcon />} label={formatNumber(views)} variant="outlined" size="small" />
            </Tooltip>
        </Stack>
    );
}

function votingReducer(state, action) {
    switch (action.type) {
        case 'VOTE_OPTIMISTIC': {
            const type = action.payload;
            if (state.voted === type) return state;
            let newLikes = state.likes;
            let newDislikes = state.dislikes;
            if (type === 'like') {
                newLikes += 1;
                if (state.voted === 'dislike') newDislikes -= 1;
            } else {
                newDislikes += 1;
                if (state.voted === 'like') newLikes -= 1;
            }
            return { likes: newLikes, dislikes: newDislikes, voted: type };
        }
        case 'VOTE_SUCCESS':
            return {
                ...state,
                likes: action.payload.likes,
                dislikes: action.payload.dislikes,
            };
        case 'VOTE_REVERT': {
            const type = action.payload;
            let newLikes = state.likes;
            let newDislikes = state.dislikes;
            if (type === 'like') {
                newLikes -= 1;
            } else {
                newDislikes -= 1;
            }
            return { likes: newLikes, dislikes: newDislikes, voted: null };
        }
        default:
            return state;
    }
}

const noModules = { toolbar: false };

export default function Post({ post, onUpdate, onDelete, onAddPoll, pollsVisible, onTogglePolls }) {
    const { auth } = useAuth();
    const alertsManagerRef = use(AlertsContext);

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post?.content ?? '');
    const [saving, setSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Optimistic like/dislike state using useReducer
    const [votingState, dispatchVoting] = useReducer(votingReducer, {
        likes: post?.likes ?? 0,
        dislikes: post?.dislikes ?? 0,
        voted: null,
    });
    const { likes, dislikes, voted } = votingState;

    if (!post) return null;

    const { id, title, creator, creationDate, answerCount, views } = post;
    const isCreatorOrAdmin = auth.user === creator || auth.roles === 'Admin';

    const handleVote = (type) => {
        if (!auth.user) {
            alertsManagerRef.current.showAlert('warning', 'Bitte einloggen um abzustimmen');
            return;
        }
        if (voted === type) return; // already voted this type

        // Optimistic update
        dispatchVoting({ type: 'VOTE_OPTIMISTIC', payload: type });

        api.post(`/forum/post/vote?post=${id}&type=${type}`)
            .then(res => {
                // Sync with server truth
                if (res.data) {
                    dispatchVoting({
                        type: 'VOTE_SUCCESS',
                        payload: {
                            likes: res.data.likes,
                            dislikes: res.data.dislikes,
                        },
                    });
                }
            })
            .catch(err => {
                console.error('Vote error', err);
                // Revert optimistic on error
                dispatchVoting({ type: 'VOTE_REVERT', payload: type });
            });
    };

    const handleSaveEdit = () => {
        if (!editContent || editContent.trim() === '' || editContent === '<p><br></p>') {
            alertsManagerRef.current.showAlert('warning', 'Bitte gib einen Inhalt ein');
            return;
        }
        setSaving(true);
        api.post('/forum/post', { id, content: editContent })
            .then(() => {
                alertsManagerRef.current.showAlert('success', 'Beitrag erfolgreich aktualisiert');
                setIsEditing(false);
                if (onUpdate) onUpdate();
            })
            .catch(err => {
                const status = err.response?.status || 500;
                const rawData = err.response?.data;
                const msg = typeof rawData === 'object'
                    ? (rawData.message || rawData.details || JSON.stringify(rawData))
                    : (rawData || 'Fehler beim Speichern');
                alertsManagerRef.current.showAlert('error', `${status}: ${msg}`);
            })
            .finally(() => setSaving(false));
    };

    const handleDeletePostActual = () => {
        setSaving(true);
        api.delete('/forum/post', {
            data: { id }
        })
            .then(() => {
                alertsManagerRef.current.showAlert('success', 'Beitrag erfolgreich gelöscht');
                if (onDelete) onDelete();
            })
            .catch(err => {
                const status = err.response?.status || 500;
                const rawData = err.response?.data;
                const msg = typeof rawData === 'object'
                    ? (rawData.message || rawData.details || JSON.stringify(rawData))
                    : (rawData || 'Fehler beim Löschen');
                alertsManagerRef.current.showAlert('error', `${status}: ${msg}`);
            })
            .finally(() => setSaving(false));
    };


    return (
        <Box sx={{ width: '100%', p: { xs: 2, md: 3 } }}>
            <Grid container spacing={2} sx={{ flexDirection: 'column' }}>
                <Grid size={{ xs: 12 }}>
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                            <Avatar
                                alt={creator ? creator[0].toUpperCase() : 'U'}
                                sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 'bold' }}
                            />
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    von {creator}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    erstellt am {convertTimestamp(creationDate)}
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Edit controls (creator / admin only) */}
                        {isCreatorOrAdmin && !saving && (
                            <Stack direction="row" spacing={0.5}>
                                {isEditing ? (
                                    <>
                                        <Tooltip title="Speichern">
                                            <IconButton size="small" color="primary" onClick={handleSaveEdit}>
                                                <SaveIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Abbrechen">
                                            <IconButton size="small" color="error" onClick={() => { setIsEditing(false); setEditContent(post.content); }}>
                                                <CancelIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <>
                                        <Tooltip title="Beitrag bearbeiten">
                                            <IconButton size="small" color="primary" onClick={() => setIsEditing(true)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Beitrag löschen">
                                            <IconButton size="small" color="error" onClick={() => setDeleteDialogOpen(true)}>
                                                <DeleteForeverIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                            </Stack>
                        )}
                    </Stack>
                </Grid>

                <Divider />

                {/* Content — edit mode shows Quill, view mode shows read-only */}
                <Grid size={{ xs: 12 }}>
                    {isEditing ? (
                        <Box sx={{ mb: 1 }}>
                            <style>{`.post-edit-quill .ql-container.ql-snow, .post-edit-quill .ql-toolbar.ql-snow { border-color: rgba(255,255,255,0.12) !important; }`}</style>
                            <Box className="post-edit-quill">
                            <ReactQuill
                                theme="snow"
                                value={editContent}
                                onChange={setEditContent}
                                style={{ height: 300, marginBottom: 50 }}
                            />
                            </Box>
                        </Box>
                    ) : (
                        <Box className="post-body-content" sx={{ mt: 1 }}>
                            <style>{`.post-body-content .ql-container.ql-snow { border: none !important; } .post-body-content .ql-editor { padding: 0; }`}</style>
                            <ReactQuill
                                theme="snow"
                                modules={noModules}
                                value={post.content}
                                readOnly
                            />
                        </Box>
                    )}
                </Grid>
                <Divider sx={{ mt: 1 }} />                {/* Like / Dislike bar + Poll button */}
                <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Tooltip title="Gefällt mir">
                                <IconButton
                                    size="small"
                                    color={voted === 'like' ? 'primary' : 'default'}
                                    onClick={() => handleVote('like')}
                                >
                                    {voted === 'like' ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                                </IconButton>
                            </Tooltip>
                            <Typography variant="body2" sx={{ minWidth: 20 }}>{formatNumber(likes)}</Typography>

                            <Tooltip title="Gefällt mir nicht">
                                <IconButton
                                    size="small"
                                    color={voted === 'dislike' ? 'error' : 'default'}
                                    onClick={() => handleVote('dislike')}
                                >
                                    {voted === 'dislike' ? <ThumbDownIcon /> : <ThumbDownOutlinedIcon />}
                                </IconButton>
                            </Tooltip>
                            <Typography variant="body2" sx={{ minWidth: 20 }}>{formatNumber(dislikes)}</Typography>
                        </Stack>

                        {isCreatorOrAdmin && onAddPoll && (
                            <Tooltip title="Umfrage hinzufügen">
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    startIcon={<BarChartIcon />}
                                    onClick={onAddPoll}
                                >
                                    Umfrage hinzufügen
                                </Button>
                            </Tooltip>
                        )}
                        {onTogglePolls && (
                            <Tooltip title={pollsVisible ? 'Umfragen ausblenden' : 'Umfragen einblenden'}>
                                <IconButton size="small" onClick={onTogglePolls} color={pollsVisible ? 'primary' : 'default'}>
                                    {pollsVisible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Grid>
            </Grid>

            {/* Custom Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        backgroundImage: 'none',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 2,
                        minWidth: 320
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    Beitrag löschen
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Möchtest du diesen Beitrag wirklich unwiderruflich löschen? Alle Antworten, Bilder und zugehörigen Umfragen gehen dabei verloren.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
                        Abbrechen
                    </Button>
                    <Button
                        onClick={() => {
                            setDeleteDialogOpen(false);
                            handleDeletePostActual();
                        }}
                        variant="contained"
                        color="error"
                        disabled={saving}
                    >
                        Löschen
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

Post.propTypes = {
    post: PropTypes.object,
    onUpdate: PropTypes.func,
    onDelete: PropTypes.func,
  onAddPoll: PropTypes.func,
};
