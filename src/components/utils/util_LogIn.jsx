//Doesent work for some reason.
/**
 * Hooks can only be called form the Body of a functional component.
 */
import {useState} from "react"
import api from '../../helper/api';

//eigene
import { saveJWT } from "./saveJWT";

const LogIn = async(vals) =>{


    const [state, setState] = useState({ statusCode: null, data: null });


    await api.post('/user/login',
    {
       userName: vals.username,
       password: vals.password,
    })
    .then(response => {//handle code 200
        saveJWT(response.data);
        setState({statusCode:response.status, data:response.data})

    })
    .catch(error => {//handle codes over 400
        setState({statusCode:error.response.status, data:error.response.data})

    });
    return state;
};

export default LogIn;
