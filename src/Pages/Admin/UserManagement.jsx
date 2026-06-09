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
import DeleteIcon from '@mui/icons-material/Delete';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

export default function UserManagement() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const alertsManagerRef = use(AlertsContext);

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const isAuthorized = auth?.JWT && (auth.roles === 'Admin' || auth.roles === 'Vorstand');

  const fetchUsers = () => {
    setLoading(true);
    Promise.all([
      api.get('/user'),
      api.get('/event')
    ])
      .then(([usersRes, eventsRes]) => {
        setUsers(usersRes.data);
        setEvents(eventsRes.data);
      })
      .catch(err => {
        console.error("Error fetching users and events", err);
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
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !currentVal, isActive: !currentVal } : u));
  };

  const handleToggleFeePaid = (userId, currentVal) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, yearlyFeePaid: !currentVal } : u));
  };

  const handleSaveUser = (user) => {
    setSavingId(user.id);
    const activeVal = user.isActive !== undefined ? user.isActive : user.active;
    const payload = {
      id: user.id,
      userName: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      role: user.role,
      isActive: activeVal,
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
        fetchUsers();
      })
      .finally(() => {
        setSavingId(null);
      });
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    const user = userToDelete;
    setConfirmOpen(false);
    setUserToDelete(null);
    setDeletingId(user.id);

    api.delete(`/user/${user.id}`)
      .then(() => {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        alertsManagerRef.current.showAlert('success', `Benutzer ${user.userName} erfolgreich gelöscht.`);
      })
      .catch(err => {
        console.error("Error deleting user", err);
        const msg = err.response?.data || 'Fehler beim Löschen.';
        alertsManagerRef.current.showAlert('error', `Löschen fehlgeschlagen: ${msg}`);
      })
      .finally(() => {
        setDeletingId(null);
      });
  };

  const getUserEventsCurrentYear = (userName) => {
    const currentYear = new Date().getFullYear();
    return events.filter(event => {
      const isCurrentYear = event.eventDate && new Date(event.eventDate).getFullYear() === currentYear;
      const hasAttended = event.attendances?.some(a => a.userName === userName && a.status === 'YES');
      return isCurrentYear && hasAttended;
    }).length;
  };

  const getUserEventsCurrentYearList = (userName) => {
    const currentYear = new Date().getFullYear();
    return events
      .filter(event => {
        const isCurrentYear = event.eventDate && new Date(event.eventDate).getFullYear() === currentYear;
        const hasAttended = event.attendances?.some(a => a.userName === userName && a.status === 'YES');
        return isCurrentYear && hasAttended;
      })
      .map(e => e.title);
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6, px: { xs: 1, md: 3 } }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
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
                          checked={user.isActive !== undefined ? user.isActive : (user.active !== undefined ? user.active : true)}
                          onChange={() => handleToggleActive(user.id, user.isActive !== undefined ? user.isActive : (user.active !== undefined ? user.active : true))}
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
                        <Tooltip title={getUserEventsCurrentYearList(user.userName).join(', ') || 'Keine Einsätze in diesem Jahr'}>
                          <Chip 
                            label={`${getUserEventsCurrentYear(user.userName)} Einsätze`} 
                            size="small" 
                            variant="outlined" 
                            color="secondary"
                            sx={{ cursor: 'help' }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={savingId === user.id ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                            onClick={() => handleSaveUser(user)}
                            disabled={savingId !== null || deletingId === user.id}
                          >
                            Speichern
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={deletingId === user.id ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                            onClick={() => handleDeleteClick(user)}
                            disabled={savingId !== null || deletingId !== null}
                          >
                            Löschen
                          </Button>
                        </Stack>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            minWidth: 360,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          Benutzer löschen
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Bist du sicher, dass du den Benutzer{' '}
            <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              {userToDelete?.userName}
            </Box>{' '}
            unwiderruflich löschen möchtest? Alle zugehörigen Daten werden entfernt.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleDeleteCancel} variant="outlined" color="inherit">
            Abbrechen
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            autoFocus
          >
            Endgültig löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
