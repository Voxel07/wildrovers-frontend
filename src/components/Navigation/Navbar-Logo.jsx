import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../helper/api';

import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

const NavbarLogo = ({ userName }) => {
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = React.useState(null);

  React.useEffect(() => {
    if (!userName) return;
    let cancelled = false;
    api.get('/user/me')
      .then((res) => {
        if (!cancelled && res.data?.photoUrl) {
          const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
          setPhotoUrl(base + res.data.photoUrl);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userName]);

  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Profil">
        <IconButton onClick={() => navigate('/Profil')} sx={{ p: 0 }}>
          <Avatar
            alt={userName[0]?.toUpperCase()}
            src={photoUrl}
            sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: '#121212', fontWeight: 700 }}
          >
            {userName[0]?.toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default NavbarLogo;
