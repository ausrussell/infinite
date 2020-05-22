import React, { Component } from "react";
import * as THREE from "three";
import Uploader from "../Uploader";
import "../../css/builder.css";
// import { withFirebase } from "../Firebase";
import WallObject from "./WallObject";
import FlaneurControls from "./FlaneurControls";
import GeneralLight from "./GeneralLight";
import WallLight from "./WallLight";

import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";
import * as Stats from "stats-js";

// import TilesFloor, { floorData } from "./TilesFloor";

import VaultFloor from "../Elevator/VaultFloor";
import LightFloor from "./LightFloor";

import Floor from "./Floor";

import Surroundings from "./Surroundings";

import Elevator from "../Elevator";

import ErrorBoundary from "../ErrorBoundary";

import { TransformControls } from "./TransformControls_Apr19";

import Draggable from "./Draggable";

import BuilderHeader from "./BuilderHeader"

const wallWidth = 20;

const degreesToRadians = degrees => {
  return (degrees * Math.PI) / 180;
};

const sceneHelperObjects = ["footHover", "clickFloorPlane", "TransformControls"]

class Builder extends Component {
  state = {
    floorplanTitle: "",
    wallEntities: [],
    wallMeshes: [],
    meshesInScene: [],
    width: null,
    height: null,
    draggableVaultElementActive: null,
    draggableVaultItem: null,
    galleryTitle: "",
    galleryDesc: {},
    lights: [],
    selectedSpotlight: null,
    generalLight: null,
    plannerGallery: false,
    galleryId: null,
    floorplan: null,
    selectedTile: null
  };
  constructor(props) {
    super(props);
    this.initialCameraHeight = 245;
    this.cameraZAfterInitialAnimation = 260;
    this.initialAnimationTime = 2000;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();
    this.floorMesh = null;
    // this.setUpGui();
    this.transformOriginVector = new THREE.Vector3();
    this.transformOriginVector_temp = new THREE.Vector3();
    this.transformDirectionVector = new THREE.Vector3();
    this.transformDirectionRay = new THREE.Raycaster();
    this.lights = [];
    // this.gltfExporter = new GLTFExporter();
    this.baseState = this.state;
  }
  componentDidMount() {
    // this.setupStats();
    this.setUpScene();
    // this.processFloorplan();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  componentDidUpdate(props) {
    // this.flaneurControls.dispose();
    console.log(
      "Builder componentDidUpdate props",
      props.firebase.currentUID,
      this.props.firebase.currentUID
    );
    if (this.props.firebase.currentUID && !this.floorplanProcessed) {
      this.processFloorplan();
      this.floorplanProcessed = true;
    }
  }
  setupStats() {
    console.log("planbuilder setupStats");
    if (!this.stats) {
      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(this.stats.dom);
    }
  }
  setUpGui() {
    var controls = new function () {
      this.fov = 45;
    }();

    this.props.gui.add(controls, "fov", 25, 180).onChange(e => {
      this.fov = e;
      this.flaneurControls.setFov(e);
    });
  }
  //listeners
  setupListeners() {
    console.log("setupListeners", this.mount)
    this.mount.addEventListener(
      "mousemove",
      this.onMouseMove.bind(this),
      false
    );
    this.mount.addEventListener(
      "mousedown",
      this.onMouseDown.bind(this),
      false
    );
    window.addEventListener("resize", this.onWindowResize, false);
    this.setupFlaneurControls();
  }

  removeListeners() {
    this.mount.removeEventListener("mousemove", this.onMouseMove);
    this.mount.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("resize", this.onWindowResize);
  }

