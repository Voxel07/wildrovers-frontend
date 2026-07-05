import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Divider } from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ForumIcon from '@mui/icons-material/Forum';
import { DataGrid } from '@mui/x-data-grid';

export default function ProfileActivitySummary({ profile, events = [] }) {
  const getVisitedEventsByYearBreakdown = () => {
    const countsByYear = {};
    events.forEach(event => {
      const isAttended = event.attendances?.some(a => a.userName === profile?.userName && a.status === 'YES');
      if (isAttended && event.eventDate) {
        const year = new Date(event.eventDate).getFullYear();
        countsByYear[year] = (countsByYear[year] || 0) + 1;
      }
    });
    return countsByYear;
  };

  const forumColumns = [
    { field: 'type', headerName: 'Typ', flex: 1, sortable: false },
    { field: 'count', headerName: 'Anzahl', width: 100, type: 'number', sortable: false },
  ];

  const forumRows = [
    { id: 1, type: 'Posts', count: profile.forumPostCount ?? 0 },
    { id: 2, type: 'Antworten', count: profile.forumAnswerCount ?? 0 },
    { id: 3, type: 'Themen', count: profile.forumTopicCount ?? 0 },
    { id: 4, type: 'Kategorien', count: profile.forumCategoryCount ?? 0 },
  ];

  return (
    <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Aktivitäten
        </Typography>

        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
              <WorkspacePremiumIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Besuchte Events
                </Typography>

                {(() => {
                  const breakdown = getVisitedEventsByYearBreakdown();
                  const years = Object.keys(breakdown).map(Number).sort((a, b) => b - a);
                  if (years.length === 0) return null;
                  return (
                    <Stack spacing={0.5} sx={{ mt: 1, pl: 0.5 }}>
                      {years.map(y => (
                        <Typography key={y} variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.78rem' }}>
                          {y}: <strong>{breakdown[y]}</strong> Event{breakdown[y] === 1 ? '' : 's'} besucht
                        </Typography>
                      ))}
                    </Stack>
                  );
                })()}
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Forum Activity */}
          <Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
              <ForumIcon color="action" />
              <Typography variant="caption" color="text.secondary" display="block">
                Forum-Aktivität
              </Typography>
            </Stack>
            <Box sx={{ width: '100%' }}>
              <DataGrid
                rows={forumRows}
                columns={forumColumns}
                hideFooter
                autoHeight
                rowHeight={35}
                columnHeaderHeight={0}
                disableColumnMenu
                disableSelectionOnClick
                sx={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  '& .MuiDataGrid-cell': {
                    borderColor: 'rgba(255, 255, 255, 0.04)',
                    color: 'text.secondary',
                    px: 1
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    display: 'none'
                  },
                  '& .MuiDataGrid-iconSeparator': {
                    display: 'none'
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: 'transparent'
                  }
                }}
              />
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
