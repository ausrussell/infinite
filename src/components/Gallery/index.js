import React, { Component } from "react";
import * as THREE from "three";
import "../../css/builder.css";

import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";
import FlaneurControls from "../PlanBuilder/FlaneurControls";

import MainCanvas from "./MainCanvas";
import ErrorBoundary from "../ErrorBoundary";

import WallDisplayObject from "./WallDisplayObject";

import Floor from "../PlanBuilder/Floor";
import GeneralLight from "../PlanBuilder/GeneralLight";
import FrameDisplayObject from "./FrameDisplayObject";
// import GLTFLoader from "three-gltf-loader";
import SceneLoader from "./SceneLoader";
import PageTitle from '../Navigation/PageTitle';
import {GalleryHelp} from './GalleryHelp'

const wallWidth = 20;

class Gallery extends Component {
  state = {
    galleryData: {}
  };
  constructor(props) {
    super(props);
    console.log("Gallery", props.match.params.galleryName);
    this.flaneurMode = "Gallery";
    this.walls = props.walls;
    this.wallHeight = 60;

    this.voxelsX = 14;
    this.voxelsY = 10;
    this.gridWidth = this.voxelsX * wallWidth;

    this.gridDepth = this.voxelsY * wallWidth;

    console.log(this.walls, this.voxelsX);
    this.clock = new THREE.Clock();
    this.frameObjects = [];
    this.wallMeshes = [];
  }

  componentDidMount() {
    console.log("Gallery this.props", this.props);
    this.setUpScene();
    this.galleryRef = this.props.firebase.getGalleryByName(
      this.props.match.params.galleryName,
      this.processGallery
    );
  }

  componentWillUnmount() {
    console.log("unmount");
    // this.galleryRef && this.props.firebase.detachRefListener(this.galleryRef);
  }

  setupListeners() {
    this.setupFlaneurControls();
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
    // this.addLight();
    this.addHelperGrid();

    this.renderer.render(this.scene, this.camera);
  }

  setupFlaneurControls() {
    this.flaneurControls = new FlaneurControls(this.camera, this);
  }

  rayIntersect(ray, distance) {
    //used by flaneur controls
    // let collidableObjects = this.wallEntities.map(item => item.getMesh()); //used for raycaster
    // var intersects = ray.intersectObjects(collidableObjects);
    // for (var i = 0; i < intersects.length; i++) {
    //   // Check if there's a collision
    //   if (intersects[i].distance < distance) {
    //     console.log("collide");
    //     return true;
    //   }
    // }
    return false;
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
  processGallery = (data) => {
    console.log("processGallery", data);
    if (this.galleryData) this.emptyScene();
    // this.galleryData = data;
    this.setState({ galleryData: data }, this.setScene);
    // this.setScene();
    this.setupListeners();
    this.setCamera();
    this.animate();

  };
  emptyScene() {
    debugger;
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }

  isWallMesh(item) {
    if (item.name === "wallGroup") {
      return item.children.filter(child => child.name === "wallMesh");
    }
  }
  setScene() {
    // debugger;
    // Load a glTF resource
    const options = {
      scene: this.scene,
      sceneData: this.state.galleryData
    };
    this.sceneLoader = new SceneLoader(options);
    this.sceneLoader.renderData();
  }
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
    this.walls = [];
    this.galleryData.wallData.forEach(wall => {
      const options = wall;
      options.builder = this;
      this.walls.push(new WallDisplayObject(wall));
    });
  }
  renderWalls() {
    console.log("this.scene", this.scene);
    console.log("renderWalls", this.walls);
    this.walls.forEach(wall => {
      console.log("renderWalls wall", wall);
      wall.renderWall();
    });
  }

  addBox() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  }
  renderFrames() {
    console.log("this.frameGroups", this.frameGroups);

    this.frameGroups.forEach(item => {
      const frameData = {
        gltf: item,
        galleryObject: this
      };
      const frame = new FrameDisplayObject(frameData);
      this.frameObjects.push(frame);
      frame.renderFrame();
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
  }

  render() {
    return (
      <ErrorBoundary>
        <div className="page-header-area">
            <PageTitle title={this.state.galleryData.title} help={GalleryHelp} />
        </div>
        <MainCanvas refer={mount => (this.mount = mount)} />
      </ErrorBoundary>
    );
  }
}

export default withAuthentication(withFirebase(Gallery));
