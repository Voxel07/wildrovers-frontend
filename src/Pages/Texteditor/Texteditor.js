import React, { useState, useEffect } from 'react';
import axios from 'axios';
//Quill
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
//MUI
import { Box, Button } from '@material-ui/core';
//Feedback
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
export default function TextEditor()
{
  const [value, setValue] = useState('');
  const [state, setState] = useState({ resCode: null, resData: null });

  useEffect(() => {
    axios.get("https://localhost/forum/post",{
      params:{}
    })
    .then(response=>{
      setValue(response.data[3].content)
      console.log(response.data)
    })

    return () => {
      console.log("fertig")
    }
  }, [])

  function fuu(){
    console.log(value)
    setValue(value)
  }

  async function save(){
    const imageTags = document.getElementsByTagName("img");
    var sources = [];
    for (var i in imageTags) {
      var src = imageTags[i].src;
      sources.push(src);
    }
    var filtered = value;
    for(var i = 0; i < imageTags.length; i++){
        var filtered = filtered.replace(/<img[^>]*>/,"<..............img src="+i+"></img...............>");
    }
    // const filtered = value.replace(/<img[^>]*>/g,"");
    console.log(filtered);
    console.log(sources[0]);
    console.log("---------------------------------------------------");
    console.log(sources[1]);

    const bild = new Image();
    bild.src = sources[1];
    document.body.appendChild(bild);

    axios.post('https://localhost/forum/post/img', sources,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    // console.log(value);
    // axios.put('https://localhost/forum/post?user=1&topic=1',
    // {
    //   title: Math.random(),
    //   content: value
    // }).then(response=>
    // {
    //   console.log(response)
    //   setState({resCode: response.status, resData: response.data});

    // }).catch(error =>
    // {
    //   console.log(error)
    //   setState({resCode:error.response.status, resData:error.response.data})

    // })
  }
  const rolf = {
    toolbar: [
      [{ 'size': ['huge', 'large', false, 'small'] }],
      ['bold', 'italic', 'underline','strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      [{'align':[ false, 'center', 'right']}],
      [{ 'color': [] }, { 'background': [] }],

      ['clean']
    ]
  }

  const {resCode, resData} = state;

  return (
    <Box>
      <ReactQuill
        theme="snow"
        modules={rolf}
        value={value}
        onChange={setValue}
      />


      <Button varian onClick={save} >Save</Button>
      <Button varian onClick={fuu} >Update Stuff</Button>
      <Stack  spacing={2} marginTop={2}>
        {
            resCode > 200 ? <Alert severity="error">{resData}</Alert>:<Alert severity="success">{resData}</Alert>
        }
      </Stack>
    </Box>


          );
}