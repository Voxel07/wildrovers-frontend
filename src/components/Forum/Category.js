import React,{ useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

//MUI
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from '@mui/material/Typography';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import TopicIcon from '@mui/icons-material/Topic';
import Button from '@mui/material/Button';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GroupIcon from '@mui/icons-material/Group';
import Modal from '@mui/material/Modal';

//Eigene
import Topic from "./Topic"
import AddTopic from './AddTopic';
import { convertTimestamp } from '../../helper/converter';
export default function Category(props) {
  const [open, setOpen] = React.useState(false);
  const [topics, setTopics] = useState([]);
  const handleOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };
  const [category, setCategory] = useState({category:null, id: null, userName :null, creationDate: null,topicCount:null,visibility:null });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    if(!!props.vals)
    {
      axios.get("https://localhost/forum/topic",
      {
        params:{category:props.vals.id}
      })
      .then(response => {
        setTopics(response.data);
      })
      .catch(error=>{
        console.log(error)
      })
        setCategory(props.vals);
    }

    return () => {
      console.log("Category unmounted");
    }

  }, [])

  function redirectToCategory (){
    //Disable redirect if we are on the category page
    if(!location.pathname.includes("Forum/Category"))
    {
      navigate("/Forum/Category/"+props.vals.id)
    }
  }

   return (
    // <div>asd</div>
  <Accordion key={Math.random()} defaultExpanded={true} >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel1a-content"
      id="panel1a-header"
      >
      <Grid container direction="row" alignItems="center">
        <Grid item xs={2}>
          <Typography variant="h5" component="h2"  onClick={redirectToCategory}>{category.category}</Typography>
        </Grid>
        <Grid item xs={10}> {/*Stats*/}
            <Grid container direction="row" justifyContent="flex-start"  alignItems="center" colomnspacing={1}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Ersteller" placement="top-end">
                  <Chip icon={<PersonOutlineIcon/>} label={category.userName} variant="outlined" />
              </Tooltip>
              <Tooltip title="Erstellungsdatum" placement="top-end">
              <Chip icon={<EventNoteIcon/>} label={convertTimestamp(category.creationDate)} variant="outlined" />
              </Tooltip>
              <Tooltip title="Themen" placement="top-end">
                  <Chip icon={<TopicIcon/>} label={category.topicCount} variant="outlined" />
              </Tooltip>
              <Tooltip title="Wer darf das sehen" placement="top-end">
                  <Chip icon={<GroupIcon/>} label={category.visibility} variant="outlined" />
              </Tooltip>
              </Stack>
            </Grid>
        </Grid>
      </Grid>

    </AccordionSummary>
    <Divider  />
    <AccordionDetails>
    {
      topics.length ? topics.map(topic => <Topic topic={topic}/>)
      : <div>In dieser Kategorie gibt es noch keine Themen</div>
    }
    </AccordionDetails>
    <Button variant="outlined" size="small" startIcon={<AddCircleOutlineOutlinedIcon />} sx={{margin: 1}} onClick={handleOpen}>Thema hinzufügen</Button>
    <Modal
            disableScrollLock
            open={open}
            onClose={handleClose}
        >
          <AddTopic callback={handleClose} topics={topics}  category={{id:category.id,name:category}} />
        </Modal>
  </Accordion>
  )
}
