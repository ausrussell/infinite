import React, { Component } from "react";
import * as THREE from "three";
import "../../css/builder.css";

import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";
import FlaneurControls from "../PlanBuilder/FlaneurControls";

import MainCanvas from "./MainCanvas";
import ErrorBoundary from "../ErrorBoundary";

import GeneralLight from "../PlanBuilder/GeneralLight";
import FrameDisplayObject from "./FrameDisplayObject";
// import GLTFLoader from "three-gltf-loader";
import SceneLoader from "./SceneLoader";
import PageTitle from '../Navigation/PageTitle';
import { GalleryHelp } from './GalleryHelp'

// import Gui, { GuiContext } from "./Gui";

import * as dat from "dat.gui";

// class Gui {
//   constructor() {
//     // this.gui = new dat.GUI();
//     this.fov = 60;

//   }
// }

const Gui = function() {
    this.fov = 60;
};


class Gallery extends Component {
  state = {
    galleryData: {},
    voxelsX: 14,
    voxelsY: 10,
    wallWidth: 20,
    wallMeshes: [],
    artMeshes:[]
  };
  constructor(props) {
    super(props);
    console.log("Gallery", props.match.params.galleryName);
    this.flaneurMode = "Gallery";
    this.walls = props.walls;
    console.log(this.walls, this.voxelsX);
    this.clock = new THREE.Clock();
    this.frameObjects = [];
    this.wallMeshes = [];
    this.GalleryHelp = GalleryHelp({ callback: this.helpCallback })

  }

  componentDidMount() {
    console.log("Gallery this.props", this.props);
    this.setUpScene();
    this.galleryRef = this.props.firebase.getGalleryByName(
      this.props.match.params.galleryName,
      this.processGallery
    );
    console.log("Gui constructor")

  }

  componentWillUnmount() {
    console.log("unmount");
    window.removeEventListener("resize", this.onWindowResize);
    this.flaneurControls && this.flaneurControls.dispose();
    this.gui && this.gui.destroy();
    // this.galleryRef && this.props.firebase.detachRefListener(this.galleryRef);
  }
  addGui(){
    this.gui = new dat.GUI();
    this.guiObj = new Gui();
  // this.gui.add(text, 'fov')

  this.gui.add(this.guiObj, "fov", 25, 180).onChange(e => {
    this.fov = e;
    this.flaneurControls.setFov(e);
  });
}

  setupListeners() {
    this.addGui();
    this.focusGallery()
    this.setupFlaneurControls();
    window.addEventListener("resize", this.onWindowResize, false);
  }

  onWindowResize = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    console.log("onWindowResize", width, height)
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
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
    // this.addHelperGrid();

    this.renderer.render(this.scene, this.camera);
    // this.mount.firstElementChild.focus();
  }

  focusGallery = () => {
    this.mount.focus();
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
    this.flaneurControls.setUpCollidableObjects();

  };
  emptyScene() {
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
      sceneData: this.state.galleryData,
      builder: this
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


  addBox() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  }
//   renderFrames() {
//     console.log("this.frameGroups", this.frameGroups);
// const artMeshes = [];
//     this.frameGroups.forEach(item => {
//       const frameData = {
//         gltf: item,
//         galleryObject: this
//       };
//       const frame = new FrameDisplayObject(frameData);
//       // this.frameObjects.push(frame);
//       artMeshes.push()
//       frame.renderFrame();
//     });
//   }

  helpCallback = () => {
    setTimeout(() => this.flaneurControls.setFocus(), 500);//to overcome ant d difficult refocussing
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
          <PageTitle title={this.state.galleryData.title} help={this.GalleryHelp} />
        </div>
        <MainCanvas refer={mount => (this.mount = mount)} />
      </ErrorBoundary>
    );
  }
}

export default withAuthentication(withFirebase(Gallery));
