import React from 'react'
import axios from 'axios'
import { useState } from 'react';
import Button from '@material-ui/core/Button'
import { TextField } from '@material-ui/core';

export function SignIn(props) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    function handleSubmit(e) {
        e.preventDefault()
        const postData = {
            username,
            password
        };

        axios.post('http://localhost:8080/user', postData)
            .then(response => {
                console.log(response)
            })
            .catch(error => {
                // this.setState({errorMsg: 'Keine Daten erhalten'})
            })
    }

    return (
        <div>
            <div>
                <TextField id="outlined-basic" label="Username or Email" variant="outlined" id="margin-normal" margin="normal" />
            </div>
            <div>
                <TextField id="outlined-basic" label="Passwort" variant="outlined" type="password" id="margin-normal" margin="normal" />
            </div>
            <div>
                <Button varian="contained" onClick={() => handleSubmit()}>LogIn</Button>
            </div>

        </div>
    )
}

export default SignIn
