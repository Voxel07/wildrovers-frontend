import React from 'react';
import { useNavigate } from "react-router-dom";

// Material UI
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import MenuIcon from '@mui/icons-material/Menu';
import Tooltip from '@mui/material/Tooltip';

// Assets
import RoversLogo from '../../images/WRW_small.webp';

// Components
import NavbarLogo from './Navbar-Logo';
import NavbarLogin from './Navbar-LoginPromt';
import useAuth from '../../context/useAuth';

/**
 * Slim top bar. Navigation lives in the Sidebar.
 * When the sidebar is hidden, a single hamburger button restores it.
 */
const ResponsiveAppBar = ({ sidebarHidden, onRestoreSidebar }) => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      elevation={0}
    >
      <Container maxWidth={false}>
        <Toolbar disableGutters sx={{ minHeight: 56, px: 2 }}>

          {/* Hamburger – only when sidebar is hidden, restores it to full */}
          {sidebarHidden && (
            <Tooltip title="Show navigation" placement="bottom">
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open sidebar"
                onClick={onRestoreSidebar}
                sx={{ mr: 1.5 }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Logo Icon */}
          <Box
            component="img"
            src={RoversLogo}
            alt="WRW Logo"
            sx={{ height: 32, width: 32, objectFit: 'contain', mr: 1.5, flexShrink: 0 }}
          />

          {/* App Name */}
          <Typography
            variant="h6"
            noWrap
            onClick={() => navigate('/')}
            sx={{
              mr: 4,
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

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Avatar or Login */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            {auth.user ? (
              <NavbarLogo userName={auth.user} />
            ) : (
              <NavbarLogin />
            )}
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default ResponsiveAppBar;
