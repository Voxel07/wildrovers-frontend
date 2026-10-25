import { useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';

import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

const NavbarLogo = ({ userName }) => {
  const navigate = useNavigate();
  // The session already carries the photo; no extra /user/me request per render.
  const { auth } = useAuth();

  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Profil">
        <IconButton onClick={() => navigate('/Profil')} sx={{ p: 0 }} aria-label="Profil öffnen">
          <Avatar
            alt={userName[0]?.toUpperCase()}
            src={auth.photoUrl}
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
