import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";

// Material UI
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';

// Icons
import ForumIcon from '@mui/icons-material/Forum';
import CollectionsIcon from '@mui/icons-material/Collections';
import EventIcon from '@mui/icons-material/Event';
import GroupsIcon from '@mui/icons-material/Groups';
import GavelIcon from '@mui/icons-material/Gavel';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

// Assets
import RoversLogo from '../../images/WRW_small.webp';

// Components
import NavbarLogo from './Navbar-Logo';
import NavbarLogin from './Navbar-LoginPromt';
import useAuth from '../../context/useAuth';
import { UserContext } from '../../context/UserContext';
import api from '../../helper/api';

const navItems = [
  { key: 1, name: 'Forum', path: '/Forum', icon: <ForumIcon /> },
  { key: 2, name: 'Galerie', path: '/galery', icon: <CollectionsIcon /> },
  { key: 3, name: 'Events', path: '/events', icon: <EventIcon /> },
  { key: 4, name: 'Team', path: '/team', icon: <GroupsIcon /> },
  { key: 5, name: 'Regeln', path: '/Regeln', icon: <GavelIcon /> },
];

const DRAWER_WIDTH = 260;

/**
 * Responsive top bar.
 * - Desktop (md+): nav links shown inline in the toolbar.
 * - Mobile (<md): hamburger button opens a temporary drawer with nav links.
 */
const ResponsiveAppBar = () => {
  const { auth, setAuth } = useAuth();
  const { setUser } = React.useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAdminOrVorstand = auth?.JWT && (auth.roles === 'Admin' || auth.roles === 'Vorstand');

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

  const handleNavClick = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  const mobileDrawer = (
    <Box sx={{ width: DRAWER_WIDTH, bgcolor: '#1a1a1a', height: '100%' }} role="presentation">
      {/* Drawer header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, height: 65, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, letterSpacing: '.15rem', color: 'primary.main' }}>
          WILDROVERS
        </Typography>
        <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List sx={{ pt: 1 }}>
        {navItems.map((item) => {
          const active = isCurrentPath(item.path);
          return (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5, px: 1 }}>
              <ListItemButton
                onClick={() => handleNavClick(item.path)}
                sx={{
                  borderRadius: 2,
                  color: active ? 'primary.main' : 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.name}
                  slotProps={{ primary: { fontWeight: active ? 650 : 500 } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        {isAdminOrVorstand && (
          <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
            <ListItemButton
              onClick={() => handleNavClick('/Admin/UserManagement')}
              sx={{
                borderRadius: 2,
                color: location.pathname === '/Admin/UserManagement' ? 'primary.main' : 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Benutzerverwaltung" />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mt: 'auto' }} />

      <Box sx={{ p: 1.5 }}>
        {auth?.user ? (
          <ListItemButton
            onClick={() => { setDrawerOpen(false); handleLogout(); }}
            sx={{
              borderRadius: 2,
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.12)', color: '#f44336' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LoginIcon />}
            fullWidth
            onClick={() => { setDrawerOpen(false); navigate('/Login'); }}
            sx={{ borderRadius: 2 }}
          >
            LogIn
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        elevation={0}
      >
        <Container maxWidth={false}>
          <Toolbar disableGutters sx={{ minHeight: 65, px: 2, display: 'flex', position: 'relative' }}>

            {/* Left section: hamburger + logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {/* Hamburger – only on mobile */}
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open navigation"
                onClick={() => setDrawerOpen(true)}
                sx={{ display: { md: 'none' }, mr: 1 }}
              >
                <MenuIcon />
              </IconButton>

              {/* Logo Icon */}
              <Box
                component="img"
                src={RoversLogo}
                alt="WRW Logo"
                sx={{ height: 32, width: 32, objectFit: 'contain', mr: 1.5, flexShrink: 0 }}
              />

              {/* App Name – desktop: next to logo */}
              <Typography
                variant="h6"
                noWrap
                onClick={() => navigate('/')}
                sx={{
                  display: { xs: 'none', md: 'block' },
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 800,
                  letterSpacing: '.2rem',
                  color: 'primary.main',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                WILDROVERS
              </Typography>
            </Box>

            {/* App Name – mobile: centered between hamburger and avatar */}
            <Typography
              variant="h6"
              noWrap
              onClick={() => navigate('/')}
              sx={{
                display: { xs: 'block', md: 'none' },
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: '"Outfit", sans-serif',
                fontWeight: 800,
                letterSpacing: '.2rem',
                color: 'primary.main',
                textDecoration: 'none',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              WILDROVERS
            </Typography>

            {/* Center: desktop nav links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', flex: { md: 1 }, gap: 0.5 }}>
              {navItems.map((item) => {
                const active = isCurrentPath(item.path);
                return (
                  <Button
                    key={item.key}
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: active ? 'primary.main' : 'text.secondary',
                      fontWeight: active ? 650 : 500,
                      '&:hover': { color: 'primary.main' },
                      textTransform: 'none',
                      fontSize: '0.9rem',
                    }}
                  >
                    {item.name}
                  </Button>
                );
              })}
              {isAdminOrVorstand && (
                <Button
                  onClick={() => navigate('/Admin/UserManagement')}
                  sx={{
                    color: location.pathname === '/Admin/UserManagement' ? 'primary.main' : 'text.secondary',
                    fontWeight: location.pathname === '/Admin/UserManagement' ? 650 : 500,
                    '&:hover': { color: 'primary.main' },
                    textTransform: 'none',
                    fontSize: '0.9rem',
                  }}
                >
                  Benutzerverwaltung
                </Button>
              )}
            </Box>

            {/* Right section: logout + avatar or login */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1, gap: 1 }}>
              {auth.user ? (
                <>
                  <Tooltip title="Logout" placement="bottom">
                    <IconButton
                      onClick={handleLogout}
                      sx={{
                        display: { xs: 'none', md: 'inline-flex' },
                        color: 'text.secondary',
                        '&:hover': { color: '#f44336', bgcolor: 'rgba(244, 67, 54, 0.08)' },
                      }}
                    >
                      <LogoutIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <NavbarLogo userName={auth.user} />
                </>
              ) : (
                <NavbarLogin />
              )}
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#1a1a1a',
            backgroundImage: 'none',
          },
        }}
      >
        {mobileDrawer}
      </Drawer>
    </>
  );
};

export default ResponsiveAppBar;