  onWindowResize = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    console.log("onWindowResize", width, height)

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.currentHover = this.checkForIntersecting();
    if (this.currentHover.artMesh && !this.activeArtMesh) {
      this.hoverArtMesh(this.currentHover.artMesh);
    } else if (!this.currentHover.artMesh && this.activeArtMesh) {
      this.unhoverArtMesh(this.currentHover.artMesh);
    }
  }

  onMouseDown(e) {
    console.log("fire");
    console.log("onMouseDown", this.checkForIntersecting());
    const intersectedData = this.checkForIntersecting();
    if (intersectedData) {
      let artHolder;
      if (intersectedData.artMesh || intersectedData.frameMesh) {
        let key;
        for (key in intersectedData) {
          artHolder = intersectedData[key].parent;
        }
      }
      console.log("this.state.selectedTile && artHolder", this.state.selectedTile, artHolder)
      if (this.state.selectedTile && artHolder && this.state.selectedTile.type === "frame") {
        console.log("selectedTile", this.state.selectedTile);
        artHolder.removeTexture();
        artHolder.setFrameColor(this.state.selectedTile);
      }

      if (intersectedData.LightConeHelper) {
        // e.stopPropagation();
        this.lightConeHelperSelected(intersectedData.LightConeHelper);
      }
      const { wallOver } = intersectedData;//for changing wall texture
      if (this.state.selectedTile && wallOver && this.state.selectedTile.type === "wall") {
        wallOver.removeTexture();
        wallOver.wallTileCallback(this.state.selectedTile);
      }
    }
  }

  dragOverHandler = e => {
    this.dragging = true;
    this.onMouseMove(e);
    let intersectedData = this.checkForIntersecting();
    const { wallOver, wallSideOver } = intersectedData;
    if (this.currentWallOver && this.currentWallOver !== wallOver) {
      this.currentWallOver.dragOutHandler(this.currentSide);
    }

    if (wallOver && wallOver !== this.currentWallOver && wallSideOver) {
      wallOver.dragEnterHandler(wallSideOver);
      this.currentWallOver = wallOver;
      this.currentSide = wallSideOver;
    }
    if (!wallOver) this.currentWallOver = wallOver;
  };

  fileDragLeaveHandler = () => {
    this.dragging = false;
    if (this.currentWallOver) {
      this.currentWallOver.dragOutHandler(this.currentSide);
    }
  };

  fileDropHandler = (file, uploadTask) => {
    const dropData = {
      file: file,
      uploadTask: uploadTask
    };
    this.processDroppedArt(dropData);
  };

  itemDropHandler = itemData => {
    const dropData = {
      itemData: itemData
    };
    this.processDroppedArt(dropData);
  };

  processDroppedArt(dropData) {
    const { file, uploadTask, itemData } = dropData;
    this.dragging = false;
    let intersect = this.checkForIntersecting();
    this.holderOver = intersect;
    if (this.currentWallOver || this.holderOver) {
      const addImageData = {
        itemData: itemData,
        file: file,
        side: this.currentSide,
        holderOver: this.holderOver,
        draggableImageRef: this.draggableImageRef,
        uploadTask: uploadTask
      };
      if (this.currentWallOver || this.holderOver.defaultArtMesh) {
        this.currentWallOver.addImageFile(addImageData);
      } else {
        this.holderOver.artMesh.parent.holderClass.addArt(file, uploadTask);
      }
    } //else it's straight in vault
    this.setState({
      draggableVaultElementActive: false,
      draggableVaultItem: null
    });
  }

  removeSpotlight(spotLight) {
    const lights = this.state.lights
    const index = lights.indexOf(spotLight);
    lights.splice(index, 1);
    this.setState({ lights: lights })
  }

  //tileclick handlers

  artClickHandler(item) {
    console.log("artClickHandler", item);
    if (this.state.selectingArt) {
      this.selectedArt(item)
    } else {
      this.setState({
        draggableVaultElementActive: true,
        draggableVaultItem: item
      });
      this.draggableImageRef = React.createRef();
      this.dragging = true;
    }
  }

  frameClickHandler(item) {
    console.log("frameClickHandler type", item);
    this.setState({ selectedTile: item });
  }

  floorTileCallback(item) {
    this.state.floor.resetMaterial();
    this.state.floor.floorTileCallback(item);
  }

  wallTileCallback(item) {
    this.setState({ selectedTile: item });
  }

  surroundingsTileCallback(item) {
    this.surroundings.surroundingsTileCallback(item);
  }

  selectingArtHandler = () => {
    this.setState({ selectingArt: !this.state.selectingArt })
  }

  selectedArt(item) {
    const desc = this.state.galleryDesc;
    desc.galleryImg = item;
    this.setState({ galleryDesc: desc })
    this.selectingArtHandler();
  }


  hoverArtMesh(artMesh) {
    // console.log("hoverArtMesh", artMesh, this.dragging);
    if (!this.dragging && !this.state.selectedTile) {
      console.log("show z", artMesh.parent.wallPos === 0)
      this.transformControls.showZ = artMesh.parent.wallPos === 0;
      this.transformControls.showX = artMesh.parent.wallPos === 1;
      this.transformControls.attach(artMesh);
      this.activeArtMesh = artMesh;
      this.transformControls2.showZ = artMesh.parent.wallPos === 0;
      this.transformControls2.showX = artMesh.parent.wallPos === 1;
      this.transformControls2.attach(artMesh);
    }
  }

  unhoverArtMesh() {
    if (!this.transformControls.dragging && !this.transformControls2.dragging) {
      this.detachTransformControls();
      this.activeArtMesh = null;
    }
  }
  deselectSpotlight() {
    this.transformControls.setMode("translate");
    this.setState({ selectedSpotlight: null });
    this.detachTransformControls();
    this.dragging = false;
  }

  detachTransformControls() {
    this.transformControls.detach();
    this.transformControls2.detach();
  }

  transformObjectChangeHandler() {
    // console.log("transformObjectChangeHandler");
    if (!this.objectChanged && this.activeArtMesh) {
      this.objectChanged = true;
      this.activeArtMesh.parent.holderClass.removeArtFrame();
    }
  }

  resetBuildingGallery() {
    this.setState(this.baseState);
    this.removeLights();
    this.removeWalls();

  }


  onEditDropdownChangeHandler = ({ galleryDesc, galleryData, id }) => {
    console.log("onEditDropdownChangeHandler", galleryDesc, galleryData, id);
    this.removeLights();
    // if (this.editGalleryId === id) return;
    this.editGalleryId = id;

    console.log("this.editGalleryId", this.editGalleryId);

    const { name, floorplan, walls, floor, lights, generalLight, surrounds } = galleryData;
    this.setState({ galleryTitle: name, floorplan: floorplan, plannerGallery: false, galleryDesc: galleryDesc, galleryId: id });

    this.floorPlan = floorplan.data;//FIXXXXX to state
    // disposeHierarchy(this.scene, () => this.loadGalleryToEdit());
    //need to check if need initial setup

    this.removeWalls();

    this.setEditFloor(floor);
    this.setEditWalls(walls);
    this.surroundings.surroundingsTileCallback(surrounds)

    generalLight && this.setEditGeneralLight(generalLight);
    this.setEditWallLights(lights);

    // this.animate();
    this.initialWallBuild(this.fadeInArt);
    // this.setupListeners();
    this.initialCameraAnimation();
    this.setSceneMeshes();
    this.setState({ plannerGallery: false })
  };

  setEditGeneralLight(generalLight) {
    console.log("generalLight", generalLight);
    if (generalLight) this.addGeneralLight(generalLight);
  }

  setEditWallLights(wallLights) {
    if (!wallLights) return;
    const lights = [];
    wallLights.forEach(light => {
      const options = light;
      options.builder = this;
      const newWallLight = new WallLight(options);
      lights.push(newWallLight);
    });
    this.setState({ lights: lights });
    console.log("wallLights", wallLights);
  }

  lightConeHelperSelected(helper) {
    console.log("selected Spotlight", this.state.selectedSpotlight);
    this.state.selectedSpotlight &&
      this.state.selectedSpotlight.controllerClass.deselectSpotlight();
    this.transformingMesh = helper;
    helper.controllerClass.selectHandler();
    this.dragging = true;
    this.setState({ selectedSpotlight: helper });
    this.transformControlsForMesh().attach(helper);
    // window.addEventListener("mousedown", this.lightHelperMousedownHandler);
  }
  lightHelperMousedownHandler = () => {
    console.log("lightHelperMousedownHandler");
    this.detachTransformControls();
  };

  transformControlsForMesh = () => {
    const meshName = this.transformingMesh.name;
    if (meshName === "LightConeHelper") {
      this.transformControls.showZ = true;
      this.transformControls.showX = true;
      this.transformControls.showY = true;
    }
    return this.transformControls;
  };
  setEditFloor(item) {
    this.state.floor.floorTileCallback(item);
  }

  fadeInArt = index => {
    this.state.wallEntities[index].fadeInArt();
  };

  elevatorInnerClickHandler = () => {//to handle deselecting if clickable tile wasn't clicked
    this.setState({ selectedTile: null })
  }

  removeWalls() {//nup
    // if (this.state.wallEntities.length > 0)
    //   this.state.wallEntities.forEach(item => {
    //     item.removeGroup();
    //   });
  }
  //**** SAVE  */
  saveGallery = () => {
    this.galleryData = {};
    console.log("saveGallery galleryData", this.galleryData);
    this.galleryData.floorplan = this.state.floorplan;
    this.galleryData.floor = this.state.floor.getExport();
    this.galleryData.walls = [];

    this.state.wallEntities.forEach(item => {
      this.galleryData.walls.push(item.getExport());
    });
    this.galleryData.lights = [];
    this.state.lights.forEach(item => {
      this.galleryData.lights.push(item.getExport());
    });

    this.galleryData.generalLight = this.state.generalLight.getExport();
    this.galleryData.surrounds = this.surroundings.getExport();

    return this.galleryData;
    // this.makeGalleryDbSave();
  };

  makeGalleryDbSave() {
    console.log("makeGalleryDbSave this.framesToSave", this.galleryData);
    this.props.firebase.storeGallery(this.galleryData, this.editGalleryId);
  }

  resetTranslatedArt() {
    this.transformOriginVector.copy(this.activeArtMesh.getWorldPosition());
    let options = {
      origin: this.transformOriginVector,
      direction: this.getTransformDirectionVector(this.activeArtMesh),
      includes: ["wallMesh"],
      distance: 10
    };
    let intersect0 = this.rayIntersectOptions(options);
    console.log("intersect0", intersect0);
    if (!intersect0) {
      this.removeDraggedArt();
      return;
    }
    let onWall = this.getWallFromIntersect(intersect0);
    console.log(
      "resetTranslatedArt this.activeArtMesh.parent.holderClass.wall",
      this.activeArtMesh.parent.holderClass.wall
    );
    this.activeArtMesh.parent.holderClass.wall.removeFrame(
      this.activeArtMesh.parent.holderClass,
      onWall.wallSideOver
    );
    onWall.wallOver.positionMovedHolder(
      this.activeArtMesh,
      onWall.wallSideOver
    );

    this.objectChanged = false;
  }

  resetScaledArt() {
    this.activeArtMesh.parent.holderClass.rescale(); /// need to fix export for rescale
    this.objectChanged = false;
  }

  transformMouseUpHandler(event) {
    console.log("transformMouseUpHandler", event.mode)
    if (event.mode === "translate" && this.objectChanged) {
      this.resetTranslatedArt();
    }
    if (event.mode === "scale" && this.objectChanged) {
      this.resetScaledArt();
    }
  }

  removeDraggedArt() {
    this.detachTransformControls();
    this.activeArtMesh.parent.holderClass.removeFromWall();
    this.activeArtMesh.parent.parent.remove(this.activeArtMesh.parent);
  }

  getWallFromIntersect(intersect) {
    const intersectedWallIndex = this.state.wallMeshes.indexOf(intersect.object);
    let side = null;
    const faceIndex = intersect.faceIndex;
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
    let intersectedData = {
      wallOver: this.state.wallEntities[intersectedWallIndex] || null,
      wallSideOver: side
      // voxelClicked: voxelClicked
    };

    return intersectedData;
  }

  addTransformControls() {
    this.transformControls = new TransformControls(
      this.camera,
      this.mount,
      this
    );

    this.transformControls2 = new TransformControls(
      this.camera,
      this.mount,
      this
    );

    this.transformControls2.setMode("scale");
    this.scene.add(this.transformControls);
    this.scene.add(this.transformControls2);

    this.transformControls.addEventListener("mouseUp", event => {
      this.transformMouseUpHandler(event);
    });
    this.transformControls2.addEventListener("mouseUp", event => {
      this.transformMouseUpHandler(event);
    });

    this.transformControls.addEventListener("objectChange", event => {
      this.transformObjectChangeHandler(event);
    });
    this.transformControls2.addEventListener("objectChange", event => {
      this.transformObjectChangeHandler(event);
    });
  }

  getTransformDirectionVector(transformingObject) {
    let rotationMatrix = new THREE.Matrix4();
    this.transformDirectionVector.set(0, 0, -1);
    if (transformingObject.parent.wallPos === 0) {
      if (transformingObject.parent.side === "back") {
        rotationMatrix.makeRotationY(degreesToRadians(270));
      } else {
        rotationMatrix.makeRotationY(degreesToRadians(90));
      }
    } else if (transformingObject.parent.side === "back") {
      rotationMatrix.makeRotationY(degreesToRadians(180));
    }
    this.transformDirectionVector.applyMatrix4(rotationMatrix);
    return this.transformDirectionVector;
  }

  checkTransformBounds = (transformingObject, newPos, testScale) => {
    let tempScalar = testScale || transformingObject.scale;
    this.transformOriginVector.copy(newPos);
    let rotationMatrix = new THREE.Matrix4();
    this.transformDirectionVector.set(0, 0, -1);
    let buffer = 0;
    const { height, width } = transformingObject.geometry.parameters;

    let halfWidth = (width * tempScalar.x) / 2 + buffer;
    let halfHeight = (height * tempScalar.y) / 2 + buffer;

    let topLeftCnr = new THREE.Vector3(-halfWidth, halfHeight, 5);
    let topRightCnr = new THREE.Vector3(halfWidth, halfHeight, 5);
    let bottomLeftCnr = new THREE.Vector3(-halfWidth, -halfHeight, 5);
    let bottomRightCnr = new THREE.Vector3(halfWidth, -halfHeight, 5);

    if (transformingObject.parent.wallPos === 0) {
      if (transformingObject.parent.side === "back") {
        rotationMatrix.makeRotationY(degreesToRadians(270));
      } else {
        rotationMatrix.makeRotationY(degreesToRadians(90));
      }
    } else if (transformingObject.parent.side === "back") {
      rotationMatrix.makeRotationY(degreesToRadians(180));
    }
    this.transformDirectionVector.applyMatrix4(rotationMatrix);
    topLeftCnr.applyMatrix4(rotationMatrix);
    topRightCnr.applyMatrix4(rotationMatrix);
    bottomLeftCnr.applyMatrix4(rotationMatrix);
    bottomRightCnr.applyMatrix4(rotationMatrix);

    let buffers = [0];

    let fourCornersAr = [];
    buffers.forEach(buffer => {
      fourCornersAr.push(
        topLeftCnr,
        topRightCnr,
        bottomLeftCnr,
        bottomRightCnr
      );
    });

    let canMove = 0;
    fourCornersAr.forEach(cnr => {
      this.transformOriginVector_temp.copy(this.transformOriginVector).add(cnr);
      this.transformDirectionRay.set(
        this.transformOriginVector_temp,
        this.transformDirectionVector
      );
      //uncomment these for helper
      // let transformDirectionArrow = new THREE.ArrowHelper(
      //   this.transformDirectionVector,
      //   this.transformOriginVector_temp,
      //   10,
      //   Math.random() * 0xffffff
      // );
      // this.scene.add(transformDirectionArrow);

      let intersect = this.rayIntersectObject(
        this.transformDirectionRay,
        10,
        true
      );
      intersect &&
        intersect.object.name === "wallMesh" &&
        intersect.object.name !== "artMesh" &&
        canMove++;
    });
    return canMove === fourCornersAr.length;
  };

  setupRaycaster() {
    this.raycaster = new THREE.Raycaster();
  }

  checkForIntersecting(options) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.rayIntersectObject(this.raycaster, 1000);
    if (!intersects) {
      return false;
    }
    let intersectedData = {};
    let intersect0 = intersects.object;
    if (intersect0.name === "artMesh" || intersect0.name === "defaultArtMesh") {
      this.hoverOverObject = intersect0;
      intersectedData[intersect0.name] = intersect0;
    }

    if (intersect0.name === "LightConeHelper") {
      this.hoverOverObject = intersect0;
      intersectedData[intersect0.name] = intersect0;
    }
    //check if it intersects floors
    const intersectedWallIndex = this.state.wallMeshes.indexOf(intersect0);

    let side = null;
    const faceIndex = intersects.faceIndex;
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
      intersectedData = {
        wallOver: this.state.wallEntities[intersectedWallIndex] || null,
        wallSideOver: side
        // voxelClicked: voxelClicked
      };
    }

    return intersectedData;
  }

  //scene setup and animation
  setUpScene() {

    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.setState({ width: width, height: height });
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
      // shadowMapEnabled: true
    });
    // this.renderer.shadowMap.enabled = true;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    // this.renderer.shadowMap.enabled = true;

    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    // this.addGeneralLight();
    // this.addBox();
    this.renderer.render(this.scene, this.camera);
    // this.camera.position.z = 5;
    this.setFloor(); //move to didMount... but needs to be after editWalls // remove previous
    this.setSurroundings();
    this.addTransformControls();
    this.setupFlaneurControls();
    this.animate();
    this.setupListeners();

  }

  // SKYDOME
  addSkyDome() {
    var vertexShader = document.getElementById("vertexShader").textContent;
    var fragmentShader = document.getElementById("fragmentShader").textContent;
    console.log("vertexShader", vertexShader);
    var uniforms = {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };
    // uniforms["topColor"].value.copy(this.generalLight.color); // this was turning the sky off
    // console.log("uniforms topColor", uniforms, this.generalLight.color);
    this.scene.fog = new THREE.Fog(this.scene.background, 1, 5000);

    this.scene.fog.color.copy(uniforms["bottomColor"].value);

    var skyGeo = new THREE.SphereBufferGeometry(4000, 32, 15);
    var skyMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.BackSide
    });

    var sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
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

  //***** LIGHTS

  removeLights() {// nup
    console.log("removeLights this.lights", this.lights, this.lights.length)
    // while (this.lights.length) {
    //   this.lights[0].removeSpotlight();
    // }
    // if (this.generalLightController) {
    //   this.setState({ generalLight: null });
    //   this.generalLightController.removeLight();
    // }
  }

  addLightToArray(light) {
    var spotlightPos = light.getWorldPosition();
    let { x, y, z } = spotlightPos;
    const spotlightPosArr = [x, y, z];
    console.log("spotlightPosArr", spotlightPosArr);
    const targetPos = light.target.position;
    const targetAr = [targetPos.x, targetPos.y, targetPos.z];
    console.log("targetAr", targetAr);

    const options = {
      position: spotlightPosArr,
      builder: this,
      target: targetAr
    };
    const newWallLight = new WallLight(options);
    this.setState({ lights: [...this.state.lights, newWallLight] })
    // this.lights.push(newWallLight);

    // this.lights.push(light);
    console.log("this.lights", this.state.lights);
  }

  addGeneralLight(options = {}) {
    // Add the generalLight light to the scene
    options.builder = this;
    const generalLight = new GeneralLight(options);
    this.setState({ generalLight: generalLight });
    this.scene.add(generalLight.getLight());
  }

  //process floorplan
  processFloorplan() {
    console.log("processFloorplan", this.props);
    if (this.props.location.state) {
      // if plan is provided by router
      this.props.firebase.getPlanByKey(
        this.props.location.state.plan,
        this.getPlanCallback
      );
    } else {
      console.log("no state in location");
    }
  }

  getPlanCallback = snapshot => {
    console.log("snapshot", snapshot.val());
    const floorSnapshot = snapshot.val();
    this.floorplanSelectedHandler(floorSnapshot)
  };

  rebuild = (data) => {
    console.log("rebuild", data)
    // this.floorPlan = data.data;
    this.setState({ floorplan: data }, this.setWalls);//?
    // this.setWalls();
    this.setFloor();
    // this.addHelperGrid();
    this.addGeneralLight();

    // this.animate();
    // this.initialWallBuild();
    // this.setupListeners();
    this.initialCameraAnimation();
    this.setSceneMeshes();
    let returnVal = this.props.firebase.pushAsset("users/" + this.props.firebase.currentUID + "/galleryDesc/")
    returnVal.then(snapshot => {
      this.setState({ galleryId: snapshot.key });
    })
  };

  floorplanSelectedHandler = (data) => {
    // const floorSnapshot = snapshot.val();
    console.log("floorplanSelectedHandler", data)
    this.emptyScene();
    this.setState(this.baseState, () => this.rebuild(data));
    // debugger;

  }

  disposeHierarchy(node, callback) {
    for (var i = node.children.length - 1; i >= 0; i--) {
      var child = node.children[i];
      this.disposeHierarchy(child, this.disposeNode);
      callback(child);
    }
  }

  disposeNode(parentObject) {
    parentObject.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        if (node.geometry) {
          node.geometry.dispose();
        }

        if (node.material) {
          //console.log("node.material", node.material);
          if (
            node.material instanceof THREE.MeshFaceMaterial ||
            node.material instanceof THREE.MultiMaterial
          ) {
            node.material.materials.forEach(function (mtrl, idx) {
              if (mtrl.map) mtrl.map.dispose();
              if (mtrl.lightMap) mtrl.lightMap.dispose();
              if (mtrl.bumpMap) mtrl.bumpMap.dispose();
              if (mtrl.normalMap) mtrl.normalMap.dispose();
              if (mtrl.specularMap) mtrl.specularMap.dispose();
              if (mtrl.envMap) mtrl.envMap.dispose();

              mtrl.dispose(); // disposes any programs associated with the material
            });
          } else {
            if (node.material.map) node.material.map.dispose();
            if (node.material.lightMap) node.material.lightMap.dispose();
            if (node.material.bumpMap) node.material.bumpMap.dispose();
            if (node.material.normalMap) node.material.normalMap.dispose();
            if (node.material.specularMap) node.material.specularMap.dispose();
            if (node.material.envMap) node.material.envMap.dispose();

            node.material.dispose(); // disposes any programs associated with the material
          }
        }
      }
    });
  }
  disposeCallback = item => {
    console.log("disposeCallback", item);
    item.remove();
  };


  emptyScene() {
    const node = this.scene;

    for (var i = node.children.length - 1; i >= 0; i--) {
      var child = node.children[i];
      if (sceneHelperObjects.indexOf(child.name) === -1) this.scene.remove(child);
    }
    // this.disposeHierarchy(this.scene, this.disposeCallback);
    console.log("this.scene", this.scene.children)

    return;
    // const cleanMaterial = material => {
    //   console.log('dispose material!')
    //   material.dispose()

    //   // dispose textures
    //   for (const key of Object.keys(material)) {
    //     const value = material[key]
    //     if (value && typeof value === 'object' && 'minFilter' in value) {
    //       console.log('dispose texture!')
    //       value.dispose()
    //     }
    //   }
    // }
    // this.scene.traverse(object => {
    //   if (!object.isMesh) return

    //   console.log('dispose geometry!')
    //   object.geometry.dispose()

    //   if (object.material.isMaterial) {
    //     cleanMaterial(object.material)
    //   } else {
    //     // an array of materials
    //     for (const material of object.material) cleanMaterial(material)
    //   }
    // })


  }

  //set objects

  setWalls() {
    const floorplan = this.state.floorplan.data;
    this.voxelsX = floorplan.length;
    this.voxelsY = floorplan[0].length;
    const wallEntities = [];
    for (let i = 0; i < this.voxelsX; i++) {
      for (let j = 0; j < this.voxelsY; j++) {
        floorplan[i][j].walls.forEach((item, index) => {
          if (item) {
            const options = { x: i, y: j, pos: index, builder: this };
            wallEntities.push(new WallObject(options));
          }
        });
      }
    }
    this.setState({ wallEntities: wallEntities, wallMeshes: wallEntities.map(item => item.getMesh()) }, this.initialWallBuild);
    console.log("setWalls floorplan wallEntities", wallEntities);
  }

  setEditWalls(walls) {
    this.voxelsX = this.floorPlan.length;
    this.voxelsY = this.floorPlan[0].length;
    const wallEntities = [];
    walls.forEach(wall => {
      const { col, row, pos, sides, texture } = wall;
      const options = { x: col, y: row, pos: pos, builder: this, texture: texture };
      const newWall = new WallObject(options);
      console.log("newWall", newWall)
      if (sides) newWall.addSidesFromData(sides);
      wallEntities.push(newWall);
    });
    this.setState({ wallEntities: wallEntities });
    this.setState({ wallEntities: wallEntities, wallMeshes: wallEntities.map(item => item.getMesh()) });

    console.log("setEditWalls wallEntities", wallEntities);
  }

  setFloor() {
    if (!this.voxelsX) {
      this.voxelsX = 16;
      this.voxelsY = 12;
    }
    this.gridWidth = this.voxelsX * wallWidth;
    this.gridDepth = this.voxelsY * wallWidth;
    const floor = new Floor({ builder: this });
    this.setState({ floor: floor });
  }

  setSurroundings() {

    this.surroundings = new Surroundings(this);
  }

  initialWallBuild(done) {
    console.log("initialWallBuild this.state.wallEntities", this.state.wallEntities);
    // this.addSkyDome(); //??
    this.state.wallEntities.forEach((item, index) => {
      // console.log("initialWallBuild wall", item, done);
      item.initialAnimateBuild(index, done);
    });
  }

  setSceneMeshes() {
    const meshesInScene = [];
    this.scene.traverse(node => {
      if (node instanceof THREE.Mesh) {
        // if (node.objecttype !== )
        meshesInScene.push(node);
      }
    });
    this.setState({ meshesInScene: meshesInScene })
  }

  rayIntersect(ray, distance) {
    //used by flaneur controls
    // let collidableObjects = this.state.wallEntities.map(item => item.getMesh()); //used for raycaster THIS SEEMS TOO SLOW
    var intersects = ray.intersectObjects(this.state.wallMeshes);
    for (var i = 0; i < intersects.length; i++) {
      // Check if there's a collision
      if (intersects[i].distance < distance) {
        console.log("collide");
        return true;
      }
    }
    return false;
  }

  rayIntersectOptions({ origin, direction, includes, distance }) {
    this.scene.updateMatrixWorld();
    this.raycaster.set(origin, direction);
    //uncomment these lines for help
    // let transformDirectionArrow = new THREE.ArrowHelper(
    //   direction,
    //   origin,
    //   10,
    //   Math.random() * 0xffffff
    // );
    // this.scene.add(transformDirectionArrow);

    let all = this.raycaster.intersectObjects(this.state.meshesInScene);
    // console.log("all intersects", all);
    let intersects = all.filter(
      node =>
        node.distance < distance && includes.indexOf(node.object.name) !== -1
    );

    return intersects[0] || null;
  }

  rayIntersectObject(ray, distance, excludeCurrent) {
    this.scene.updateMatrixWorld();
    let all = ray.intersectObjects(this.state.meshesInScene);
    // console.log("rayIntersectObject all", all, this.state.meshesInScene);
    let intersects;
    if (excludeCurrent) {
      intersects = all.filter(
        node =>
          node.distance < distance &&
          ((node.object.name === "artMesh" &&
            node.object !== this.activeArtMesh) ||
            node.object.name === "wallMesh")
      );
    } else {
      intersects = all.filter(
        node =>
          node.distance < distance &&
          (node.object.name === "artMesh" ||
            node.object.name === "wallMesh" ||
            node.object.name === "defaultArtMesh" ||
            node.object.name === "frameMesh" ||
            node.object.name === "LightConeHelper")
      );
    }

    return intersects[0] || null;
  }
  addSpotlightHandler() {
    let cameraPosition = this.camera.getWorldPosition();
    let cameraDirection = this.camera.getWorldDirection();
    var geometry = new THREE.BoxGeometry(5, 5, 5);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    cube.name = "cubeHelper";

    let spotlightDistanceFromCamera = 70;
    let targetDistanceFromCamera = 130;

    console.log(
      "cameraPosition, cameraDirection",
      cameraPosition,
      cameraDirection
    );

    var spotlightPos = new THREE.Vector3();
    spotlightPos.addVectors(
      cameraPosition,
      cameraDirection.clone().multiplyScalar(spotlightDistanceFromCamera)
    );
    let { x, z } = spotlightPos;//y
    const spotlightPosArr = [x, 60, z];
    console.log("spotlightPosArr", spotlightPosArr);

    const targetPos = new THREE.Vector3();
    targetPos.addVectors(
      cameraPosition,
      cameraDirection.clone().multiplyScalar(targetDistanceFromCamera)
    );
    const targetAr = [targetPos.x, 35, targetPos.z];
    console.log("targetAr", targetAr);

    const options = {
      position: spotlightPosArr,
      builder: this,
      target: targetAr
    };
    const newWallLight = new WallLight(options);
    this.setState({ lights: [...this.state.lights, newWallLight] });//lights.push(newWallLight
    newWallLight.displayHelper();
  }

  restoreDefaultFloor = () => {
    this.state.floor.resetMaterial();
  }

  getVaultFloorInstance = (props) => {
    console.log("getVaultFloorInstance", props)
    return <VaultFloor {...props}
      selectedTile={this.state.selectedTile}
    />
  }



  getElevatorFloors() {
    this.lightFloor = (
      <LightFloor
        lights={this.state.lights}
        selectedSpotlight={this.state.selectedSpotlight}
        generalLight={this.state.generalLight}
        addSpotlightHandler={() => this.addSpotlightHandler()}
      // refreshLightFloor={this.state.refreshLightFloor}
      />
    );
    let floors = {
      0: {
        name: "Art",
        floorComponent: this.getVaultFloorInstance,
        refPath: "users/" + this.props.firebase.currentUID + "/art",
        level: 0,
        tileCallback: this.artClickHandler.bind(this),
        draggable: true,
        addUploader: true,
        actions: ["delete", "edit"]
      },
      1: {
        name: "Frames",
        floorComponent: this.getVaultFloorInstance,
        refPath: "users/" + this.props.firebase.currentUID + "/frame",
        level: 1,
        tileCallback: this.frameClickHandler.bind(this),
        selectable: true,
        addMaster: true,
        selectableRestoreDefault: { color: 0x666666 }
      },
      2: {
        name: "Floors",
        floorComponent: this.getVaultFloorInstance,
        refPath: "users/" + this.props.firebase.currentUID + "/floor",
        level: 2,
        tileCallback: this.floorTileCallback.bind(this),
        addMaster: true,
        restoreDefault: this.restoreDefaultFloor.bind(this)
      },
      3: {
        name: "Walls",
        floorComponent: this.getVaultFloorInstance,
        refPath: "users/" + this.props.firebase.currentUID + "/wall",
        level: 3,
        tileCallback: this.wallTileCallback.bind(this),
        selectable: true,
        addMaster: true,
        selectableRestoreDefault: {color: 0xe1f5fe}

      },
      4: {
        name: "Lights",
        floorComponent: this.lightFloor,
        builder: this,
        level: 4,
      },
      5: {
        name: "Surrounds",
        floorComponent: this.getVaultFloorInstance,
        refPath: "users/" + this.props.firebase.currentUID + "/surrounds",
        level: 5,
        tileCallback: this.surroundingsTileCallback.bind(this),
        addMaster: true

      }
    };
    return floors;
  }

  floorCalledCallback = floor => {
    console.log("floorCalledCallback", floor);
    if (this.currentFloor === "Lights") {
      this.removeLightsHelpers();
    }
    this.currentFloor = floor.name;
    if (this.currentFloor === "Lights") {
      this.addLightHelpers();
    }
  };

  addLightHelpers() {
    this.state.lights.forEach(light => {
      light.displayHelper();
    });
  }
  removeLightsHelpers() {
    console.log("removeLightsHelpers")
    this.detachTransformControls();

    this.setState({ selectedSpotlight: null }, () => {
      this.state.lights.forEach(light => {
        light.undisplayHelper();
      });
    });

  }



  animate() {
    // if (this.flaneurControls) {
    this.flaneurControls.update(this.clock.getDelta());
    // }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
    // this.stats && this.stats.update();
  }
  render() {
    const { galleryId, floorplan } = this.state;
    return (
      <ErrorBoundary>
        {(this.props.firebase.currentUID) &&
          (<BuilderHeader
            onEditDropdownChangeHandler={this.onEditDropdownChangeHandler}
            saveGallery={this.saveGallery}
            galleryDesc={this.state.galleryDesc}
            setSelectingArt={this.selectingArtHandler}
            selectingArt={this.state.selectingArt}
            plannerGallery={this.state.plannerGallery}
            galleryId={galleryId}
            floorplan={floorplan}
            floorplanSelectedHandler={(data) => this.floorplanSelectedHandler(data)} />)}
        <MainCanvas refer={mount => (this.mount = mount)} />
        {this.state.draggableVaultElementActive && (
          <Draggable
            itemDragover={this.dragOverHandler}
            itemData={this.state.draggableVaultItem}
            itemDrop={(item, uploadTask) =>
              this.itemDropHandler(item, uploadTask)
            }
          >
            <DraggableVaultElement
              ref={this.draggableImageRef}
              imgSrc={this.state.draggableVaultItem.thumb || this.state.draggableVaultItem.url}
            />
          </Draggable>
        )}

        {this.props.firebase.currentUID && (
          <Elevator
            name="Vault"
            floors={this.getElevatorFloors()}
            floorCalledCallback={this.floorCalledCallback}
            elevatorInnerClickHandler={this.elevatorInnerClickHandler}
          />
        )}
        {this.mount && <Uploader
          fileDragover={this.dragOverHandler}
          fileDragLeaveHandler={this.fileDragLeaveHandler}
          fileDrop={(item, uploadTask) =>
            this.fileDropHandler(item, uploadTask)
          }
          wallOver={this.state.wallOver}
          type="art"
          validation="image"
          domElement={this.mount}
        />}
      </ErrorBoundary>
    );
  }
}



const DraggableVaultElement = React.forwardRef((props, ref) => (
  <div className="draggable-vault-element">
    <img src={props.imgSrc} style={{ width: "140px" }} ref={ref} alt="" />
  </div>
));

const MainCanvas = props => {
  return <div id="boardCanvas" ref={mount => props.refer(mount)} />;
};

export default withAuthentication(withFirebase(Builder));
