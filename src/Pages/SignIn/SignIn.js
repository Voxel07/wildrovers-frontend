import React from 'react'
import axios from 'axios'

import Button from '@material-ui/core/Button'
import { TextField } from '@material-ui/core';

// function sendData() {
//     axios.post("http://localhost:8080/user/login",)
// }



const SignIn = () => {

    function handleSubmit(tmp) {
        console.log(tmp);
    }

    return (
        <div>
            <div>
                <TextField id="outlined-basic" label="Username or Email" variant="outlined" />
            </div>
            <div>
                <TextField id="outlined-basic" label="Passwort" variant="outlined" />
            </div>
            <div>
                <Button varian="contained" color="secondary" onClick={() => handleSubmit("Rüdiger")}>LogIn</Button>
            </div>

        </div>
    )
}

export default SignIn
