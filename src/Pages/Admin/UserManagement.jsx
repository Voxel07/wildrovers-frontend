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
import BackButton from '../../components/Navigation/BackButton';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import BlockIcon from '@mui/icons-material/Block';
import HowToRegIcon from '@mui/icons-material/HowToReg';

export default function UserManagement() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const alertsManagerRef = use(AlertsContext);

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Signup toggle state
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [signupToggleLoading, setSignupToggleLoading] = useState(false);

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteAccount, setDeleteAccount] = useState(true);
  const [deleteEvents, setDeleteEvents] = useState(true);
  const [deleteForumPosts, setDeleteForumPosts] = useState(true);
  const [deleteGallery, setDeleteGallery] = useState(true);
  const [hardDelete, setHardDelete] = useState(false);

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
    // Fetch initial signup status
    api.get('/user/signup-status')
      .then(res => setSignupEnabled(res.data.signupEnabled))
      .catch(err => console.error('Failed to fetch signup status', err));
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

  const handleToggleCanCreateCategory = (userId, currentVal) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, canCreateCategory: !currentVal } : u));
  };

  const handleToggleBlocked = (userId, currentVal) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !currentVal } : u));
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
      role: user.role,
      isActive: activeVal,
      active: activeVal,
      isBlocked: !!user.isBlocked,
      yearlyFeePaid: user.yearlyFeePaid,
      canCreateCategory: !!user.canCreateCategory
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
    setDeleteAccount(true);
    setDeleteEvents(true);
    setDeleteForumPosts(true);
    setDeleteGallery(true);
    setHardDelete(false);
    setConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setUserToDelete(null);
    setDeleteAccount(true);
    setDeleteEvents(true);
    setDeleteForumPosts(true);
    setDeleteGallery(true);
    setHardDelete(false);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    const user = userToDelete;
    setConfirmOpen(false);
    setUserToDelete(null);
    setDeletingId(user.id);

    api.delete(`/user/${user.id}`, {
      params: {
        deleteAccount: !!deleteAccount,
        deleteEvents: !!deleteEvents,
        deletePosts: !!deleteForumPosts,
        deleteGallery: !!deleteGallery,
        hardDelete: !!hardDelete
      }
    })
      .then(() => {
        if (deleteAccount) {
          if (hardDelete) {
            alertsManagerRef.current.showAlert('success', `Benutzer ${user.userName} wurde unwiderruflich gelöscht.`);
          } else {
            alertsManagerRef.current.showAlert('success', `Benutzer ${user.userName} wurde gesperrt und ausgewählte Daten gelöscht.`);
          }
        } else {
          alertsManagerRef.current.showAlert('success', `Ausgewählte Daten von ${user.userName} erfolgreich gelöscht.`);
        }
        fetchUsers();
      })
      .catch(err => {
        console.error('Error deleting user data', err);
        const msg = err.response?.data || 'Fehler beim Löschen.';
        alertsManagerRef.current.showAlert('error', `Löschen fehlgeschlagen: ${msg}`);
      })
      .finally(() => {
        setDeletingId(null);
      });
  };

  const handleSignupToggle = () => {
    setSignupToggleLoading(true);
    const newValue = !signupEnabled;
    api.post(`/user/signup-enabled?enabled=${newValue}`)
      .then(res => {
        setSignupEnabled(res.data.signupEnabled);
        alertsManagerRef.current.showAlert(
          'success',
          res.data.signupEnabled
            ? 'Registrierung wurde wieder aktiviert.'
            : 'Registrierung wurde deaktiviert.'
        );
      })
      .catch(err => {
        console.error('Failed to toggle signup', err);
        alertsManagerRef.current.showAlert('error', 'Fehler beim Ändern der Registrierungseinstellung.');
      })
      .finally(() => setSignupToggleLoading(false));
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
          <BackButton
            variant="text"
            fallbackPath="/"
          />
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

      {/* Signup Toggle Card */}
      <Card sx={{ mb: 3, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: 'background.paper', borderRadius: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {signupEnabled
              ? <HowToRegIcon sx={{ color: 'success.main', fontSize: 28, flexShrink: 0 }} />
              : <BlockIcon sx={{ color: 'error.main', fontSize: 28, flexShrink: 0 }} />}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.3 }}>
                Registrierung neuer Benutzer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {signupEnabled
                  ? 'Neue Benutzer können sich derzeit registrieren.'
                  : 'Die Registrierung ist derzeit deaktiviert.'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={signupEnabled ? 'Aktiv' : 'Deaktiviert'}
              color={signupEnabled ? 'success' : 'error'}
              variant="outlined"
              size="small"
            />
            <Tooltip title={signupEnabled ? 'Registrierung deaktivieren' : 'Registrierung aktivieren'}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  checked={signupEnabled}
                  onChange={handleSignupToggle}
                  disabled={signupToggleLoading}
                  color={signupEnabled ? 'success' : 'error'}
                  id="signup-toggle"
                />
              </span>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

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
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Gesperrt</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Beitrag bezahlt</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Kategorie & Thema</TableCell>
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
                          checked={!!user.isBlocked}
                          onChange={() => handleToggleBlocked(user.id, !!user.isBlocked)}
                          color="error"
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
                        <Switch
                          checked={user.role === 'Besucher' ? !!user.canCreateCategory : true}
                          onChange={() => handleToggleCanCreateCategory(user.id, !!user.canCreateCategory)}
                          disabled={user.role !== 'Besucher'}
                          color="warning"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={getUserEventsCurrentYearList(user.userName).join(', ') || 'Keine Events in diesem Jahr'}>
                          <Chip
                            label={`${getUserEventsCurrentYear(user.userName)}`}
                            size="small"
                            variant="outlined"
                            color="secondary"
                            sx={{ cursor: 'help' }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
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
                      <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
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
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'background.paper',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              minWidth: { xs: '90%', sm: 450 },
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          Daten löschen / Benutzer entfernen
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', mb: 2 }}>
            Wähle aus, welche Daten für den Benutzer{' '}
            <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              {userToDelete?.userName}
            </Box>{' '}
            gelöscht werden sollen:
          </DialogContentText>
          <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={deleteAccount}
                  onChange={e => setDeleteAccount(e.target.checked)}
                  color="error"
                  id="delete-account-checkbox"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: deleteAccount ? 'error.main' : 'text.primary' }}>
                    Benutzerkonto sperren & Profil anonymisieren
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sperrt den Account dauerhaft und anonymisiert die Profildaten. Der Benutzer kann sich nicht erneut anmelden.
                  </Typography>
                </Box>
              }
            />

            {deleteAccount && (
              <FormControlLabel
                sx={{ ml: 3 }}
                control={
                  <Checkbox
                    checked={hardDelete}
                    onChange={e => setHardDelete(e.target.checked)}
                    color="error"
                    id="hard-delete-checkbox"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: hardDelete ? 'error.main' : 'text.primary' }}>
                      Unwiderruflich löschen (Hard Delete)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Entfernt den Account komplett aus der Datenbank. Ermöglicht spätere erneute Registrierung mit gleicher E-Mail.
                    </Typography>
                  </Box>
                }
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={deleteEvents}
                  onChange={e => setDeleteEvents(e.target.checked)}
                  color="error"
                  id="delete-events-checkbox"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: deleteEvents ? 'error.main' : 'text.primary' }}>
                    Veranstaltungen & Anmeldungen löschen
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Löscht alle vom Benutzer erstellten Events sowie seine Event-Teilnahmen.
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={deleteForumPosts}
                  onChange={e => setDeleteForumPosts(e.target.checked)}
                  color="error"
                  id="delete-forum-posts-checkbox"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: deleteForumPosts ? 'error.main' : 'text.primary' }}>
                    Forumsbeiträge löschen
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Löscht Posts, Antworten und leere Themen. Beiträge mit Antworten anderer Benutzer werden beibehalten (Autor anonymisiert).
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={deleteGallery}
                  onChange={e => setDeleteGallery(e.target.checked)}
                  color="error"
                  id="delete-gallery-checkbox"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: deleteGallery ? 'error.main' : 'text.primary' }}>
                    Galerieeinträge löschen
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Löscht alle vom Benutzer erstellten Galerieeinträge.
                  </Typography>
                </Box>
              }
            />
          </Stack>
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
            disabled={!deleteAccount && !deleteEvents && !deleteForumPosts && !deleteGallery}
            autoFocus
          >
            Ausgewählte Daten löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
