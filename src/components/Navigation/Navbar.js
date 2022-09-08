import React,{ useContext } from 'react';

//Material UI
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AdbIcon from '@mui/icons-material/Adb';
import { grey } from '@material-ui/core/colors';
import { Link } from "react-router-dom";
import MenuItem from '@mui/material/MenuItem';

// Eigene Imports
import NavbarLogo from './Navbar-Logo';
import NavbarLogin from './Navbar-LoginPromt';

//Context
import { UserContext } from '../../context/UserContext';


const pages = [{key: 1, name:"Forum"},{key: 2, name:"Forum"},{key: 3, name:"Regeln"}];

const ResponsiveAppBar = props => {

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const {user} = useContext(UserContext);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  //Replace with check if the user is loged in
  // <switchNavbar.Provider value={test/}>
  // const test = useContext(LoginState);

  return (

    <AppBar position="static">
      <Container maxWidth="xl"sx={{backgroundColor : grey[800]}}>
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xsQF: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            WILDROVERS
          </Typography>

            {/* Collapesd menue Items */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
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
            >
              {pages.map((page) => (
                <Link to={"Forum"}key={page.key}><MenuItem onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem></Link>
              ))}
            </Menu>
          </Box>

          {/* This is displayed when window is to small */}
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            WRW
          </Typography>

          {/* Big menue items */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Link to={page.name} key={page.key}><Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.name}
              </Button></Link>
            ))}
          </Box>

          {/* Avatar Item */}
          {
            user.valid ? <NavbarLogo userName={user.name} /> : <NavbarLogin/>
          }


        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
