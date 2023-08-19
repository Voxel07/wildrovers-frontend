import React, {useEffect, useState} from 'react'
import { useParams,  } from 'react-router-dom'
import { history } from '../../helper/history';

import axios from 'axios';

//Mui
import { Grid } from '@mui/material';
import { PostAddSharp } from '@material-ui/icons';

//eigene
import Post from '../../components/Forum/Post';
import Answer from '../../components/Forum/Answer';

export default function Forum_Post() {
    const {id} = useParams();
    const [post, setPost] = useState([]);
    const [answers, setAnswers] = useState([]);
    const name = Math.random();
    history.replace({pathname: `/Forum/Post/`+id+'/'+name})

    useEffect(() => {
      axios.get("http://localhost:8080/forum/post",{params:{post:id}})
      .then(response =>{
        console.log(response);
        setPost(response.data);
      })
      .catch(error=>{
        console.log(error)
      })
      console.log(post.length)
      if(post.length == 0) { console.log("war null"); return}
      axios.get("http://localhost:8080/forum/answer",{params:{post:id}})
      .then(response =>{
        console.log(response);
        setAnswers(response.data);
      })
      .catch(error=>{
        console.log(error)
      })


      return () => {

      }
    }, [])

  return (
    <Grid container direction="column" justifyContent="center" alignItems="center" key={post.id}
    sx={{bgcolor:"red"}}
    >
      <Grid item xs={12}>
        {
          post.length ? <Post post={post}/> : <div>Dieser Post exestiert nicht</div>
        }
      </Grid>
      <Grid item>
        {
          answers.length ? answers.map(answer => <Answer answer={answer}/>) : <div>Noch keine Antowrten</div>
        }
      </Grid>


    </Grid>



  )
}
