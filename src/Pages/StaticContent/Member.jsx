import React from 'react'
import Tilt from 'react-parallax-tilt';
import { Box } from '@mui/material';

export default function Member() {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
        <Box>
        <Tilt style={{scale:2}}>
            <div style={{ height: '300px', background: "linear-gradient(#e66465, #9198e5)" , glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red', scale:2}}>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Box>
                        <h1>React Parallax Tilt 👀</h1>
                    </Box>
                    <Box sx={{ position: 'relative', justifySelf: 'flex-end' }}>
                        <h1>Matze</h1>
                    </Box>
                </Box>
            </div>
        </Tilt>
        </Box>
        <Box>
        <Tilt>
            <div style={{ height: '300px', backgroundColor: 'gray', glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red'}}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box>
                        <h1>React Parallax Tilt 👀</h1>
                    </Box>
                </Box>
            </div>
        </Tilt>
        </Box>
        <Box>
        <Tilt>
            <div style={{ height: '300px', backgroundColor: 'gray', glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red'}}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box>
                        <h1>React Parallax Tilt 👀</h1>
                    </Box>
                </Box>
            </div>
        </Tilt>
        </Box>
        <Box>
        <Tilt>
            <div style={{ height: '300px', backgroundColor: 'gray', glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red'}}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box>
                        <h1>React Parallax Tilt 👀</h1>
                    </Box>
                </Box>
            </div>
        </Tilt>
        </Box>
        <Box>
        <Tilt>
            <div style={{ height: '300px', backgroundColor: 'gray', glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red'}}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box>
                        <h1>React Parallax Tilt 👀</h1>
                    </Box>
                </Box>
            </div>
        </Tilt>
        </Box>
        <Box>
        <Tilt>
            <div style={{ height: '300px', backgroundColor: 'gray', glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red'}}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box>
                        <h1>React Parallax Tilt 👀</h1>
                    </Box>
                </Box>
            </div>
        </Tilt>
        </Box>
        <Box>
        <Tilt>
            <div style={{ height: '300px', backgroundColor: 'gray', glareEnable: true , glareColor: 'red', tiltMaxAngleX : 1, tiltMaxAngleY: 1, borderRadius: 10, border: 'solid 2px red'}}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box>
                        <h1>React Parallax Tilt 👀</h1>
                    </Box>
                </Box>
            </div>
        </Tilt>
        </Box>

        <Box> </Box>
    </Box>
  );
}
