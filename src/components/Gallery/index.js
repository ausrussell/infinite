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
import FlaneurControls from "../PlanBuilder/FlaneurControls";

import MainCanvas from "./MainCanvas";
import ErrorBoundary from "../ErrorBoundary";

import WallDisplayObject from "./WallDisplayObject";

import Floor from "../PlanBuilder/Floor";
import GeneralLight from "../PlanBuilder/GeneralLight";

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
    this.setUpScene();
    this.props.firebase.getGalleryByName(
      this.props.match.params.galleryName,
      this.processGallery
    );
    // this.setupFlaneurControls();
    // this.processFloorplan();

    // let { galleryName } = useParams();
    // console.log("galleryName", galleryName);
  }
  //scene setup and animation
  setUpScene() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.setState({ width: width, height: height });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
    this.addLight();
    this.addHelperGrid();

    this.renderer.render(this.scene, this.camera);
  }

  setupFlaneurControls() {
    this.flaneurControls = new FlaneurControls(this.camera, this);
  }
  initialCameraAnimation() {
    // this.flaneurControls.initialCameraAnimation();
  }
  addLight() {
    // Add the light to the scene
    this.generalLight = new GeneralLight();
    this.lightGroup = this.generalLight.getLight();
    this.scene.add(this.lightGroup);
  }
  processGallery = snapshot => {
    console.log("processGallery", snapshot.val());
    snapshot.forEach(data => {
      console.log("processGallery", data.key, data.val());
      this.galleryData = data.val();
      // debugger;
      console.log("this.galleryData.floorplan", this.galleryData.floorplan);
      this.floorplan = this.galleryData.floorplan.data;
      this.voxelsX = this.floorplan.length;
      this.voxelsY = this.floorplan[0].length;
      this.wallData = this.galleryData.wallData;

      this.setWalls();
      this.renderWalls();
      this.setCamera();
      this.animate();
      this.setState({ galleryData: data.val() });
    });
  };
  setCamera() {
    this.camera.position.z = 350;
    this.camera.position.y = 45;
    // this.initialCameraAnimation();
  }
  addHelperGrid() {
    const gridHelper = new THREE.GridHelper(
      this.voxelsX * this.wallWidth,
      this.voxelsX,
      0x0000ff,
      0x808080
    );
    this.scene.add(gridHelper);
  }
  setWalls() {
    // debugger;
    this.walls = [];
    this.galleryData.wallData.forEach(wall => {
      const options = wall;
      options.builder = this;
      console.log("wall", wall);
      // const wallO = new WallDisplayObject(wall);
      this.walls.push(new WallDisplayObject(wall));
      // wallO.renderWall();
    });
  }
  renderWalls() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
    console.log("  this.scene", this.scene);
    console.log("renderWalls", this.walls);
    this.walls.forEach(wall => {
      console.log("renderWalls wall", wall);
      wall.renderWall();
    });
  }

  setFloor() {
    this.gridWidth = this.voxelsX * this.wallWidth;
    this.gridDepth = this.voxelsY * this.wallWidth;
    this.floor = new Floor(this);
  }

  animate() {
    if (this.flaneurControls) {
      var delta = this.clock.getDelta();
      this.flaneurControls.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
    // this.props.stats.update();
  }

  render() {
    return (
      <ErrorBoundary>
        <h1>gallery: {this.state.galleryData.name}</h1>
        <MainCanvas refer={mount => (this.mount = mount)} />
      </ErrorBoundary>
    );
  }
}

export default withAuthentication(withFirebase(Gallery));
