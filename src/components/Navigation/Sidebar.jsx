import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// MUI
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

// Icons
import ForumIcon from '@mui/icons-material/Forum';
import CollectionsIcon from '@mui/icons-material/Collections';
import EventIcon from '@mui/icons-material/Event';
import GroupsIcon from '@mui/icons-material/Groups';
import GavelIcon from '@mui/icons-material/Gavel';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LoginIcon from '@mui/icons-material/Login';

// Context
import useAuth from '../../context/useAuth';
import { UserContext } from '../../context/UserContext';
import api from '../../helper/api';

// Navigation items
const navItems = [
  { key: 1, name: 'Forum', path: '/Forum', icon: <ForumIcon /> },
  { key: 2, name: 'Galerie', path: '/galery', icon: <CollectionsIcon /> },
  { key: 3, name: 'Events', path: '/events', icon: <EventIcon /> },
  { key: 4, name: 'Team', path: '/team', icon: <GroupsIcon /> },
  { key: 5, name: 'Regeln', path: '/Regeln', icon: <GavelIcon /> },
];

export const SIDEBAR_FULL_WIDTH = 240;
export const SIDEBAR_MINI_WIDTH = 64;
const TOPBAR_HEIGHT = 65;

/**
 * Collapsible sidebar with three modes cycled by a single button:
 *   full  → icons + labels  (240px)
 *   mini  → icons only       (64px)
 *   hidden → gone            (restore via hamburger in Navbar)
 */
const Sidebar = ({ mode, onToggleMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuth } = useAuth();
  const { setUser } = React.useContext(UserContext);
  const [photoUrl, setPhotoUrl] = React.useState(null);

  // Fetch user profile photo on mount / when user changes
  React.useEffect(() => {
    if (!auth?.user) {
      setPhotoUrl(null);
      return;
    }
    let cancelled = false;
    api.get('/user/me')
      .then((res) => {
        if (!cancelled && res.data?.photoUrl) {
          const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
          setPhotoUrl(base + res.data.photoUrl);
        }
      })
      .catch(() => {}); // silently ignore
    return () => { cancelled = true; };
  }, [auth?.user]);

  const isAdminOrVorstand = auth?.JWT && (auth.roles === 'Admin' || auth.roles === 'Vorstand');
  const visibleItems = [...navItems];
  if (isAdminOrVorstand) {
    visibleItems.push({ key: 6, name: 'Benutzerverwaltung', path: '/Admin/UserManagement', icon: <AdminPanelSettingsIcon /> });
  }

  const isCurrentPath = (path) => {
    if (path === '/Forum') return location.pathname.startsWith('/Forum');
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await api.post('/user/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser({ valid: false, jwt: null });
      setAuth({ JWT: null, user: null, roles: null });
      navigate('/', { replace: true });
    }
  };

  const sidebarWidth = mode === 'full' ? SIDEBAR_FULL_WIDTH : SIDEBAR_MINI_WIDTH;

  const toggleTooltip = mode === 'full' ? 'Collapse' : 'Hide sidebar';

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: sidebarWidth,
        bgcolor: '#1a1a1a',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'width 0.25s ease',
      }}
    >
      {/* Header: Profile at top (full mode only) + toggle button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: TOPBAR_HEIGHT,
          px: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
          justifyContent: mode === 'full' ? 'space-between' : 'flex-end',
          gap: 0.5,
        }}
      >
        {/* Profile — only in full mode */}
        {mode === 'full' && auth?.user && (
          <ListItemButton
            onClick={() => navigate('/Profil')}
            sx={{
              borderRadius: 2,
              flex: 1,
              minWidth: 0,
              py: 0.5,
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.06)' },
            }}
          >
            <Avatar
              src={photoUrl}
              sx={{ width: 28, height: 28, fontSize: '0.85rem', bgcolor: 'primary.main', color: '#121212', mr: 1.5, flexShrink: 0 }}
            >
              {auth.user[0].toUpperCase()}
            </Avatar>
            <ListItemText
              primary={auth.user}
              slotProps={{ primary: { fontSize: '0.85rem', noWrap: true } }}
            />
          </ListItemButton>
        )}

        {/* Toggle */}
        <Tooltip title={toggleTooltip} placement="right">
          <IconButton
            size="small"
            onClick={onToggleMode}
            sx={{ color: 'text.secondary', flexShrink: 0 }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Navigation Links */}
      <List sx={{ flex: 1, pt: 1, px: mode === 'full' ? 1 : 0.5 }}>
        {visibleItems.map((item) => {
          const active = isCurrentPath(item.path);
          const link = (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  justifyContent: mode === 'full' ? 'flex-start' : 'center',
                  px: mode === 'full' ? 1.5 : 1,
                  minHeight: 44,
                  color: active ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: mode === 'full' ? 40 : 'auto',
                    color: 'inherit',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {mode === 'full' && (
                  <ListItemText
                    primary={item.name}
                    slotProps={{
                      primary: {
                        fontSize: '0.9rem',
                        fontWeight: active ? 650 : 500,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );

          return mode === 'mini' ? (
            <Tooltip key={item.key} title={item.name} placement="right" arrow>
              {link}
            </Tooltip>
          ) : (
            link
          );
        })}
      </List>

      {/* Bottom: Logout only */}
      <Box sx={{ p: mode === 'full' ? 1.5 : 0.5 }}>
        {auth?.user ? (
          mode === 'full' ? (
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                color: 'text.secondary',
                '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.12)', color: '#f44336' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" slotProps={{ primary: { fontSize: '0.85rem' } }} />
            </ListItemButton>
          ) : (
            <Tooltip title="Logout" placement="right" arrow>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: '#f44336', bgcolor: 'rgba(244, 67, 54, 0.08)' },
                  }}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Box>
            </Tooltip>
          )
        ) : (
          mode === 'full' ? (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<LoginIcon />}
              fullWidth
              onClick={() => navigate('/Login')}
              sx={{ borderRadius: 2 }}
            >
              LogIn
            </Button>
          ) : (
            <Tooltip title="LogIn" placement="right" arrow>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton onClick={() => navigate('/Login')} sx={{ color: 'primary.main' }}>
                  <LoginIcon />
                </IconButton>
              </Box>
            </Tooltip>
          )
        )}
      </Box>
    </Box>
  );

  // Hidden mode – nothing rendered (restore via hamburger in Navbar)
  if (mode === 'hidden') return null;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        transition: 'width 0.25s ease',
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          bgcolor: '#1a1a1a',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundImage: 'none',
          transition: 'width 0.25s ease',
          overflow: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

/**
 * Hook to manage sidebar state.
 *   toggleMode   – cycles full → mini → hidden
 *   restoreSidebar – always sets to 'full' (used by Navbar hamburger)
 */
export const useSidebar = () => {
  const [mode, setMode] = React.useState('full');

  const toggleMode = React.useCallback(() => {
    setMode((prev) => {
      if (prev === 'full') return 'mini';
      if (prev === 'mini') return 'hidden';
      return 'full'; // shouldn't be reached from toggle, but safe fallback
    });
  }, []);

  const restoreSidebar = React.useCallback(() => setMode('full'), []);

  const contentOffset = mode === 'hidden' ? 0 : mode === 'full' ? SIDEBAR_FULL_WIDTH : SIDEBAR_MINI_WIDTH;

  return { mode, toggleMode, restoreSidebar, contentOffset };
};

export default Sidebar;
