import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Grid from '@mui/material/Grid';

export default function Skeleton_Category() {
  return (
    <Grid container direction="column" sx={{ alignItems: 'center' }} rowSpacing={12}>
        <Grid>
            <Stack spacing={1} sx={{ alignItems: 'center' }}>
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
