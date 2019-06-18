import React, { Component } from "react";
import * as THREE from "three";
import Uploader from "./Uploader";
import "../css/builder.css";

// import {OrbitControls} = require("three-orbit-controls")(THREE);
// const OrbitControls = require("three-orbit-controls")(THREE);
// import OrbitControls from "orbit-controls-es6";

// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import Frame from "./Frame";
import WallEntity from "./WallEntity";
import Floor from "./Floor";
import Elevator from "./Elevator";
import GeneralLight from "./GeneralLight";
// import params from "../data/light-data";
// import hemiLuminousIrradiances from "../data/light-data";
import * as dat from "dat.gui";

import FirstPersonControls from "./FirstPersonControls";
import { withFirebase } from "./Firebase";

const bulbLuminousPowers = {
  "110000 lm (1000W)": 110000,
  "3500 lm (300W)": 3500,
  "1700 lm (100W)": 1700,
  "800 lm (60W)": 800,
  "400 lm (40W)": 400,
  "180 lm (25W)": 180,
  "20 lm (4W)": 20,
  Off: 0
};
// ref for solar irradiances: https://en.wikipedia.org/wiki/Lux
const hemiLuminousIrradiances = {
  "0.0001 lx (Moonless Night)": 0.0001,
  "0.002 lx (Night Airglow)": 0.002,
  "0.5 lx (Full Moon)": 0.5,
  "0.9 lx (Fuller Moon)": 0.9,
  "1.5 lx (Gloaming)": 1.5,

  "3.4 lx (City Twilight)": 3.4,
  "50 lx (Living Room)": 50,
  "100 lx (Very Overcast)": 100,
  "350 lx (Office Room)": 350,
  "400 lx (Sunrise/Sunset)": 400,
  "1000 lx (Overcast)": 1000,
  "18000 lx (Daylight)": 18000,
  "50000 lx (Direct Sun)": 50000
};
const params = {
  shadows: true,
  exposure: 0.68,
  bulbPower: Object.keys(bulbLuminousPowers)[4],
  hemiIrradiance: Object.keys(hemiLuminousIrradiances)[0]
};

class ArtWork {
  // constructor() {
  //   super();
  // }
  // render() {}
}

