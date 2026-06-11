import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        px: 2,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: '#1a1a1a',
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2 }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'center' },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            &copy; {currentYear} Wild Rovers Würtemberg. Alle Rechte vorbehalten.
          </Typography>
          <Typography
            variant="body2"
            component={Link}
            to="/Datenschutz"
            sx={{
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Datenschutzerklärung
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
