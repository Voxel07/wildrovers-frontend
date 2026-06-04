import React, { useState, useEffect, use, useReducer } from 'react';
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

function pollReducer(state, action) {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        hasVoted: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        loading: false,
      };
    case 'VOTE_START':
      return {
        ...state,
        voting: true,
      };
    case 'VOTE_SUCCESS': {
      const selectedOptionId = action.payload;
      const updatedOptions = state.poll.options.map(opt => {
        if (opt.id === Number(selectedOptionId)) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });
      return {
        ...state,
        voting: false,
        hasVoted: true,
        poll: { ...state.poll, options: updatedOptions },
      };
    }
    case 'VOTE_FAILURE':
      return {
        ...state,
        voting: false,
      };
    default:
      return state;
  }
}

export default function PollWidget(props) {
  const { pollData } = props;
  const { auth } = useAuth();
  const alertsManagerRef = use(AlertsContext);

  const [state, dispatch] = useReducer(pollReducer, {
    hasVoted: false,
    loading: true,
    poll: pollData,
    voting: false,
  });
  const { hasVoted, loading, poll, voting } = state;

  const [selectedOption, setSelectedOption] = useState('');
  const pollId = pollData?.id;

  // Check if current user has already voted
  useEffect(() => {
    if (auth.user && pollId) {
      api.get('/forum/poll/hasVoted', { params: { poll: pollId } })
        .then(response => {
          dispatch({ type: 'FETCH_SUCCESS', payload: response.data === true });
        })
        .catch(err => {
          console.error("Failed to check if user has voted", err);
          dispatch({ type: 'FETCH_FAILURE' });
        });
    } else {
      dispatch({ type: 'FETCH_FAILURE' });
    }
  }, [pollId, auth.user]);

  const handleVoteSubmit = () => {
    if (!selectedOption) {
      alertsManagerRef.current.showAlert('warning', 'Bitte wähle eine Option aus.');
      return;
    }

    dispatch({ type: 'VOTE_START' });
    api.post('/forum/poll/vote', null, {
      params: {
        poll: poll.id,
        option: selectedOption
      }
    })
    .then(response => {
      alertsManagerRef.current.showAlert('success', 'Stimme erfolgreich abgegeben!');
      dispatch({ type: 'VOTE_SUCCESS', payload: selectedOption });
    })
    .catch(error => {
      console.error("Voting failed", error);
      const status = error.response?.status || 500;
      const data = error.response?.data || 'Fehler beim Abstimmen';
      alertsManagerRef.current.showAlert('error', `${status}: ${data}`);
      dispatch({ type: 'VOTE_FAILURE' });
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
