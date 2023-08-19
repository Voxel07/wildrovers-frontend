import React, {useEffect, useState, useContext} from "react"
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Grid from '@material-ui/core/Grid';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { orange } from '@material-ui/core/colors';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TopicIcon from '@mui/icons-material/Topic';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { Typography } from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
//eigene
import { convertTimestamp } from '../../helper/converter';
import useAuth from '../../context/useAuth';
import { AlertsContext } from '../../components/utils/AlertsManager';

export default function Topic (props) {
  const{ auth } = useAuth();

  const navigate = useNavigate();
  const [post, setPost] = useState([]);
  const {topic, id, postCount, views, creationDate} = props.topic;
  const alertsManagerRef = useContext(AlertsContext);

  function redirectToTopic (){
    navigate("/Forum/Topic/"+props.topic.id);
  }

  function redirectToPost (){
    navigate("/Forum/Post/"+post.id);
  }

  function lastEntry(){
    // TODO: Get the Username
    return(
      <Grid container direction="column" onClick={redirectToPost}>
          <Typography>{post.title}</Typography>
          <Typography>Von Fix that</Typography>
          <Typography>{convertTimestamp(post.creationDate)}</Typography>
      </Grid>
    )
  }

  useEffect(() => {
    console.log("Topic mounted, fetching "+props.topic.id);
    if(postCount<1){
      return( <div>nope</div>)
    }
    axios.get("http://localhost/forum/post/latest:8080",{params:{topic:props.topic.id}})
    .then(response =>{
      console.log(response);
      setPost(response.data);
    })
    .catch(error=>{
      console.log(error)
    })

    return () => {
      console.log("Topic unmounted")
    }
  }, [])

  function handleDelete()
  {
    axios.delete('http://localhost:8080/forum/topic',
    {
      headers:{ Authorization: `Bearer ${auth.JWT}`},
      data:{ id: topic.id }

        }).then(
            response =>{
                alertsManagerRef.current.showAlert('success', 'Kategorie: '+ topic.topic +' Erfolgreich gelöscht');
                props.deleteCallback(topic)
            }
        )
        .catch(error=>{
            let resCode = error.response.status;
            let resData;

            if (resCode === 401) {
                resData = "Nicht angemeldet!";
            } else if (resCode === 403) {
                resData = "Du bist für diese Aktion nicht berechtigt";
            } else {
                resData = error.response.data;
            }
            alertsManagerRef.current.showAlert('error', resCode+ " " + resData);

        })
  }

  function handleEdit ()
  {
    props.editCallback(topic);
  }

  function  displayEditDelete()
  {
    if(auth.user === topic.creator || auth.roles === "Admin")
    {
      return(
        <Grid item xs={1}>
          <Grid container direction="row" justifyContent="center"  alignItems="center" colomnspacing={1}>{/*Edit and Delete*/}
            <Stack  direction="row" spacing={1}>
              <Tooltip title="Kategorie editieren" placement="top-end" onClick={handleEdit}>
                  <EditIcon/>
              </Tooltip>
              <Tooltip title="Kategorie löschen" placement="top-end" onClick={handleDelete}>
                  <DeleteForeverIcon/>
              </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        )
    }
    else
    {
      return null;
    }
  }

  return (
  <Box key={Math.random()} sx={{ flexGrow: 1 }}>
  <Grid container spacing={{xs:0, md:1}} direction="row" justifyContent="flex-start"
  alignItems="center"  columns={{sx:8, md:8, lg:12}}
  >
    <Grid item xs={4} md={4} lg={8}> {/*Name*/}
      <List
        sx={{
        maxHeight: '50px',
      }}>
        <ListItem>
          <ListItemIcon>
              <LibraryBooksIcon sx={{ color:orange[500] }} fontSize="large" />
          </ListItemIcon>
          <ListItemText onClick={redirectToTopic} primary={topic} secondary={convertTimestamp(creationDate)} />
        </ListItem>
      </List>
    </Grid>
    <Grid item xs={2} md={2} lg={2} > {/*Stats*/}
      <Stack direction="row" spacing={1}>
        <Tooltip title="Posts" placement="top-end">
            <Chip icon={<TopicIcon/>} label={postCount} variant="outlined" />
        </Tooltip>
        <Tooltip title="Aufrufe" placement="top-end">
        <Chip icon={<VisibilityIcon/>} label={views} variant="outlined" />
        </Tooltip>
      </Stack>
    </Grid>
    <Grid item xs={1} md={2} lg={2} alignItems="center" sx={{textAlign: "center"}}>
    {
      !!post.title ? lastEntry(post) :<div>Noch keine Posts enthalten</div>
    }
    </Grid>
    {
      displayEditDelete()
    }
  </Grid>
    <Divider variant="inset" />
  </Box>
  )
}
