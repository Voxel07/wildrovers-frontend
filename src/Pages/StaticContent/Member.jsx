import React from 'react'
import Tilt from 'react-parallax-tilt';
import { Grid } from '@material-ui/core';
import { borderRadius } from '@material-ui/system';
import { border } from '@mui/system';
import { Margin, Scale } from '@mui/icons-material';

export default function Member() {
  return (
    <Grid container justifyContent="center" alignItems="center" spacing={5}>
        <Grid item>
        <Tilt style={{scale:2}}>
            <div style={{ height: '300px', background: "linear-gradient(#e66465, #9198e5)" , glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red', scale:2}}>
                <Grid container justifyContent="center" alignItems="center" direction={'column'}>
                    <Grid item >
                        <h1>React Parallax Tilt 👀</h1>
                    </Grid>
                    <Grid item position={'relative'} justifySelf={'flex-end'}>
                        <h1>Matze</h1>
                    </Grid>
                </Grid>
            </div>
        </Tilt>
        </Grid>
        <Grid item>
        <Tilt>
            <div style={{ height: '300px', backgroundColor: 'gray', glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red'}}>
                <Grid container justifyContent="center" alignItems="center" >
                    <Grid item >
                        <h1>React Parallax Tilt 👀</h1>
                    </Grid>
                </Grid>
            </div>
        </Tilt>
        </Grid>
        <Grid item>
        <Tilt>
            <div style={{ height: '300px', backgroundColor: 'gray', glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red'}}>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item >
                        <h1>React Parallax Tilt 👀</h1>
                    </Grid>
                </Grid>
            </div>
        </Tilt>
        </Grid>
        <Grid item>
        <Tilt>
            <div style={{ height: '300px', backgroundColor: 'gray', glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red'}}>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item >
                        <h1>React Parallax Tilt 👀</h1>
                    </Grid>
                </Grid>
            </div>
        </Tilt>
        </Grid>
        <Grid item>
        <Tilt>
            <div style={{ height: '300px', backgroundColor: 'gray', glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red'}}>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item >
                        <h1>React Parallax Tilt 👀</h1>
                    </Grid>
                </Grid>
            </div>
        </Tilt>
        </Grid>
        <Grid item>
        <Tilt>
            <div style={{ height: '300px', backgroundColor: 'gray', glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red'}}>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item >
                        <h1>React Parallax Tilt 👀</h1>
                    </Grid>
                </Grid>
            </div>
        </Tilt>
        </Grid>
        <Grid item>
        <Tilt>
            <div style={{ height: '300px', backgroundColor: 'gray', glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red'}}>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item >
                        <h1>React Parallax Tilt 👀</h1>
                    </Grid>
                </Grid>
            </div>
        </Tilt>
        </Grid>

        <Grid item> </Grid>
    </Grid>
  );
}
