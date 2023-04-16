import React,{ useMemo, useState, useEffect } from 'react'
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
// Icons
import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GroupIcon from '@mui/icons-material/Group';
import Modal from '@mui/material/Modal';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
//Eigene
import Topic from "./Topic"
import AddTopic from './AddTopic';

// Context and Auth
import { convertTimestamp, formatNumber } from '../../helper/converter';
import { UserContext } from '../../context/UserContext';
import useAuth from '../../context/useAuth';

export default function Category(props) {

  const{ auth } = useAuth();

  const [user, setUser] = useState({valid:false, name:"", role:"", jwt:""});
  const stateValue = useMemo(() => ({ user, setUser }), [user, setUser]);
  const [state, setState] = useState({ resCode: null, resData: null });
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const handleOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };
  const [category, setCategory] = useState({category:null, id: null, creator :null, creationDate: null,topicCount:null,visibility:null });
  const navigate = useNavigate();
  const location = useLocation();
  // const [updateData, setUpdateData] = useState(false);
  // const handleUpdate = () =>
  // {
  //   console.log("test")
  //  setUpdateData(true)
  // }
  const [expandAccordion, setexpandAccordion] = useState(false);

  useEffect(() => {
    if (props.currentIndex === 0)
    {
      setexpandAccordion(true);
    }
  }, [props.currentIndex]);

  const handleExpandClick = () => {
    setexpandAccordion(!expandAccordion);
  };

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
        // setUpdateData(false);
    }

    return () => {
      console.log("Category unmounted");
    }

  // }, [updateData])
  }, [])

  function redirectToCategory (){
    //Disable redirect if we are on the category page
    if(!location.pathname.includes("Forum/Category"))
    {
      navigate("/Forum/Category/"+props.vals.id);
    }
  }

  function handleDelete()
  {
    axios.delete('https://localhost/forum/category',
        {
            id:category.id
        },
        {
            headers:{ Authorization: `Bearer ${auth.JWT}`}
        }).then(
            response =>{
                setState({resCode: response.status, resData: ""});
                props.callback();
                console.log("JAA")
                props.onAddCategory();
            }
        )
        .catch(error=>{
            console.log(error.response.data)
            let resCode = error.response.status;
            let resData;

            if (resCode === 401) {
                resData = "Nicht angemeldet!";
            } else if (resCode === 403) {
                resData = "Du bist für diese Aktion nicht berechtigt";
            } else {
                resData = error.response.data;
            }

            setState({ resCode, resData });
        })
    // console.log(category.id);
  }
  function handleEdit(id)
  {
    console.log("edit"+ id);

  }
   return (
    <UserContext.Provider value={stateValue}>
      {
        console.log(user)
      }
  <Accordion expanded={expandAccordion} >
    <AccordionSummary
      expandIcon={
        <IconButton disableRipple onClick={handleExpandClick}>
          <ExpandMoreIcon />
        </IconButton>
      }
      aria-controls="panel1a-content"
      id="panel1a-header"
      >
      <Grid container direction="row" alignItems="center">
        <Grid item xs={2}>
          <Typography variant="h5" component="h2"  onClick={redirectToCategory}>{category.category}</Typography>
        </Grid>
        <Grid item xs={9}> {/*Stats*/}
            <Grid container direction="row" justifyContent="flex-start"  alignItems="center" colomnspacing={1}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Ersteller" placement="top-end">
                <Chip icon={<PersonIcon/>} label={category.creator} variant="outlined" />
              </Tooltip>
              <Tooltip title="Erstellungsdatum" placement="top-end">
                <Chip icon={<EventNoteIcon/>} label={convertTimestamp(category.creationDate)} variant="outlined" />
              </Tooltip>
              <Tooltip title="Themen" placement="top-end">
                  <Chip icon={<TopicIcon/>} label={formatNumber(category.topicCount)} variant="outlined" />
              </Tooltip>
              <Tooltip title="Wer darf das sehen" placement="top-end">
                  <Chip icon={<GroupIcon/>} label={category.visibility} variant="outlined" />
              </Tooltip>
              </Stack>
            </Grid>
        </Grid>
        {
          // category.creator ==
        }
        <Grid item xs={1}>
          <Grid container direction="row" justifyContent="center"  alignItems="center" colomnspacing={1}>{/*Edit and Delete*/}
            <Stack  direction="row" spacing={1}>
              <Tooltip title="Kategorie editieren" placement="top-end" onClick={handleEdit} was = {category.id}>
                <EditIcon/>
              </Tooltip>
              <Tooltip title="Kategorie löschen" placement="top-end"  onClick={handleDelete} was = {category.id}>
                <DeleteForeverIcon/>
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
      : <Typography>In dieser Kategorie gibt es noch keine Themen</Typography>
    }
    </AccordionDetails>
    <Button variant="outlined" size="small" startIcon={<AddCircleOutlineOutlinedIcon />} sx={{margin: 1}} onClick={handleOpen}>Thema hinzufügen</Button>
    <Modal
            disableScrollLock
            open={open}
            onClose={handleClose}
        >
          <AddTopic callback={handleClose} topics={topics} category={{id:category.id,name:category}} />
        </Modal>
  </Accordion>
  </UserContext.Provider>
  )
}
