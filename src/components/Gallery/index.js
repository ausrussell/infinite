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
import FrameDisplayObject from "./FrameDisplayObject";
import GLTFLoader from "three-gltf-loader";

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
    this.flaneurMode = "Gallery";
    // debugger;
    this.walls = props.walls;
    this.wallHeight = 60;
    this.gridWidth = 680;

    this.voxelsX = 14;
    this.voxelsY = 10;
    console.log(this.walls, this.voxelsX);
    this.clock = new THREE.Clock();
    this.frameObjects = [];
    this.loader = new GLTFLoader();
    this.wallMeshes = [];
  }

  componentDidMount() {
    console.log("Gallery this.props", this.props);
    this.setUpScene();
    this.props.firebase.getGalleryByName(
      this.props.match.params.galleryName,
      this.processGallery
    );
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
    this.addLight();
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
  processGallery = snapshot => {
    console.log("processGallery", snapshot.val());
    snapshot.forEach(data => {
      console.log("processGallery", data.key, data.val());
      this.galleryData = data.val();
      console.log("this.galleryData.galleryRef", this.galleryData.floorplan);
      this.setState({ galleryData: data.val() });

      this.setScene();
      // this.floorplan = this.galleryData.floorplan.data;
      // this.frameGroups = this.galleryData.frameGroups;
      // this.voxelsX = this.floorplan.length;
      // this.voxelsY = this.floorplan[0].length;
      // this.wallData = this.galleryData.wallData;
      //
      // this.setWalls();
      // this.renderWalls();
      // this.renderFrames();
      this.setupListeners();
      this.setCamera();
      this.animate();
    });
  };
  isWallMesh(item) {
    if (item.name === "wallGroup") {
      return item.children.filter(child => child.name === "wallMesh");
    }
  }
  setScene() {
    // Load a glTF resource

    // console.log("this.galleryData.galleryRef", this.galleryData.galleryRef);
    this.loader.load(
      // resource URL
      this.galleryData.galleryRef,
      // called when the resource is loaded
      gltf => {
        console.log("gltf", gltf);
        // gltf.scene.traverse(child => {
        gltf.scene.children.forEach(child => {
          console.log("child", child);
          // if (child.name === "wallMesh" || child.name === "artHolder")
          this.scene.add(child);
        });
        // this.gltfScene = gltf.scene;
        // this.scene.add(gltf.scene);
        this.scene.updateMatrixWorld(true);
        // console.log("gltf.scene", gltf.scene);
        // console.log("this.scene", this.scene);
        //
        gltf.scene.children.forEach(item => {
          console.log("child item", item);
          const anyWallMesh = this.isWallMesh(item);
          console.log("anyWallMesh", anyWallMesh);

          anyWallMesh && this.wallMeshes.push(anyWallMesh);
        });
        // console.log("this.wallMeshes", this.wallMeshes);

        // gltf.animations; // Array<THREE.AnimationClip>
        // gltf.scene; // THREE.Scene
        // gltf.scenes; // Array<THREE.Scene>
        // gltf.cameras; // Array<THREE.Camera>
        // gltf.asset; // Object
      },
      // called while loading is progressing
      function(xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      function(error) {
        console.log("An error happened", error);
      }
    );
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
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
    console.log("this.scene", this.scene);
    console.log("renderWalls", this.walls);
    this.walls.forEach(wall => {
      console.log("renderWalls wall", wall);
      wall.renderWall();
    });
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
