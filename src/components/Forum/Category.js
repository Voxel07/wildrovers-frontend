import React from 'react'

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from '@mui/material/Typography';

import Button from '@mui/material/Button';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';

import Topic from "./Topic"


function fetchTopics(){
  return[
      {
          name: "Allgemein",
          desc:"hier steht um was es geht",
          views: "250K",
          themen: "50",
          id: Math.random()
      },
      {
        name: "Allgemein",
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
      <Typography>{props.categoryNames.name}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      {
        topics.length ? topics.map(topic => <Topic topic={topic}/>) : null
      }
    </AccordionDetails>
    <Button variant="outlined" size="small" startIcon={<AddCircleOutlineOutlinedIcon />} sx={{margin: 1}}>Thema hinzufügen</Button>
  </Accordion>
  )
}
