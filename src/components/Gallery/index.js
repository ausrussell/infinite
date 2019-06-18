import React, { Component } from "react";
import * as THREE from "three";
import Uploader from "../Uploader";
import "../../css/builder.css";

class Gallery extends Component {
  state = {
    wallOver: {},
    wallSideOver: "",
    selectedTile: null,
    vaultOpen: false
  };
  constructor(props) {
    super(props);
    console.log(props);
    this.walls = props.walls;
    this.wallHeight = 60;
    this.gridWidth = 680;

    this.voxelsX = 14;
    this.voxelsY = 10;
    console.log(this.walls, this.voxelsX);
    this.clock = new THREE.Clock();
  }
  render() {
    return <h1>---------____A gallery</h1>;
  }
}

export default Gallery;
