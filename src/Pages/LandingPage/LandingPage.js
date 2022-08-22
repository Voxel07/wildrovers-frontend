import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Grid from '@material-ui/core/Grid';

export default function LandingPage() {
  return (
    <Grid container direction="column" alignItems="center" rowSpacing={12}>
        <Grid item sx={{
            margin: 5
        }}>
            <Typography variant="h5" component="h2">LandingPage</Typography>

        </Grid>
        <Grid item xs={2} >
            <Stack spacing={1}>
                {/* For variant="text", adjust the height via font-size */}
                <Skeleton variant="text" sx={{ fontSize: '2rem', bgcolor: 'grey.400' }} />
                {/* For other variants, adjust the size with `width` and `height` */}
                <Skeleton variant="circular" width={50} height={50}  sx={{ bgcolor: 'grey.400' }}/>
                <Skeleton variant="rectangular" width={210} height={60}  sx={{ bgcolor: 'grey.400' }}/>
                <Skeleton variant="rounded" width={210} height={60}  sx={{ bgcolor: 'grey.400' }}/>
            </Stack>
        </Grid>
    </Grid>
  );
}
