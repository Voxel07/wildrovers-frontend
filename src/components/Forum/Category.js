import React from 'react'

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
import Topic from "./Topic"
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EventNoteIcon from '@mui/icons-material/EventNote';


function fetchTopics(){
  return[
      {
          name: "Vorstellung Team",
          desc:"hier steht um was es geht",
          views: "250K",
          themen: "50",
          id: Math.random()
      },
      {
        name: "Vorstellung Einzelperson",
        desc:"hier steht um was es geht",
        views: "250K",
        themen: "50",
        id: Math.random()
    }
  ];
}

export default function Category(props) {
  const topics = fetchTopics();
  return (
  <Accordion defaultExpanded={true} key={props.id}>
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel1a-content"
      id="panel1a-header"
      >
      <Grid container direction="row" alignItems="center">
        <Grid item xs={2}>
          <Typography variant="h5" component="h2">{props.categoryNames.name}</Typography>
        </Grid>
        <Grid item xs={10}> {/*Stats*/}
            <Grid container direction="row" justifyContent="flex-start"  alignItems="center" colomnSpacing={1}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Ersteller" placement="top-end">
                  <Chip icon={<PersonOutlineIcon/>} label={"Ersteller"} variant="outlined" />
              </Tooltip>
              <Tooltip title="Erstellungsdatum" placement="top-end">
              <Chip icon={<EventNoteIcon/>} label={"01.01.1990"} variant="outlined" />
              </Tooltip>
              <Tooltip title="Themen" placement="top-end">
                  <Chip icon={<TopicIcon/>} label={"Themen"} variant="outlined" />
              </Tooltip>
              </Stack>
            </Grid>
        </Grid>
      </Grid>

    </AccordionSummary>
    <Divider  />
    <AccordionDetails>
      {
        topics.length ? topics.map(topic => <Topic topic={topic}/>) : null
      }
    </AccordionDetails>
    <Button variant="outlined" size="small" startIcon={<AddCircleOutlineOutlinedIcon />} sx={{margin: 1}}>Thema hinzufügen</Button>
  </Accordion>
  )
}
