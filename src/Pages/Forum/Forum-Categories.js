import React, { useState, useEffect } from 'react';
import axios from 'axios'

//Routing
import { useParams,  } from 'react-router-dom'
import { history } from '../../helper/history';

//Mui
import Container from '@mui/material/Container';

//Eigene
import Category from '../../components/Forum/Category';


export default function Forum_Categories(){
    const {id} = useParams();
    const [category, setCategory] = useState([]);

    //get the category
    useEffect(() => {
        axios.get("http://localhost:8080/forum/category",{params:{categoryId:id}})
        .then(response => {
            setCategory(response.data)
            history.replace({pathname: `/Forum/Category/`+id+'/'+response.data[0].category})
        })
        .catch(err =>{
            console.log(err);
        })
    },[]);

  return (
    <Container className='categories-container' maxWidth="xl"
    key={id}
    sx={{
        backgroundColor : "black",
        padding: 0
    }}>
    {category.length ? category.map(category => <Category vals={category}/>): <div>Kategorie exestiert nicht</div>}

    </Container>

  )

}

