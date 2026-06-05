import React from 'react';
import { Link, useNavigate } from "react-router-dom";

// Material UI
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import ShieldIcon from '@mui/icons-material/Shield';

// Eigene Imports
import NavbarLogo from './Navbar-Logo';
import NavbarLogin from './Navbar-LoginPromt';
import useAuth from '../../context/useAuth';

const pages = [
  { key: 1, name: "Forum", path: "/Forum" },
  { key: 2, name: "Galerie", path: "/galery" },
  { key: 3, name: "Events", path: "/events" },
  { key: 4, name: "Team", path: "/team" },
  { key: 5, name: "Regeln", path: "/Regeln" }
];

const ResponsiveAppBar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const { auth } = useAuth();
  const navigate = useNavigate();

  const isAdminOrVorstand = auth?.JWT && (auth.roles === 'Admin' || auth.roles === 'Vorstand');
  const visiblePages = [...pages];
  if (isAdminOrVorstand) {
    visiblePages.push({ key: 6, name: "Benutzerverwaltung", path: "/Admin/UserManagement" });
  }

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          
          {/* Desktop Logo Icon */}
          <ShieldIcon color="primary" sx={{ display: { xs: 'none', md: 'flex' }, mr: 1.5, fontSize: '2rem' }} />
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            onClick={() => navigate('/')}
            sx={{
              mr: 4,
              display: { xs: 'none', md: 'flex' },
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 800,
              letterSpacing: '.2rem',
              color: 'primary.main',
              textDecoration: 'none',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            WILDROVERS
          </Typography>

          {/* Mobile Menu Icon */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
              disableScrollLock
            >
              {visiblePages.map((page) => (
                <MenuItem key={page.key} onClick={() => { handleCloseNavMenu(); navigate(page.path); }}>
                  <Typography textAlign="center" sx={{ fontFamily: '"Outfit", sans-serif' }}>
                    {page.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo Icon */}
          <ShieldIcon color="primary" sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, fontSize: '1.8rem' }} />
          
          <Typography
            variant="h5"
            noWrap
            component="div"
            onClick={() => navigate('/')}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 800,
              letterSpacing: '.2rem',
              color: 'primary.main',
              textDecoration: 'none',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            WRW
          </Typography>

          {/* Desktop Navigation Links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {visiblePages.map((page) => (
              <Button
                key={page.key}
                onClick={() => navigate(page.path)}
                sx={{ 
                  my: 2, 
                  color: 'text.primary', 
                  display: 'block',
                  fontSize: '0.95rem',
                  fontWeight: 650,
                  mx: 1.5,
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Avatar Menu or Login Prompt */}
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
