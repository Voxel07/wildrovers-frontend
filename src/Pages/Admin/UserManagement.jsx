import React, { useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../helper/api';
import useAuth from '../../context/useAuth';
import { AlertsContext } from '../../components/utils/AlertsManager';

// MUI
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import Chip from '@mui/material/Chip';

export default function UserManagement() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const alertsManagerRef = use(AlertsContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const isAuthorized = auth?.JWT && (auth.roles === 'Admin' || auth.roles === 'Vorstand');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/user')
      .then(response => {
        setUsers(response.data);
      })
      .catch(err => {
        console.error("Error fetching users", err);
        alertsManagerRef.current.showAlert('error', 'Fehler beim Laden der Benutzerliste.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!auth || !auth.JWT) {
      navigate('/Login');
      return;
    }
    if (auth.roles !== 'Admin' && auth.roles !== 'Vorstand') {
      navigate('/unauthorized');
      return;
    }
    fetchUsers();
  }, [auth, navigate]);

  const handleRoleChange = (userId, newRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleToggleActive = (userId, currentVal) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !currentVal } : u));
  };

  const handleToggleFeePaid = (userId, currentVal) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, yearlyFeePaid: !currentVal } : u));
  };

  const handleSaveUser = (user) => {
    setSavingId(user.id);
    // Construct database entity properties correctly
    const payload = {
      id: user.id,
      userName: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password, // Keep current password representation
      role: user.role,
      isActive: user.active, // Map local boolean back to entity isActive property
      yearlyFeePaid: user.yearlyFeePaid
    };

    api.post('/user', payload)
      .then(() => {
        alertsManagerRef.current.showAlert('success', `Benutzer ${user.userName} erfolgreich aktualisiert.`);
      })
      .catch(err => {
        console.error("Error updating user", err);
        const msg = err.response?.data || 'Fehler beim Speichern.';
        alertsManagerRef.current.showAlert('error', `Speichern fehlgeschlagen: ${msg}`);
        // Refresh to revert local state
        fetchUsers();
      })
      .finally(() => {
        setSavingId(null);
      });
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6, px: { xs: 1, md: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)} 
            variant="text"
          >
            Zurück
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Benutzerverwaltung
          </Typography>
        </Stack>
        <Button 
          startIcon={<RefreshIcon />} 
          variant="outlined" 
          onClick={fetchUsers}
          disabled={loading}
        >
          Aktualisieren
        </Button>
      </Stack>

      <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: 'background.paper', borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.08)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Benutzername</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>E-Mail-Adresse</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rolle</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status (Aktiv)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Beitrag bezahlt</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Events besucht</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.01)' } }}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{user.userName}</TableCell>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role || 'Besucher'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="Besucher">Besucher</MenuItem>
                          <MenuItem value="Frischling">Frischling</MenuItem>
                          <MenuItem value="Mitglied">Mitglied</MenuItem>
                          <MenuItem value="Vorstand">Vorstand</MenuItem>
                          <MenuItem value="Admin">Admin</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={user.active === true || user.active === undefined}
                          onChange={() => handleToggleActive(user.id, user.active !== false)}
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={!!user.yearlyFeePaid}
                          onChange={() => handleToggleFeePaid(user.id, !!user.yearlyFeePaid)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${user.eventsAttended ?? 0} Einsätze`} 
                          size="small" 
                          variant="outlined" 
                          color="secondary"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={savingId === user.id ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                          onClick={() => handleSaveUser(user)}
                          disabled={savingId !== null}
                        >
                          Speichern
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">Keine Benutzer gefunden.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
