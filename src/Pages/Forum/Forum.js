/**
 * This is the complete Forum coponent. This holds all forum components that are stored in components/forum
 */

import React, { Component } from 'react'
import Categories from './Forum-Categories'


export default class Forum extends Component {
    constructor(props){
        super(props);
        this.state = {
            categories:[]
        };

    }



  render() {
    return (
      <Categories/>
    )
  }
}
