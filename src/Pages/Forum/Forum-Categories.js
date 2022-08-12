import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import './Forum-Categories.css';
import Category from '../../components/Forum/Category';
import Typography from '@mui/material/Typography';
import axios from 'axios'
import { red } from '@material-ui/core/colors';

import AddCategory from '../../components/Forum/AddCategory';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';


export default function Forum_Categories()
{
    const [requestResponseText, setRequestResponseText] = useState();
    const [requestResponseCode, setRequestResponseCode] = useState();
    const [categories, setCategories] = useState();
    const [loading, setloading] = useState();

    function GetCategories(){
        useEffect(() => {
            axios.get("http://localhost:8080/forum/category")
            .then(response => {
                console.log(response.data)
                setCategories(response.data)
                setloading(true)
            })
        }, []);
    }

    GetCategories();
    return(
        <Container className='categories-container' maxWidth="xl"
        sx={{
            backgroundColor : "black",
            padding: 0
        }}>
        <AddCategory possibleCategorys={categories}></AddCategory>

        {loading ?
            categories.length ? categories.map(category => <Category categoryNames={category}/>)
            : <Typography sx={{ color:red[500] }}>Keine Daten erhalten</Typography> :null
        }
        <div>

        <AddCategory></AddCategory>

        </div>
        </Container>
    )
}