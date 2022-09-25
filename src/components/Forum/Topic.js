import React, {useEffect, useState} from "react"
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

export default function Topic (props) {
  const navigate = useNavigate();
  const [post, setPost] = useState([]);
  const {topic, id, postCount, views, creationDate} = props.topic;

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
    axios.get("https://localhost/forum/post/latest",{params:{topic:props.topic.id}})
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

  function convertTimestamp(ts){
    let options = { year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return Intl.DateTimeFormat('de-DE',options).format(ts)
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
  </Grid>
    <Divider variant="inset" />
  </Box>
  )
}
