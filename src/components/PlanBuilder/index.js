import React, { Component } from "react";
import * as THREE from "three";
import Uploader from "../Uploader";
import "../../css/builder.css";
import { withFirebase } from "../Firebase";

class Builder extends Component {
  state = {
    walls: {}
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
  componentDidMount() {
    this.props.firebase.getPlanByKey(
      this.props.location.state.plan,
      this.getPlanCallback
    );
  }
  getPlanCallback = snapshot => {
    console.log("snapshot", snapshot.val());
  };
  render() {
    return <h1>---------____A builder</h1>;
  }
}

export default withFirebase(Builder);
