/**
 * This is the complete Forum coponent. This holds all forum components that are stored in components/forum
 */

//  import * as React from "react";
import React, { Component } from 'react'
import Categories from './Forum-Categories'
import Topics from './Forum-Topic'
import Box from '@mui/material/Box';
import Posts from '../../components/Forum/Posts'

import { Routes, Route, BrowserRouter as Router } from "react-router-dom";

export default class Forum extends Component {
    constructor(props){
        super(props);
        this.state = {
            categories:[]
        };

    }

  render() {
    return (
      <Categories />
    )
  }
}
