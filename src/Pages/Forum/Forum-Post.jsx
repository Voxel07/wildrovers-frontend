import React from 'react'
import { useParams,  } from 'react-router-dom'
import { history } from '../../helper/history';

export default function Forum_Post() {
    const {id} = useParams();
    const name = Math.random();
    history.replace({pathname: `/Forum/Posts/`+id+'/'+name})

  return (
    <div>Forum-Post {id}</div>
  )
}
