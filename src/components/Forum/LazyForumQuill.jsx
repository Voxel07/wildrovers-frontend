import { lazy, Suspense, forwardRef } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Quill is only downloaded when an editor is actually shown.
const ForumQuill = lazy(() => import('./ForumQuill'));

const LazyForumQuill = forwardRef(function LazyForumQuill(props, ref) {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, height: props.height }}>
          <CircularProgress size={24} />
        </Box>
      }
    >
      <ForumQuill ref={ref} {...props} />
    </Suspense>
  );
});

export default LazyForumQuill;
