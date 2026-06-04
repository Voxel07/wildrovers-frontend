import React, { useEffect, useState, use, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../helper/api';

// Mui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Quill for Reply Editor
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Eigene
import Post from '../../components/Forum/Post';
import Answer from '../../components/Forum/Answer';
import PollWidget from '../../components/Forum/PollWidget';
import { AlertsContext } from '../../components/utils/AlertsManager';
import useAuth from '../../context/useAuth';

export default function Forum_Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const alertsManagerRef = use(AlertsContext);

  const [post, setPost] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reply State
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Fetch post and answers — Promise.all ensures loading stays true until BOTH arrive
  const fetchData = useCallback(() => {
    setLoading(true);
    setPost(null);
    setAnswers([]);

    Promise.all([
      api.get("/forum/post", { params: { post: id } }),
      api.get("/forum/answer", { params: { post: id } }),
    ])
      .then(([postRes, answersRes]) => {
        setPost(postRes.data?.[0] ?? null);
        setAnswers(answersRes.data ?? []);
      })
      .catch(error => {
        console.error("Error fetching post/answers", error);
        alertsManagerRef.current.showAlert('error', 'Fehler beim Laden des Posts');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, alertsManagerRef]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReplySubmit = () => {
    if (!replyContent || replyContent.trim() === '' || replyContent === '<p><br></p>') {
      alertsManagerRef.current.showAlert('warning', 'Bitte gib eine Antwort ein');
      return;
    }

    setSubmittingReply(true);
    api.put(`/forum/answer?post=${id}`, {
      content: replyContent
    })
    .then(response => {
      alertsManagerRef.current.showAlert('success', 'Antwort erfolgreich hinzugefügt');
      setReplyContent('');
      fetchData(); // Reload post & answers
    })
    .catch(error => {
      console.error(error);
      const status = error.response?.status || 500;
      const data = error.response?.data || 'Fehler beim Senden';
      alertsManagerRef.current.showAlert('error', `${status}: ${data}`);
    })
    .finally(() => {
      setSubmittingReply(false);
    });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Dieser Post existiert nicht</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 3 }}>
          Zurück
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6, px: { xs: 1, md: 3 } }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 3 }}
        variant="text"
      >
        Zurück
      </Button>

      {/* Post content */}
      <Box sx={{ mb: 4 }}>
        <Post post={post} onUpdate={fetchData} />
      </Box>

      {/* Render Poll if exists in the post data */}
      {post.poll && (
        <Box sx={{ mb: 4 }}>
          <PollWidget pollData={post.poll} />
        </Box>
      )}

      {/* Answers section */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
        Antworten ({answers.length})
      </Typography>

      <Grid container direction="column" spacing={3}>
        {answers.length ? (
          answers.map(answer => (
            <Grid item key={answer.id}>
              <Answer answer={answer} onUpdate={fetchData} />
            </Grid>
          ))
        ) : (
          <Grid item>
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Noch keine Antworten. Schreibe die erste Antwort!</Typography>
            </Card>
          </Grid>
        )}

        {/* Reply Editor Form */}
        {auth.user ? (
          <Grid item sx={{ mt: 4 }}>
            <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Antwort verfassen
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <ReactQuill 
                    theme="snow"
                    value={replyContent}
                    onChange={setReplyContent}
                    placeholder="Schreibe eine Antwort..."
                    style={{ height: 200, marginBottom: 50 }}
                  />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon />}
                  onClick={handleReplySubmit}
                  disabled={submittingReply}
                >
                  {submittingReply ? "Wird gesendet..." : "Antwort senden"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid item sx={{ mt: 4 }}>
            <Card sx={{ p: 3, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Typography color="text.secondary">
                Bitte logge dich ein, um eine Antwort zu verfassen.
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
