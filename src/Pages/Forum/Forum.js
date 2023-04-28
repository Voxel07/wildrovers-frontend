import React, { useState, useEffect, useContext  } from 'react';
import axios from 'axios'

//Mui
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Typography from '@mui/material/Typography';
import { red } from '@material-ui/core/colors';
import Modal from '@mui/material/Modal';

//Table sorting
import { TableRow, TableCell, TableSortLabel, TableHead } from '@mui/material';

//Eigene
import './Forum-Categories.css';
import Category from '../../components/Forum/Category';
import AddCategory from '../../components/Forum/AddCategory';
import Skeleton_Category from '../../components/Forum/Skeleton_Category';

import { AlertsContext } from '../../components/utils/AlertsManager';

const Forum = () => {
    const alertsManagerRef = useContext(AlertsContext);
    const [categories, setCategories] = useState([]);
    const [loading, setloading] = useState();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => { setOpen(true); };
    const handleClose = () => { setOpen(false); };
    const [updateData, setUpdateData] = useState(false);
    const [sort, setSort] = useState({ field: "name", direction: "asc" });
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

    const handleDelete = (props) =>{
        alertsManagerRef.current.showAlert('info', "remove that shit");
        setCategories((prevCategories) => {
            // Filter out the element with the specified id
            const updatedCategories = prevCategories.filter(category => category.id !== props.id);

            // Return the updated categories array
            console.log(updatedCategories);
            return updatedCategories;
        });
    }

    const handleEdit = (props) =>{
        alertsManagerRef.current.showAlert('info', "edit that shit " + props.category);
        setCategories((prevCategories) => {
            // Filter out the element with the specified id
            const updatedCategories = prevCategories.filter(category => category.id !== props.id);

            // Return the updated categories array
            console.log(updatedCategories);
            return updatedCategories;
        });

    }

    const sortedCategories = categories.sort((a, b) => {
        const fieldA = a[sort.field];
        const fieldB = b[sort.field];
        const comparison = fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
        return sort.position === "asc" ? comparison : -comparison;
      });

      const categoryComponents = sortedCategories.map((category, index) => (
        <Category
          key={category.id}
          currentIndex={index}
          vals={category}
          editCallback={handleEdit}
          deleteCallback={handleDelete}
        />
      ));
      const handleSort = (field) => {
        const newDirection = sort.direction === "asc" ? "desc" : "asc";
        setSort({ field, direction: newDirection });
      };

    return(

        <Container className='categories-container' maxWidth="xl"
        sx={{
            backgroundColor : "black",
            padding: 0
        }}>
        <Button startIcon={<AddCircleOutlineOutlinedIcon />} onClick={handleOpen}>Kategorie hinzufügen</Button>
        <TableHead>
            <TableRow>
            <TableCell>
                <TableSortLabel onClick={() => handleSort("position")}>
                  <Typography style={{color : "white"}}>  Position</Typography>
                </TableSortLabel>
                </TableCell>
                <TableCell>
                <TableSortLabel onClick={() => handleSort("category")}>
                  <Typography style={{color : "white"}}>  Name</Typography>
                </TableSortLabel>
                </TableCell>
                <TableCell>
                <TableSortLabel onClick={() => handleSort("creator")}>
                  <Typography style={{color : "white"}}>  Ersteller</Typography>
                </TableSortLabel>
                </TableCell>
                <TableCell>
                <TableSortLabel onClick={() => handleSort("creationDate")}>
                <Typography style={{color : "white"}}>  Creation Date</Typography>
                </TableSortLabel>
                </TableCell>
                <TableCell>
                <TableSortLabel onClick={() => handleSort("topicCount")}>
                <Typography style={{color : "white"}}>   Number of Replies</Typography>
                </TableSortLabel>
                </TableCell>
                <TableCell>
                <TableSortLabel onClick={() => handleSort("visibility")}>
                <Typography style={{color : "white"}}>   Visib</Typography>
                </TableSortLabel>
                </TableCell>
            </TableRow>
        </TableHead>

        <Modal
            disableScrollLock
            open={open}
            onClose={handleClose}
        >
          <AddCategory onAddCategory={handleUpdate} callback={handleClose} aviableCategories={categories} />
        </Modal>
        {
            categories.length ? categoryComponents
            :
            loading? <Skeleton_Category /> : <Typography sx={{ color:red[500] }}>Keine Daten erhalten</Typography>
        }
        </Container>


    )
}

export default Forum;