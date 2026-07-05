import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Card, CardContent, Box,
} from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import { convertTimestamp } from '../../helper/converter';

export default function ForumActivityOverview({ users }) {
  if (!users || users.length === 0) return null;

  const sorted = [...users].filter(u =>
    (u.forumPostCount || 0) + (u.forumAnswerCount || 0) + (u.forumTopicCount || 0) + (u.forumCategoryCount || 0) > 0
  );

  if (sorted.length === 0) {
    return (
      <Card sx={{ mt: 4, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">Keine Forum-Aktivität vorhanden.</Typography>
        </CardContent>
      </Card>
    );
  }

  sorted.sort((a, b) => {
    const total = u => (u.forumPostCount || 0) + (u.forumAnswerCount || 0) + (u.forumTopicCount || 0) + (u.forumCategoryCount || 0);
    return total(b) - total(a);
  });

  return (
    <Card sx={{ mt: 4, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ForumIcon color="primary" fontSize="small" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Forum-Aktivität</Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ borderBottom: '2px solid rgba(255,255,255,0.08)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Benutzername</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Posts</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Antworten</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Themen</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Kategorien</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Gesamt</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Letzte Aktivität</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map(user => {
                const total = (user.forumPostCount || 0) + (user.forumAnswerCount || 0) + (user.forumTopicCount || 0) + (user.forumCategoryCount || 0);
                return (
                  <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' } }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{user.userName}</TableCell>
                    <TableCell align="center">{user.forumPostCount ?? 0}</TableCell>
                    <TableCell align="center">{user.forumAnswerCount ?? 0}</TableCell>
                    <TableCell align="center">{user.forumTopicCount ?? 0}</TableCell>
                    <TableCell align="center">{user.forumCategoryCount ?? 0}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{total}</TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {user.lastForumActivity ? convertTimestamp(user.lastForumActivity) : '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