class Builder extends Component {
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
    this.gui = new dat.GUI();
    console.log(this.walls, this.voxelsX);
    this.clock = new THREE.Clock();
  }

  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    // this.renderer.shadowMapEnabled = true;
    //
    // this.renderer.physicallyCorrectLights = true;
    // this.renderer.gammaInput = true;
    // this.renderer.gammaOutput = true;
    // this.renderer.toneMapping = THREE.ReinhardToneMapping;
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.x = 0;
    this.camera.position.y = 45;
    this.camera.position.z = 360;
    this.camera.lookAt(new THREE.Vector3(10, 10, 10));

    this.setUpFirstPersonControls();

    // this.camera.position.set(0, 45, 300);
    // this.camera.position.set(0, 45, 30);
    // this.camera.lookAt(this.scene.position);

    console.log("this.scene.position", this.scene.position);

    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    this.addGrid();
    // this.addBox();
    this.setWalls();
    this.setFloor();
    this.addLight();

    // this.initialAnimate();
    this.setupListeners();
    this.animate();
    this.setupRaycaster();
    this.setupControls();
  }
  setupControls() {
    // this.stats = new Stats();
    // this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);

    this.gui.add(
      params,
      "hemiIrradiance",
      Object.keys(hemiLuminousIrradiances)
    );

    this.gui.open();
  }
  setUpFirstPersonControls() {
    this.controls = new FirstPersonControls(this.camera, this);

    this.controls.lookSpeed = 0.04;
    this.controls.movementSpeed = 20;
    // this.controls.noFly = true;
    // this.controls.lookVertical = true;
    this.controls.constrainVertical = true;
    this.controls.verticalMin = 1.4;
    this.controls.verticalMax = 1.7;
    this.controls.lon = -150;
    this.controls.lat = 120;
  }
  setupListeners() {
    this.mount.addEventListener("mousemove", e => this.onMouseMove(e), false);
    this.mount.addEventListener("mousedown", e => this.onMouseDown(e), false);
    window.addEventListener("resize", () => this.onWindowResize(), false);
  }

  setupRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  onMouseMove(e) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    //
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  onMouseDown(e) {
    console.log("fire");
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.checkForIntersecting();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  addLight() {
    // Add the light to the scene
    this.generalLight = new GeneralLight();

    this.lightGroup = this.generalLight.getLight();
    // this.lightGroup.add(this.generallightGroup);
    this.scene.add(this.lightGroup);
  }
  addBox() {
    // Create a geometry
    // 	Create a box (cube) of 10 width, length, and height
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    // Create a MeshBasicMaterial with a color white and with its wireframe turned on
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff
      // wireframe: true
    });

    // Combine the geometry and material into a mesh
    const mesh = new THREE.Mesh(geometry, material);
    // Add the mesh to the scene
    this.scene.add(mesh);
    mesh.position.set(0, 0, 0);
  }
  addGrid() {
    this.gridHelper = new THREE.GridHelper(
      this.gridWidth,
      this.voxelsX,
      0x0000ff,
      0x808080
    );

    // this.scene.add(this.gridHelper);
  }

  setWalls() {
    // let walls = {};
    this.wallEntities = [];
    for (let i = 0; i < this.voxelsX; i++) {
      // walls[i] = {};
      for (let j = 0; j < this.voxelsY; j++) {
        if (this.walls[i][j][0].built) {
          this.wallEntities.push(new WallEntity(this.walls[i][j][0], this));
        }
        if (this.walls[i][j][1].built) {
          this.wallEntities.push(new WallEntity(this.walls[i][j][1], this));
        }
      }
    }
    console.log(this.wallEntities);
    this.meshes = this.wallEntities.map(item => item.getMesh()); //used for raycaster
    console.log("this.meshes", this.meshes);
    return this.walls;
  }

  setFloor() {
    this.floorPlane = new THREE.PlaneBufferGeometry(
      this.gridWidth,
      this.gridWidth,
      10
    );
    // this.floorMaterial = new THREE.MeshLambertMaterial({
    //   //MeshStandardMaterial
    //   color: "#ffffff",
    //   side: THREE.DoubleSide
    // });

    this.floorMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.8,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.0005
      // side: THREE.DoubleSide
    });

    this.floorMesh = new THREE.Mesh(this.floorPlane, this.floorMaterial);
    this.floorMesh.receiveShadow = true;
    this.floorMesh.rotateX(-Math.PI / 2);
    console.log("this.floorMesh", this.floorMesh);
    // this.scene = this.builder.scene;

    // this.scene.add(this.floorMesh);

    this.floor = new Floor(this);

    // this.floor.addFloorMesh(); //addFloorPlane();
  }

  increaseWallsHeights() {
    this.wallEntities.forEach((wall, index) => {
      // if (
      //   wall.getHeight() < this.wallHeight &&
      //   (index === 0 || this.wallEntities[index - 1].height > 20) // to create stepped wall building
      // ) {
      //   const thisWallHeight = wall.getHeight();
      //   // const heightDelta = 60 / (wall.height + 1) / 3;
      //   const heightDelta =
      //     0.5 + Math.pow((60 - wall.getHeight()) / 100, 2) * 20;
      //   console.log("heightDelta", wall.getHeight(), heightDelta);
      //   // debugger;
      //   wall.setHeight(wall.getHeight() + heightDelta);
      //   wall.renderWall();
      // }
    });
  }

  // renderWalls() {
  //   this.wallEntities.forEach((wall, index) => {
  //     wall.setHeight(this.wallHeight);
  //     wall.renderWall();
  //   });
  // }

  initialAnimate() {
    this.initialAnimation = false;

    if (this.wallEntities[this.wallEntities.length - 1].height < 60) {
      this.increaseWallsHeights();
      console.log("this.camera.position", this.camera.position);
      this.initialAnimation = true;
    }

    if (this.camera.position.y > 45) {
      this.camera.position.set(0, --this.camera.position.y, 300);
      this.camera.lookAt(this.scene.position);
      this.initialAnimation = true;
    }
    return this.initialAnimation;
  }

  rayIntersect(ray, distance) {
    let collidableObjects = this.wallEntities.map(item => item.getMesh()); //used for raycaster
    var intersects = ray.intersectObjects(collidableObjects);
    for (var i = 0; i < intersects.length; i++) {
      // Check if there's a collision
      if (intersects[i].distance < distance) {
        console.log("collide");
        return true;
      }
    }
    return false;
  }

  checkForIntersecting() {
    // update the picking ray with the camera and mouse position
    this.camera.updateMatrixWorld();
    console.log("this.mouse, this.camera", this.mouse, this.camera);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    // calculate objects intersecting the picking ray
    // debugger;
    let groups = this.wallEntities.map(item => item.getMesh()); //used for raycaster

    const intersects = this.raycaster.intersectObjects(groups);
    console.log("intersects", intersects.length, intersects);
    if (intersects.length === 0) {
      return false;
    }
    const intersectedWallIndex = this.meshes.indexOf(intersects[0].object);
    // this.setState({
    //   intersectedWall: intersectedWallIndex
    //     ? this.wallEntities[intersectedWallIndex]
    //     : null
    // });
    let side = null;
    const faceIndex = intersects[0].faceIndex;
    switch (faceIndex) {
      case (8, 9):
        side = "front";
        break;
      case (10, 11):
        side = "back";
        break;
      default:
        side = null;
    }

    console.log("side", side);
    if (side) {
      // debugger;
      if (this.state.selectedTile) {
        this.wallEntities[intersectedWallIndex].setFrameColor(
          this.state.selectedTile,
          side
        );
        // this.wallEntities[intersectedWallIndex].renderWall();
      }
    }

    const intersectedData = {
      wallOver: this.wallEntities[intersectedWallIndex] || null,
      wallSideOver: side
    };

    return intersectedData;
    // this.animate();
  }

  dragOverHandler = e => {
    console.log("builder dragOverHandler", e);
    this.onMouseMove(e);
    const intersectedData = this.checkForIntersecting();
    const { wallOver, wallSideOver } = intersectedData;

    if (this.currentWallOver && this.currentWallOver !== wallOver) {
      this.currentWallOver.dragOutHandler(this.currentSide);
    } // // }

    if (wallOver && wallSideOver) {
      wallOver.dragOverHandler(wallSideOver);
      this.currentWallOver = wallOver;
      this.currentSide = wallSideOver;
    }
    // this.setState(intersectedData);
  };
  fileDropHandler = file => {
    // debugger;
    if (this.currentWallOver)
      this.currentWallOver.addImageFile(file, this.currentSide);
    // if (this.state.wallOver) this.state.wallOver.addImageFile(file);
  };

  tileCallback = item => {
    console.log("type", item.type, item.color);
    this.setState({ selectedTile: item });
  };

  animate() {
    // this.animating = false;
    var delta = this.clock.getDelta();
    this.controls.update(delta);
    // if (this.initialAnimation) {
    //   this.animating = this.initialAnimate();
    //   console.log("this.animating", this.animating);
    // }

    this.renderer.render(this.scene, this.camera);
    this.camera.updateMatrixWorld();
    this.animating = true;

    if (this.animating) {
      requestAnimationFrame(() => this.animate());
    }

    this.lightGroup.intensity = hemiLuminousIrradiances[params.hemiIrradiance];
    // this.bulbLight.power = bulbLuminousPowers[params.bulbPower] * 500;

    // this.renderer.toneMappingExposure = Math.pow(params.exposure, 5.0); // to allow for very bright scenes.
    // this.renderer.shadowMap.enabled = params.shadows;

    if (this.stats) this.stats.update();
  }
  floorTileCallback(item) {
    this.floor.floorTileCallback(item);
  }

  // <Uploader
  //   fileDragover={this.dragOverHandler}
  //   fileDrop={item => this.fileDropHandler(item)}
  //   wallOver={this.state.wallOver}
  // />
  floors = {
    0: {
      name: "Frames",
      y: 0
    },
    1: {
      name: "Floor surfaces",
      y: 235
    }
  };
  render() {
    const tileCallbackFunction = this.state.vaultOpen
      ? item => this.tileCallback(item)
      : null;
    // const floorTileCallbackFunction = this.state.vaultOpen
    //   ? item => this.floor.floorTileCallback(item)
    //   : null;
    return (
      <div>
        <div>Builder</div>
        <MainCanvas refer={mount => (this.mount = mount)} />
        <Elevator
          name="Vault"
          floors={this.floors}
          tileCallback={this.tileCallback}
          floorTileCallback={this.floorTileCallback.bind(this)}
        />
        <Uploader
          fileDragover={this.dragOverHandler}
          fileDrop={item => this.fileDropHandler(item)}
          wallOver={this.state.wallOver}
        />
        )}
      </div>
    );
  }
}

const MainCanvas = props => {
  return (
    <div
      id="boardCanvas"
      style={{ width: "100vw", height: "100vh" }}
      ref={mount => props.refer(mount)}
    />
  );
};

export default withFirebase(Builder);
