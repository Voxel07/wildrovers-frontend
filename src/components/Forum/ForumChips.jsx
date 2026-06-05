import React from 'react';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

export default function ForumChips({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <Stack
      direction="row"
      spacing={0}
      divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 0.75 }} />}
      sx={{
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        overflow: 'hidden',
        bgcolor: 'rgba(255, 255, 255, 0.01)',
        width: 'fit-content'
      }}
    >
      {items.map((item, idx) => (
        <Tooltip key={idx} title={item.tooltip || ''} placement="top">
          <Chip
            icon={item.icon}
            label={item.label}
            variant="standard"
            color={item.color || "default"}
            sx={{ border: 'none', borderRadius: 0, bgcolor: 'transparent', height: 32 }}
          />
        </Tooltip>
      ))}
    </Stack>
  );
}
