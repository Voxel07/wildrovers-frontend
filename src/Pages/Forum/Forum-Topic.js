import React, {useEffect, useState} from 'react'
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Post from '../../components/Forum/Posts';
import Typography from '@mui/material/Typography';
import { red } from '@material-ui/core/colors';
import Box from '@mui/material/Box';
import Grid from '@material-ui/core/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ForumIcon from '@mui/icons-material/Forum';
import EventNoteIcon from '@mui/icons-material/EventNote';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Alert } from '@material-ui/core';

//eigene
import { convertTimestamp } from '../../helper/converter';

export default function Forum_Topic(){
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const {id} = useParams();

  useEffect(() => {

    axios.get("http://localhost:8080/forum/post",{params:{topic:id}})
    .then(response =>{
      console.log(response);
      setPosts(response.data);
    })
    .catch(error=>{
      console.log(error)
    })

    axios.get("http://localhost:8080/forum/topic",{params:{topicId:id}})
    .then(response =>{
      console.log(response);
      setTopics(response.data[0]);
    })
    .catch(error=>{
      console.log(error)
    })

    return () => {
      console.log("Topic unmounted")
    }
  }, [])

    const {topic, postCount, creationDate, creator} = topics;
    return (
      <Container className='posts-container' maxWidth="xl"
      sx={{
          backgroundColor : "black",
          padding: 0
      }}>

        <Accordion expanded>
    <AccordionSummary
      // expandIcon={<ExpandMoreIcon />}
      aria-controls="panel1a-content"
      id="panel1a-header"
      >
      <Grid container direction="row" alignItems="center" justifyContent="space-between">
        <Grid item xs={2}>
          <Typography variant="h5" component="h2">{topic}</Typography>
        </Grid>
        <Grid item xs={7}>{/*Stats */}
            <Grid container direction="row" justifyContent="flex-start"  alignItems="center">
              <Stack direction="row" spacing={1}>
                <Tooltip title="Ersteller" placement="top-end">
                    <Chip icon={<PersonOutlineIcon/>} label={creator} variant="outlined" />
                </Tooltip>
                <Tooltip title="Erstellungsdatum" placement="top-end">
                <Chip icon={<EventNoteIcon/>} label={convertTimestamp(creationDate)} variant="outlined" />
                </Tooltip>
                <Tooltip title="Posts" placement="top-end">
                    <Chip icon={<ForumIcon/>} label={postCount} variant="outlined" />
                </Tooltip>
                </Stack>
            </Grid>
        </Grid>
        <Grid item xs={3}> {/*Feedback*/}
          <Stack alignItems='right'>
            <Alert severity='success'>Post erfolgreich hinzugefügt</Alert>
          </Stack>
        </Grid>

      </Grid>

    </AccordionSummary>
    <Divider  />
    <AccordionDetails>
      {posts.length?<Post posts={posts} />:<div>Keine Daten erhalten</div>}
    </AccordionDetails>

  </Accordion>


      </Container>
    )
}