/**
 * This is the complete Forum coponent. This holds all forum components that are stored in components/forum
 */

import React, { useContext } from 'react'
import Topics from './Forum-Topic'
import Box from '@mui/material/Box';
import Posts from '../../components/Forum/Posts'

import { Routes, Route, BrowserRouter as Router } from "react-router-dom";

//Eigene
import Forum_Categories from './Forum-Categories'
import Searchbar from '../../components/Forum/Searchbar';

export default function Forum(props) {

  // const forumContext

  return (
    <Box>
      <Searchbar />
      <Forum_Categories />

    </Box>
  )
}

