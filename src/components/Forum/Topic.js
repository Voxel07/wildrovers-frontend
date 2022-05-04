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
const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    color: theme.palette.text.secondary
  }));

  export default function Topic (props) {
    const topic = props.topic;
    return (
      <Box  sx={{ flexGrow: 1 }}>
    <Grid key={topic.id} container spacing={{xs:0, md:1}} direction="row" justifyContent="flex-start"
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
            <ListItemText primary={topic.name} secondary={topic.id} />
          </ListItem>
        </List>
      </Grid>
      <Grid item xs={2} md={2} lg={2} > {/*Stats*/}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Themen" placement="top-end">
              <Chip icon={<TopicIcon/>} label={topic.themen} variant="outlined" />
          </Tooltip>
          <Tooltip title="Aufrufe" placement="top-end">
          <Chip icon={<VisibilityIcon/>} label={topic.views} variant="outlined" />
          </Tooltip>
        </Stack>
      </Grid>
      <Grid item xs={1} md={2} lg={2} alignItems="center" sx={{textAlign: "center"}}>
      asdasdasd      asdasdasd      asdasdasd      asdasdasd
      </Grid>
    </Grid>
      <Divider variant="inset" />
    </Box>
    )
}
