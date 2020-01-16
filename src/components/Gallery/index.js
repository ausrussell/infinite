import React, { Component } from "react";
import * as THREE from "three";
import Uploader from "../Uploader";
import "../../css/builder.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useRouteMatch
} from "react-router-dom";
import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";

class Gallery extends Component {
  state = {
    wallOver: {},
    wallSideOver: "",
    selectedTile: null,
    vaultOpen: false,
    galleryData: {}
  };
  constructor(props) {
    super(props);
    console.log("Gallery", props.match.params.galleryName);
    const galleryData = this.props.firebase.getGalleryByName(
      props.match.params.galleryName,
      this.processGallery
    );
    // debugger;
    this.walls = props.walls;
    this.wallHeight = 60;
    this.gridWidth = 680;

    this.voxelsX = 14;
    this.voxelsY = 10;
    console.log(this.walls, this.voxelsX);
    this.clock = new THREE.Clock();
  }

  componentDidMount() {
    console.log("Gallery this.props", this.props);

    // let { galleryName } = useParams();
    // console.log("galleryName", galleryName);
  }
  processGallery = snapshot => {
    console.log("processGallery", snapshot.val());
    snapshot.forEach(data => {
      console.log("processGallery", data.key, data.val());
      this.setState({ galleryData: data.val() });
    });
  };
  render() {
    return <h1>gallery: {this.state.galleryData.name}</h1>;
  }
}

export default withAuthentication(withFirebase(Gallery));
