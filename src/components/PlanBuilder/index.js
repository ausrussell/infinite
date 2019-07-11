import React, { Component } from "react";
import * as THREE from "three";
import Uploader from "../Uploader";
import "../../css/builder.css";
import { withFirebase } from "../Firebase";
import WallObject from "./WallObject";
import FlaneurControls from "./FlaneurControls";
import GeneralLight from "./GeneralLight";
import { withAuthentication } from "../Session";
import TilesFloor, { floorData } from "./TilesFloor";
import Floor from "./Floor";

import Elevator from "../Elevator";

import animate from "../../Helpers/animate";

const wallWidth = 20;
const wallHeight = 60;
const wallDepth = 5;

const framesData = [
  { key: 0, type: "color", color: "#543499" },
  { key: 1, color: "#240099", type: "color" },
  { key: 2, type: "color", color: "#111111" },
  { key: 3, type: "color", color: "#FFFFFF" },
  { key: 4, type: "texture", url: "../textures/wood/wood1.png" },
  { key: 5, type: "texture", url: "../textures/wood/wood2.png" },
  { key: 6, type: "texture", url: "../textures/wood/wood3.png" }
];

// const floors = {
//   0: {
//     name: "Frames",
//     y: 0,
//     floorComponent: TilesFloor
//   },
//   1: {
//     name: "Floor surfaces",
//     y: 235,
//     floorComponent: TilesFloor
//   }
// };

class Builder extends Component {
  state = {
    floorplanTitle: "",
    wallEntities: [],
    width: null,
    height: null
  };
  constructor(props) {
    super(props);
    console.log(props);
    this.initialCameraHeight = 245;
    this.cameraZAfterInitialAnimation = 300;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.clock = new THREE.Clock();
  }
  componentDidMount() {
    // debugger;
    this.setUpScene();
    this.processFloorplan();
    // this.animate();
  }

  componentDidUpdate(props) {
    // debugger;
  }
  //listeners
  setupListeners() {
    this.mount.addEventListener("mousemove", e => this.onMouseMove(e), false);
    this.mount.addEventListener("mousedown", e => this.onMouseDown(e), false);
    window.addEventListener("resize", () => this.onWindowResize(), false);
    // this.setupRaycaster();
  }

  onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
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

  floorTileCallback(item) {
    this.floor.floorTileCallback(item);
  }
  setupRaycaster() {
    this.raycaster = new THREE.Raycaster();
  }

  checkForIntersecting() {
    // update the picking ray with the camera and mouse position
    this.camera.updateMatrixWorld();
    console.log("this.mouse, this.camera", this.mouse, this.camera);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    // calculate objects intersecting the picking ray
    // debugger;
    ///**** fix
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

    this.initialCameraAnimation();
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
    this.addLight();

    this.renderer.render(this.scene, this.camera);
  }

  initialCameraAnimation() {
    let cameraPosition = [0, this.initialCameraHeight, 0];
    this.setCameraPosition(cameraPosition);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.cameraFlightHyp = Math.hypot(
      this.initialCameraHeight,
      this.cameraZAfterInitialAnimation
    );
    const cameraAni = new animate({
      duration: 10000,
      timing: "circ",
      draw: progress => this.cameraFlight(progress)
    });
    cameraAni.animate(performance.now());
  }

  cameraFlight = progress => {
    //45, 300
    const x = Math.sin(Math.PI * progress) * this.cameraFlightHyp;
    const cameraPosition = [
      x,
      this.initialCameraHeight - 200 * progress,
      this.cameraZAfterInitialAnimation * progress
    ];
    this.setCameraPosition(cameraPosition);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  };

  setCameraPosition(cameraPosition) {
    this.camera.position.set(...cameraPosition);
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
    this.props.stats.update();
  }
  renderRenderer() {
    this.renderer.render(this.scene, this.camera);
  }

  addHelperGrid() {
    const gridHelper = new THREE.GridHelper(
      this.voxelsX * wallWidth,
      this.voxelsX,
      0x0000ff,
      0x808080
    );
    this.scene.add(gridHelper);
  }

  addBox() {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff
      // wireframe: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    mesh.position.set(0, 0, 0);
  }

  addLight() {
    // Add the light to the scene
    this.generalLight = new GeneralLight();
    this.lightGroup = this.generalLight.getLight();
    this.scene.add(this.lightGroup);
  }
  //process floorplan
  processFloorplan() {
    if (this.props.location.state.plan) {
      // if plan is provided by router
      this.props.firebase.getPlanByKey(
        this.props.location.state.plan,
        this.getPlanCallback.bind(this)
      );
    }
  }

  getPlanCallback = snapshot => {
    console.log("snapshot", snapshot.val());
    const floorSnapshot = snapshot.val();
    this.floorPlan = floorSnapshot.data;
    this.setState({ floorplanTitle: floorSnapshot.title });
    this.setWalls();
    this.setFloor();
    this.addHelperGrid();
    // this.renderRenderer();
    this.animate();
    this.initialWallBuild();
  };

  setWalls() {
    this.voxelsX = this.floorPlan.length;
    this.voxelsY = this.floorPlan[0].length;
    this.wallEntities = [];
    for (let i = 0; i < this.voxelsX; i++) {
      for (let j = 0; j < this.voxelsY; j++) {
        this.floorPlan[i][j].walls.forEach((item, index) => {
          console.log("index", index);

          if (item) {
            const options = { x: i, y: j, pos: index, builder: this };
            this.wallEntities = [...this.wallEntities, new WallObject(options)];
            // this.setState({
            //   wallEntities: [
            //     ...this.state.wallEntities,
            //     new WallObject(options)
            //   ]
            // });
          }
        });
      }
    }
  }

  setFloor() {
    this.floorPlane = new THREE.PlaneBufferGeometry(
      this.voxelsX * wallWidth,
      this.voxelsY * wallWidth,
      10
    );

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
    this.scene.add(this.floorMesh);
    this.floor = new Floor(this);
  }

  initialWallBuild() {
    this.wallEntities.forEach((item, index) => item.initialAnimateBuild(index));
  }

  floors = {
    0: {
      name: "Frames",
      y: 0,
      floorComponent: TilesFloor,
      tilesData: framesData,
      level: 0,
      tileCallback: this.tileClickHandler //to do
    },
    1: {
      name: "Floor surfaces",
      y: 235,
      floorComponent: TilesFloor,
      tilesData: floorData,
      level: 1,
      tileCallback: this.floorTileCallback.bind(this)
    }
  };

  render() {
    return (
      <div>
        <h3>Floorplan: __{this.state.floorplanTitle}__</h3>
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

export default withAuthentication(Builder);
