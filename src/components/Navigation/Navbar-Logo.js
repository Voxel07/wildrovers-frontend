import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import { deepOrange } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { UserContext } from '../../context/UserContext';
import { Link } from "react-router-dom";
import useAuth from '../../context/useAuth';
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];


const NavbarLogo = props => {

  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const { setUser} = useContext(UserContext);

  const handleOpenUserMenu = (event) => {
      setAnchorElUser(event.currentTarget);
    };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  async function LogOut (){
    axios.post('https://localhost/user/logout')
    .then(response=>{
        setUser({valid:false, jwt:null});
        setAuth({JWT: null, user: null, roles: null});
        navigate("/", {replace:true});
    })
    .catch(error =>{
      console.log(error);
    })
}

const NavBarLogoMenue = () =>{
  const [ setAnchorElNav] = React.useState(null);

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return(
    <Paper  sx={{ width: 120, magin:0, padding:0  }}>
      <Link to={"Profil"}key={"Profil"}><MenuItem onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{"Profil"}</Typography>
                </MenuItem></Link>
        <MenuItem>
          <ListItemText onClick={LogOut}>LogOut</ListItemText >
        </MenuItem>
    </Paper>
  )
}

  return (
    <Box sx={{ flexGrow: 0}}>
        <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar alt={props.userName[0].toUpperCase()} src="..\..\..\images\Default_Profile_Background.png" />
            </IconButton>
        </Tooltip>
        <Menu
            sx={{ mt: '45px', magin:0, padding:0  }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
        >
            <NavBarLogoMenue />
        </Menu>
    </Box>
  )
};

export default NavbarLogo;


