import React, { useState, useEffect, use } from 'react';
import PropTypes from 'prop-types';
import api, { extractErrorMessage } from '../../helper/api';

// Mui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

// Eigene
import useAuth from '../../context/useAuth';
import { AlertsContext } from '../../components/utils/AlertsManager';

export default function PollWidget(props) {
  const { pollData, canDelete, onDelete } = props;
  const { auth } = useAuth();
  const alertsManagerRef = use(AlertsContext);

  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState(pollData);
  const [voting, setVoting] = useState(false);

  // Check if current user has already voted and load their votes
  useEffect(() => {
    if (auth.user && poll) {
      api.get('/forum/poll/myVotes', { params: { poll: poll.id } })
        .then(response => {
          const votes = response.data || [];
          setSelectedOptions(votes);
          setHasVoted(votes.length > 0);
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

  const handleCheckboxChange = (optionId) => {
    setSelectedOptions(prev =>
      prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
    );
  };

  const handleVoteSubmit = () => {
    if (selectedOptions.length === 0) {
      alertsManagerRef.current.showAlert('warning', 'Bitte wähle mindestens eine Option aus.');
      return;
    }

    setVoting(true);
    const searchParams = new URLSearchParams();
    searchParams.append('poll', poll.id);
    selectedOptions.forEach(optId => searchParams.append('option', optId));

    api.post(`/forum/poll/vote?${searchParams.toString()}`)
      .then(response => {
        alertsManagerRef.current.showAlert('success', 'Stimme erfolgreich abgegeben!');
        setHasVoted(true);
        if (response.data && response.data.id) {
          setPoll(response.data);
        }
      })
      .catch(error => {
        console.error("Voting failed", error);
        const status = error.response?.status || 500;
        const data = extractErrorMessage(error);
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
    <Card sx={{ border: '1px solid rgba(255, 152, 0, 0.25)', bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <BarChartIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Umfrage: {poll.question}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {hasVoted && auth.user && (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => setHasVoted(false)}
              >
                Stimme ändern
              </Button>
            )}
            {canDelete && (
              <Tooltip title="Umfrage löschen">
                <IconButton
                  size="small"
                  color="error"
                  onClick={onDelete}
                >
                  <DeleteForeverIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {!hasVoted && auth.user ? (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            {poll.allowMultiple ? (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {poll.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    control={
                      <Checkbox
                        color="primary"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => handleCheckboxChange(option.id)}
                      />
                    }
                    label={option.optionText}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            ) : (
              <RadioGroup
                value={selectedOptions[0] || ''}
                onChange={(e) => setSelectedOptions([Number(e.target.value)])}
              >
                {poll.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio color="primary" />}
                    label={option.optionText}
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            )}
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
              const isUserChoice = selectedOptions.includes(option.id);

              return (
                <Box key={option.id} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: isUserChoice ? 'bold' : 'normal' }}>
                        {option.optionText}
                      </Typography>
                      {isUserChoice && <CheckCircleIcon color="success" sx={{ fontSize: '1rem' }} />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
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
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func,
};
