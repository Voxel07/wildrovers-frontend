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
        <Grid item >
            <Stack spacing={1} alignItems="center">
                {/* For variant="text", adjust the height via font-size */}
                <Skeleton variant="rectangular" width="100vh" height={80}  sx={{ bgcolor: 'grey.400', borderRadius:2 }}/>

                {/* For other variants, adjust the size with `width` and `height` */}
                <Skeleton variant="rectangular" width="95vh"  height={40}  sx={{ bgcolor: 'grey.400',}}/>
                <Skeleton variant="rectangular" width="95vh"  height={40}  sx={{ bgcolor: 'grey.400' }}/>
                <Skeleton variant="rectangular" width="95vh"  height={40}  sx={{ bgcolor: 'grey.400' }}/>
                <Skeleton variant="rectangular" width="95vh"  height={40}  sx={{ bgcolor: 'grey.400' }}/>
                <Skeleton variant="rectangular" width="95vh"  height={40}  sx={{ bgcolor: 'grey.400' }}/>

            </Stack>
        </Grid>
    </Grid>
  );
}
