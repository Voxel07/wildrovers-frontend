import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'

//Mui
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Typography from '@mui/material/Typography';
import { red } from '@material-ui/core/colors';
import Modal from '@mui/material/Modal';

//Eigene
import './Forum-Categories.css';
import Category from '../../components/Forum/Category';
import AddCategory from '../../components/Forum/AddCategory';
import Skeleton_Category from '../../components/Forum/Skeleton_Category';

import { AlertsManager} from '../../components/utils/AlertsManager';

const Forum = () => {
    const alertsManagerRef = useRef();
    const [categories, setCategories] = useState([]);
    const [loading, setloading] = useState();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => { setOpen(true); };
    const handleClose = () => { setOpen(false); };
    const [updateData, setUpdateData] = useState(false);
    const handleUpdate = () =>
    {
      console.log("test")
      setUpdateData(true)
    }
    //get all categories
    useEffect(() => {
        setloading(true);

        axios.get("https://localhost/forum/category")
        .then(response => {
            setCategories(response.data)
            setloading(false);

        })
        .catch(err =>{
            console.log(err);
        })

    },[updateData]);

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
          <AddCategory onAddCategory={handleUpdate} callback={handleClose} cat={categories} />
        </Modal>
        <button onClick={() => {alertsManagerRef.current.showAlert('success', 'Erfolg!')}}>Zeige Erfolg</button>
        <button onClick={() => {alertsManagerRef.current.showAlert('warning', 'Warnung!')}}>Zeige Warnung</button>
        <button onClick={() => {alertsManagerRef.current.showAlert('info', 'Info!')}}>Zeige Info</button>
        <button onClick={() => {alertsManagerRef.current.showAlert('error', 'Fehler!')}}>Zeige Fehler</button>
        <AlertsManager ref={alertsManagerRef} />
        {
            categories.length ? categories.map((category, index) => <Category key={index} currentIndex ={index} vals={category}/>)
            :
            loading? <Skeleton_Category /> : <Typography sx={{ color:red[500] }}>Keine Daten erhalten</Typography>
        }
        </Container>


    )
}

export default Forum;