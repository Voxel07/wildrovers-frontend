import React, { useState, useEffect } from 'react';
import axios from 'axios'

//Mui
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Typography from '@mui/material/Typography';
import { red } from '@material-ui/core/colors';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

//Eigene
import './Forum-Categories.css';
import Category from '../../components/Forum/Category';
import AddCategory from '../../components/Forum/AddCategory';



const Forum_Categories= () => {
    const [requestResponseText, setRequestResponseText] = useState();
    const [requestResponseCode, setRequestResponseCode] = useState();
    const [categories, setCategories] = useState([]);
    const [loading, setloading] = useState();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => { setOpen(true); };
    const handleClose = () => { setOpen(false); };

    //get all categories
    useEffect(() => {
        axios.get("https://localhost/forum/category")
        .then(response => {
            console.log(response.data)
            setCategories(response.data)
            // setloading(true)
        })
        .catch(err =>{
            console.log(err);
        })

    },[]);


    return(
        <Container className='categories-container' maxWidth="xl"
        sx={{
            backgroundColor : "black",
            padding: 0
        }}>
        <Button startIcon={<AddCircleOutlineOutlinedIcon />} onClick={handleOpen}>Kategorie hinzufügen</Button>
        <Modal
            disableScrollLock
            open={open}
            onClose={handleClose}
        >
          <AddCategory callback={handleClose} cat={categories} />
        </Modal>
        {
            categories.length ? categories.map(category => <Category vals={category}/>)
            : <Typography sx={{ color:red[500] }}>Keine Daten erhalten</Typography>
        }
        </Container>
    )
}

export default Forum_Categories;