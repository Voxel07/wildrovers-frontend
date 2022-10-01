import React from 'react'

//Mui
import { Grid } from '@mui/material';
import {Typography} from '@mui/material';
import {Avatar} from '@mui/material';
import {Stack, Tooltip, Chip} from '@mui/material';
import TopicIcon from '@mui/icons-material/Topic';
//Quill
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
//Eigene
import { convertTimestamp, formatNumber } from '../../helper/converter';
import TextEditor from '../../Pages/Texteditor/Texteditor';

export default function Post(props) {
    console.log("props")
    console.log(props)
    console.log(props.post)
    const  {id, title, creator, creationDate, answerCount, views, content} = props.post[0];

    function PostStats(){
        return(
        <Stack direction="row" spacing={1}>
            <Tooltip title="Antworten" placement="top-end">
                <Chip icon={<TopicIcon />} lable={formatNumber(answerCount)}/>
            </Tooltip>
            <Tooltip title="Aufrufe" placement="top-end">
                <Chip icon={<TopicIcon />} lable={formatNumber(views)}/>
            </Tooltip>
        </Stack>
        )

    }

    return (
        <Grid container key={id} direction="column" justifySelf="flex-start" justifyContent="flex-start" alignItems="center"
        sx={{bgcolor:"green"}}
        >
            <Grid item> {/*Header */}
                <Grid container direction="column" justifyContent="flex-start" alignItems="center"
                 sx={{bgcolor:"blue"}}>
                    <Typography>{title}Hallo</Typography>
                    <Grid item>
                        <Grid container direction="row" justifyContent="flex-start" alignItems="center">
                            <Avatar />
                            <Grid item >
                                <Typography>Von {creator}</Typography>
                                <Typography>AM {convertTimestamp(creationDate)}</Typography>
                            </Grid>
                            <PostStats />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}> {/*Body */}
            <TextEditor
                readonly="true"
                value={content}
                // readOnly
            />
            </Grid>
        </Grid>
    )
}
