import React, { useState, useEffect } from 'react';
import api from '../../helper/api';
import Tilt from 'react-parallax-tilt';

// Material UI
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';

const roles = {
  vorstand: "Vorstand & Leitung",
  mitglied: "Aktive Mitglieder",
  frischling: "Frischlinge"
};

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/members')
      .then(res => {
        setMembers(res.data);
      })
      .catch(err => {
        console.error("Error fetching team members", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const isBirthdayToday = (bdayStr) => {
    if (!bdayStr) return false;
    const today = new Date();
    const bday = new Date(bdayStr);
    return today.getDate() === bday.getDate() && today.getMonth() === bday.getMonth();
  };

  const getAge = (bdayStr) => {
    if (!bdayStr) return null;
    const today = new Date();
    const bday = new Date(bdayStr);
    let age = today.getFullYear() - bday.getFullYear();
    const m = today.getMonth() - bday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) {
      age--;
    }
    return age + ' Jahre alt';
  };

  const getDuration = (regDate) => {
    if (!regDate) return '';
    const diffTime = Math.abs(new Date() - new Date(regDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return 'Neu im Team';
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} Monate im Team`;
    const diffYears = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    return `${diffYears} ${diffYears === 1 ? 'Jahr' : 'Jahre'} ${remainingMonths > 0 ? `und ${remainingMonths} ${remainingMonths === 1 ? 'Monat' : 'Monate'}` : ''} im Team`;
  };



  const groupedMembers = {
    vorstand: members.filter(u => u.role === 'Vorstand' || u.role === 'Admin'),
    mitglied: members.filter(u => u.role === 'Mitglied'),
    frischling: members.filter(u => u.role === 'Frischling')
  };

  const getAvatarUrl = (photoUrl) => {
    if (!photoUrl) return null;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    return base + photoUrl;
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography variant="h3" color="primary" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
          Das Team
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}>
          Die Wild Rovers Württemberg sind ein engagiertes Airsoft-Team aus dem Großraum Stuttgart.
        </Typography>

        {Object.entries(roles).map(([roleKey, roleTitle]) => {
          const roleMembers = groupedMembers[roleKey] || [];
          if (roleMembers.length === 0) return null;

          return (
            <Box key={roleKey} sx={{ mb: 8 }}>
              <Typography variant="h4" sx={{ borderBottom: 2, borderColor: 'primary.main', pb: 1, mb: 4, fontWeight: 'bold' }}>
                {roleTitle}
              </Typography>

              <Grid container spacing={4}>
                {roleMembers.map((member) => {
                  const initial = member.userName ? member.userName[0].toUpperCase() : 'U';
                  const avatarUrl = getAvatarUrl(member.photoUrl);
                  const isBday = isBirthdayToday(member.birthday);
                  const age = getAge(member.birthday);

                  return (
                    <Grid item xs={12} sm={6} md={4} key={member.id} sx={{ display: 'flex' }}>
                      <Tilt
                        style={{ display: 'flex', width: '100%' }}
                        tiltMaxAngleX={12}
                        tiltMaxAngleY={12}
                        scale={1.02}
                        glareEnable={true}
                        glareMaxOpacity={0.15}
                        glareColor="#ffffff"
                        glareBorderRadius="12px"
                      >
                        <Card
                          sx={{
                            width: '100%',
                            position: 'relative',
                            overflow: 'visible',
                            bgcolor: 'background.paper',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            transition: 'border-color 0.3s ease',
                            '&:hover': {
                              borderColor: 'primary.main'
                            }
                          }}
                          elevation={3}
                        >
                          {/* Ribbon */}
                          {(member.ribbon || member.role === 'Admin') && (
                            <Box sx={{
                              position: 'absolute',
                              top: 15,
                              right: -8,
                              backgroundColor: 'secondary.main',
                              color: 'text.primary',
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              py: 0.5,
                              px: 2,
                              boxShadow: 2,
                              zIndex: 10,
                              borderTopLeftRadius: 4,
                              borderBottomLeftRadius: 4,
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                width: 0,
                                height: 0,
                                borderTop: '8px solid',
                                borderTopColor: 'secondary.dark',
                                borderRight: '8px solid transparent',
                                filter: 'brightness(0.7)'
                              }
                            }}>
                              {member.ribbon || (member.role === 'Admin' ? 'Admin' : '')}
                            </Box>
                          )}

                          {/* Birthday balloon indicator */}
                          {isBday && (
                            <Box sx={{ position: 'absolute', top: 10, left: 10, fontSize: '1.4rem', zIndex: 10 }} title="Hat heute Geburtstag!">
                              🎂
                            </Box>
                          )}

                          <CardContent sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', p: 4 }}>
                            <Avatar
                              src={avatarUrl}
                              alt={member.userName}
                              sx={{
                                width: 120,
                                height: 120,
                                mx: 'auto',
                                mb: 2,
                                border: '2px solid rgba(255, 152, 0, 0.3)',
                                fontSize: '3rem',
                                fontWeight: 'bold',
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                              }}
                            >
                              {initial}
                            </Avatar>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                              {member.userName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 'bold', mb: 2 }}>
                              {member.firstName} {member.lastName}
                            </Typography>

                            {/* Mentors info */}
                            {roleKey === 'frischling' && member.mentorName && (
                              <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 'bold', display: 'block', mb: 1.5 }}>
                                Mentor: {member.mentorName}
                              </Typography>
                            )}

                            {age && (
                              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                                {age}
                              </Typography>
                            )}

                            {member.phrase && (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1, mb: 3 }}>
                                "{member.phrase}"
                              </Typography>
                            )}

                            <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                {getDuration(member.regDate)}
                              </Typography>
                            </Box>

                            {/* Mentoring list for active members */}
                            {roleKey === 'mitglied' && member.mentorOf && member.mentorOf.length > 0 && (
                              <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255, 152, 0, 0.05)', borderLeft: '3px solid', borderColor: 'secondary.main', textAlign: 'left', borderRadius: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: 'secondary.main' }}>Mentor von:</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {member.mentorOf.map((fName) => (
                                    <Chip key={fName} label={fName} size="small" variant="filled" sx={{ fontSize: '0.7rem', height: 20, bgcolor: 'rgba(255,255,255,0.08)' }} />
                                  ))}
                                </Box>
                              </Box>
                            )}

                            {member.visitedOps > 0 && (
                              <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1, border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <Typography variant="caption">
                                  🎖️ Ops besucht: <Typography component="span" variant="caption" color="secondary.main" sx={{ fontWeight: 'bold' }}>{member.visitedOps}</Typography>
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Tilt>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          );
        })}
      </Container>
    </Box>
  );
}
