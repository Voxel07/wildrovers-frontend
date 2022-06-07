import * as React from 'react';
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


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };



function getCategories(){
    // axios.get("http://localhost:8080/company", { params: { ctrId: this.state.id } })
    // .then(response => {
    //     this.setState({ companyName: response.data[0].name, companyId: response.data[0].id })
    // })
    // .catch(error => {
    // })
    return[
        {
            name: "Allgemein",
            id: "1"
        },
        {
            name: "Intern",
            id: "2"
        },
        {
            name: "Sponsor",
            id: "3"
        }
    ]
}

export default function Forum_Categories(){
    let categories= getCategories();
    return (


        <Container className='categories-container' maxWidth="xl"
        sx={{
            backgroundColor : "black",
            padding: 0
        }}>
        <AddCategory></AddCategory>
        {
            categories.length ? categories.map(category => <Category categoryNames={category}/>)
            : <Typography sx={{ color:red[500] }}>Keine Daten erhalten</Typography>
        }
        <div>

        <AddCategory></AddCategory>

        </div>
        </Container>
    )
}