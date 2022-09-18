import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';

import Posts from '../../components/Forum/Posts';
import Typography from '@mui/material/Typography';
import axios from 'axios'
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
function getPosts(){
    // axios.get("http://localhost:8080/company", { params: { ctrId: this.state.id } })
    // .then(response => {
    //     this.setState({ companyName: response.data[0].name, companyId: response.data[0].id })
    // })
    // .catch(error => {
    // })
    return[
        {
            name: "Allgemein",
            id: "1"
        },
        {
            name: "Intern",
            id: "2"
        },
        {
            name: "Sponsor",
            id: "3"
        }
    ]
 }

export default function Forum_Topic(){
    let categories= getPosts();
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
          <Typography variant="h5" component="h2">Allgemein</Typography>
        </Grid>
        <Grid item xs={7}>{/*Stats */}
            <Grid container direction="row" justifyContent="flex-start"  alignItems="center">
              <Stack direction="row" spacing={1}>
                <Tooltip title="Ersteller" placement="top-end">
                    <Chip icon={<PersonOutlineIcon/>} label={"Ersteller"} variant="outlined" />
                </Tooltip>
                <Tooltip title="Erstellungsdatum" placement="top-end">
                <Chip icon={<EventNoteIcon/>} label={"01.01.1990"} variant="outlined" />
                </Tooltip>
                <Tooltip title="Posts" placement="top-end">
                    <Chip icon={<ForumIcon/>} label={"150"} variant="outlined" />
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
    <Posts />
    </AccordionDetails>

  </Accordion>


      </Container>
    )
}