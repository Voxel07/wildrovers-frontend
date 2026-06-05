import React from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

export default function ForumBreadcrumbs({ categoryId, categoryName, topicId, topicName, postTitle }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{
          color: 'text.secondary',
          '& .MuiBreadcrumbs-separator': {
            mx: 0.5,
            color: 'rgba(255, 255, 255, 0.3)'
          }
        }}
      >
        <Link 
          component={RouterLink} 
          underline="hover" 
          color="inherit" 
          to="/Forum"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            '&:hover': { color: 'primary.main' }
          }}
        >
          <HomeIcon fontSize="inherit" />
          Forum
        </Link>
        {categoryId && categoryName && (
          topicId ? (
            <Link 
              component={RouterLink} 
              underline="hover" 
              color="inherit" 
              to={`/Forum/Category/${categoryId}`}
              sx={{ '&:hover': { color: 'primary.main' } }}
            >
              {categoryName}
            </Link>
          ) : (
            <Typography color="text.primary" sx={{ fontWeight: 500 }}>
              {categoryName}
            </Typography>
          )
        )}
        {topicId && topicName && (
          postTitle ? (
            <Link 
              component={RouterLink} 
              underline="hover" 
              color="inherit" 
              to={`/Forum/Topic/${topicId}`}
              sx={{ '&:hover': { color: 'primary.main' } }}
            >
              {topicName}
            </Link>
          ) : (
            <Typography color="text.primary" sx={{ fontWeight: 500 }}>
              {topicName}
            </Typography>
          )
        )}
        {postTitle && (
          <Typography color="text.primary" sx={{ fontWeight: 500, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {postTitle}
          </Typography>
        )}
      </Breadcrumbs>
    </Box>
  );
}
