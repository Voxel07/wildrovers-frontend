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

//Auth
import useAuth from '../../context/useAuth';
import el from 'date-fns/esm/locale/el/index.js';
export default function TextEditor(props)
{
  const{ auth } = useAuth();

  const [value, setValue] = useState();
  const [state, setState] = useState({ resCode: null, resData: null });
  const [readonly,setReadonly] = useState()
  const [rolf, setRolf] = useState()

  useEffect(() => {
    console.log("changed")
    setReadonly(false);
    setValue(props.value)

    // axios.get("https://localhost/forum/post",{
    //   params:{}
    // },sasdasd
    // {
    //   headers:{ Authorization: `Bearer ${auth.JWT}`}
    // })
    // .then(response=>{
    //   setValue(response.data[0].content)
    //   console.log(response.data)
    // })

    return () => {
      console.log("fertig")
    }
  }, [props.readonly])

  function saveImages(images,id){
    console.log("Bilder sepeichern")
    axios.post('https://localhost/forum/post/img',
    {
      files: images,
      postId: state.resData
    },
    {
      headers:{ Authorization: `Bearer ${auth.JWT}`}
    }).then(response=>
      {
        console.log(response)
        setState({resCode: response.status, resData: response.data});

      }).catch(error =>
      {
        console.log(error)
        setState({resCode:error.response.status, resData:error.response.data})

      })
  }
  async function save(){
    console.log("speichern")
    //Gett all images in the editor
    const imageTags = document.getElementsByTagName("img");
    let numPics = imageTags.length

    if (numPics){
      console.log("Bilder gefunden")
      var sources = [];
      var filteredPost = value;

      for (let i = 0; i < numPics; i++) {
        let src = imageTags[i].src; //Get all image sources
        sources.push(src); // Add all sources to an array
        //Remove all image tags from the post data
        filteredPost = filteredPost.replace(/<img[^>]*>/,"<div id=picture_"+ i +"></div>");
      }
    }

    axios.put('https://localhost/forum/post?topic='+1,
    {
      title: Math.random()*10,
      content: filteredPost
    },
    {
      headers:{ Authorization: `Bearer ${auth.JWT}`}
    }).then(response=>
    {
      console.log(response)
      setState({resCode: response.status, resData: response.data});
      if(state.resCode != 201 || !numPics) return;
      saveImages(sources,response.data)

    }).catch(error =>
    {
      console.log(error)
      setState({resCode:error.response.status, resData:error.response.data})

    })


  }
  const myModules = {
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

  const noModules = {
    toolbar: false
  }

  function ReadOnlyEditor () {
    return(
      <ReactQuill
      theme="snow"
      modules={noModules}
      value={value}
      onChange={setValue}
      readOnly
    />
    )
  }

  function Editor (){
    return(
      <ReactQuill
      theme="snow"
      // modules={myModules}
      value={value}
      onChange={setValue}
    />
    )
  }

  const {resCode, resData} = state;
  return (
    <Box>
      {
        <Editor />
        // readonly ? <ReadOnlyEditor />: <Editor />
      }
      {/* <ReactQuill
        theme="snow"
        // modules={rolf}
        modules={noModules}
        // modules={readonly ? noModules:myModules}
        value={value}
        onChange={setValue}
        readOnly={readonly}
      /> */}


      <Button varian onClick={save}>Save</Button>
      <Stack  spacing={2} marginTop={2}>
        {
            resCode > 201 ? <Alert severity="error">{resCode}|{resData}</Alert>:<Alert severity="success">{resCode}|{resData}</Alert>
        }
      </Stack>
    </Box>


          );
}