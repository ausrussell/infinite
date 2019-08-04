import React, { Component } from "react";
import * as THREE from "three";
import Uploader from "../Uploader";
import "../../css/builder.css";
// import { withFirebase } from "../Firebase";
import WallObject from "./WallObject";
import FlaneurControls from "./FlaneurControls";
import GeneralLight from "./GeneralLight";
import { withAuthentication } from "../Session";
import TilesFloor, { floorData } from "./TilesFloor";
import Floor from "./Floor";

import Elevator from "../Elevator";

const wallWidth = 20;
// const wallHeight = 60;
// const wallDepth = 5;

const framesData = [
  { key: 0, type: "color", color: "#543499" },
  { key: 1, color: "#240099", type: "color" },
  { key: 2, type: "color", color: "#111111" },
  { key: 3, type: "color", color: "#FFFFFF" },
  { key: 4, type: "texture", url: "../textures/wood/wood1.png" },
  { key: 5, type: "texture", url: "../textures/wood/wood2.png" },
  { key: 6, type: "texture", url: "../textures/wood/wood3.png" }
];

class Builder extends Component {
  state = {
    floorplanTitle: "",
    wallEntities: [],
    width: null,
    height: null
  };
  constructor(props) {
    super(props);
    this.initialCameraHeight = 245;
    this.cameraZAfterInitialAnimation = 300;
    this.initialAnimationTime = 1000;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();
    this.wallMeshes = [];
    this.floorMesh = null;
    this.setUpGui();
  }
  componentDidMount() {
    this.setUpScene();

    this.processFloorplan();
  }

  componentDidUpdate(props) {
    // this.flaneurControls.dispose();
    // debugger;
  }

  setUpGui() {
    var controls = new function() {
      this.fov = 45;
    }();

    this.props.gui.add(controls, "fov", 25, 180).onChange(e => {
      this.fov = e;
      this.flaneurControls.setFov(e);
    });
  }
  //listeners
  setupListeners() {
    // debugger;
    // this.mount.addEventListener("mousemove", e => this.onMouseMove(e), false);
    this.mount.addEventListener("mousedown", e => this.onMouseDown(e), false);
    // window.addEventListener("resize", () => this.onWindowResize(), false);
    // this.setupRaycaster();
    this.setupFlaneurControls();
  }

  onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    console.log("mouse index move", this.mouse);
  }

  onMouseDown(e) {
    console.log("fire");
    // this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    // this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.checkForIntersecting();
  }

  dragOverHandler = e => {
    this.onMouseMove(e);
    const intersectedData = this.checkForIntersecting();
    const { wallOver, wallSideOver } = intersectedData;

    if (this.currentWallOver && this.currentWallOver !== wallOver) {
      this.currentWallOver.dragOutHandler(this.currentSide);
    }

    if (wallOver !== this.currentWallOver && wallSideOver) {
      wallOver.dragEnterHandler(wallSideOver);
      this.currentWallOver = wallOver;
      this.currentSide = wallSideOver;
    }
    if (!wallOver) this.currentWallOver = wallOver;
  };

  fileDragLeaveHandler = () => {
    if (this.currentWallOver) {
      this.currentWallOver.dragOutHandler(this.currentSide);
    }
  };

  fileDropHandler = file => {
    if (this.currentWallOver)
      this.currentWallOver.addImageFile(file, this.currentSide);
  };

  floorTileCallback(item) {
    this.floor.floorTileCallback(item);
  }

  frameClickHandler(item) {
    console.log("type", item.type, item.color);
    this.setState({ selectedTile: item });
  }

  setupRaycaster() {
    this.raycaster = new THREE.Raycaster();
  }

  checkForIntersecting() {
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(this.mouse, this.camera);
    // this.raycaster.setFromCamera(this.flaneurControls.getMouse(), this.camera);

    let collidableObjects = this.wallEntities.map(item => item.getMesh());
    let all = collidableObjects.concat(this.scene.children);

    const intersects = this.raycaster.intersectObjects(all);

    if (intersects.length === 0) {
      return false;
    }
    //check if it intersects floors
    const intersectedWallIndex = this.wallMeshes.indexOf(intersects[0].object);

    let side = null;
    const faceIndex = intersects[0].faceIndex;
    switch (faceIndex) {
      case 8:
      case 9:
        side = "front";
        break;
      case 10:
      case 11:
        side = "back";
        break;
      default:
        side = null;
    }
    if (side) {
      if (this.state.selectedTile) {
        this.wallEntities[intersectedWallIndex].setFrameColor(
          this.state.selectedTile,
          side
        );
      }
    }

    const intersectedData = {
      wallOver: this.wallEntities[intersectedWallIndex] || null,
      wallSideOver: side
      // voxelClicked: voxelClicked
    };
    console.log("intersectedData", intersectedData);
    return intersectedData;
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

    this.renderer.render(this.scene, this.camera);
  }

  setupFlaneurControls() {
    this.flaneurControls = new FlaneurControls(this.camera, this);
  }

  initialCameraAnimation() {
    this.flaneurControls.initialCameraAnimation();
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
    this.setupListeners();
    this.initialCameraAnimation();
  };

  //set objects

  setWalls() {
    this.voxelsX = this.floorPlan.length;
    this.voxelsY = this.floorPlan[0].length;
    this.wallEntities = [];
    for (let i = 0; i < this.voxelsX; i++) {
      for (let j = 0; j < this.voxelsY; j++) {
        this.floorPlan[i][j].walls.forEach((item, index) => {
          if (item) {
            const options = { x: i, y: j, pos: index, builder: this };
            this.wallEntities = [...this.wallEntities, new WallObject(options)];
          }
        });
      }
    }
  }

  setFloor() {
    this.gridWidth = this.voxelsX * wallWidth;
    this.gridDepth = this.voxelsY * wallWidth;
    this.floor = new Floor(this);
  }

  initialWallBuild() {
    this.wallEntities.forEach((item, index) => item.initialAnimateBuild(index));
    this.wallMeshes = this.wallEntities.map(item => item.getMesh()); //used for raycaster, needs to occur after rendering
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

  floors = {
    0: {
      name: "Frames",
      y: 0,
      floorComponent: TilesFloor,
      tilesData: framesData,
      level: 0,
      tileCallback: this.frameClickHandler.bind(this) //to do
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
  animate() {
    if (this.flaneurControls) {
      var delta = this.clock.getDelta();
      this.flaneurControls.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
    this.props.stats.update();
  }

  render() {
    return (
      <div>
        <h3>Floorplan: __{this.state.floorplanTitle}__</h3>
        <MainCanvas refer={mount => (this.mount = mount)} />
        <Elevator name="Vault" floors={this.floors} />
        <Uploader
          fileDragover={this.dragOverHandler}
          fileDragLeaveHandler={this.fileDragLeaveHandler}
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
