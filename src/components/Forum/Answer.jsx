import React from 'react'
import { Grid } from '@mui/material';
import {Typography} from '@mui/material';

export default function Answer(props) {
  return (
    <Grid container key={props.answer.id}>
        <Grid item> {/*Header */}
            <Grid container>
                <Typography>props.</Typography>
                <Grid item>

                </Grid>
            </Grid>

        </Grid>
        <Grid item>
            <div>{JSON.stringify(props)}</div>
        </Grid>
    </Grid>
  )
}
