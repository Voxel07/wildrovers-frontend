import React, { useState, useEffect, use } from 'react';
import PropTypes from 'prop-types';
import api from '../../helper/api';

// Mui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BarChartIcon from '@mui/icons-material/BarChart';

// Eigene
import useAuth from '../../context/useAuth';
import { AlertsContext } from '../utils/AlertsManager';

export default function PollWidget(props) {
  const { pollData } = props;
  const { auth } = useAuth();
  const alertsManagerRef = use(AlertsContext);

  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState(pollData);
  const [voting, setVoting] = useState(false);

  // Check if current user has already voted
  useEffect(() => {
    if (auth.user && poll) {
      api.get('/forum/poll/hasVoted', { params: { poll: poll.id } })
        .then(response => {
          setHasVoted(response.data === true);
        })
        .catch(err => {
          console.error("Failed to check if user has voted", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [poll, auth.user]);

  const handleVoteSubmit = () => {
    if (!selectedOption) {
      alertsManagerRef.current.showAlert('warning', 'Bitte wähle eine Option aus.');
      return;
    }

    setVoting(true);
    api.post('/forum/poll/vote', null, {
      params: {
        poll: poll.id,
        option: selectedOption
      }
    })
    .then(response => {
      alertsManagerRef.current.showAlert('success', 'Stimme erfolgreich abgegeben!');
      setHasVoted(true);
      
      // Update local poll votes count dynamically
      setPoll(prev => {
        const updatedOptions = prev.options.map(opt => {
          if (opt.id === Number(selectedOption)) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });
        return { ...prev, options: updatedOptions };
      });
    })
    .catch(error => {
      console.error("Voting failed", error);
      const status = error.response?.status || 500;
      const data = error.response?.data || 'Fehler beim Abstimmen';
      alertsManagerRef.current.showAlert('error', `${status}: ${data}`);
    })
    .finally(() => {
      setVoting(false);
    });
  };

  if (loading) {
    return null;
  }

  // Calculate total votes
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

  return (
    <Card sx={{ border: '1px solid rgba(255, 152, 0, 0.25)', bgcolor: 'background.paper', mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <BarChartIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Umfrage: {poll.question}
          </Typography>
        </Stack>

        {!hasVoted && auth.user ? (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              {poll.options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id.toString()}
                  control={<Radio color="primary" />}
                  label={option.optionText}
                  sx={{ mb: 1 }}
                />
              ))}
            </RadioGroup>
            <Button
              variant="contained"
              color="primary"
              onClick={handleVoteSubmit}
              disabled={voting}
              sx={{ mt: 2, width: 'fit-content' }}
            >
              {voting ? 'Wird übermittelt...' : 'Abstimmen'}
            </Button>
          </FormControl>
        ) : (
          <Box sx={{ width: '100%' }}>
            {poll.options.map((option) => {
              const optVotes = option.votes || 0;
              const percentage = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
              const isUserChoice = Number(selectedOption) === option.id;

              return (
                <Box key={option.id} sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: isUserChoice ? 'bold' : 'normal' }}>
                        {option.optionText}
                      </Typography>
                      {isUserChoice && <CheckCircleIcon color="success" sx={{ fontSize: '1rem' }} />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {optVotes} {optVotes === 1 ? 'Stimme' : 'Stimmen'} ({percentage}%)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: isUserChoice ? 'success.main' : 'primary.main',
                      }
                    }}
                  />
                </Box>
              );
            })}
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
              Stimmen insgesamt: {totalVotes} {!auth.user && ' (Bitte einloggen, um abzustimmen)'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

PollWidget.propTypes = {
  pollData: PropTypes.object.isRequired,
};
