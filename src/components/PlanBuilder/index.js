import React, { Component } from "react";
import * as THREE from "three";
import GLTFExporter from "three-gltf-exporter";
import Uploader from "../Uploader";
import "../../css/builder.css";
// import { withFirebase } from "../Firebase";
import WallObject from "./WallObject";
import FlaneurControls from "./FlaneurControls";
import GeneralLight from "./GeneralLight";
import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";

import TilesFloor, { floorData } from "./TilesFloor";

import VaultFloor from "./VaultFloor";

import Floor from "./Floor";

import Elevator from "../Elevator";

import ErrorBoundary from "../ErrorBoundary";

import { TransformControls } from "./TransformControls";

import Draggable from "./Draggable";

import GalleryTitle from "./GalleryTitle";

const wallWidth = 20;

const degreesToRadians = degrees => {
  return (degrees * Math.PI) / 180;
};

class Builder extends Component {
  state = {
    floorplanTitle: "",
    wallEntities: [],
    width: null,
    height: null,
    authUser: null,
    draggableVaultElementActive: null,
    draggableVaultItem: null,
    galleryTitle: ""
  };
  constructor(props) {
    super(props);
    this.initialCameraHeight = 245;
    this.cameraZAfterInitialAnimation = 260;
    this.initialAnimationTime = 2000;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();
    this.wallMeshes = [];
    this.floorMesh = null;
    // this.setUpGui();
    this.transformOriginVector = new THREE.Vector3();
    this.transformOriginVector_temp = new THREE.Vector3();
    this.transformDirectionVector = new THREE.Vector3();
    this.transformDirectionRay = new THREE.Raycaster();

    this.gltfExporter = new GLTFExporter();
  }
  componentDidMount() {
    this.setUpScene();
    // this.processFloorplan();
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
    this.mount.addEventListener("mousemove", e => this.onMouseMove(e), false);
    this.mount.addEventListener("mousedown", e => this.onMouseDown(e), false);
    // window.addEventListener("resize", () => this.onWindowResize(), false);
    this.setupFlaneurControls();
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
        for (var key in intersectedData) {
          artHolder = intersectedData[key].parent;
        }
      }
      if (this.state.selectedTile && artHolder) {
        console.log("selectedTile", this.state.selectedTile);
        const frameData = {
          selectedTile: this.state.selectedTile
        };
        artHolder.setFrameColor(frameData);
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
    this.dragging = false;
    let intersect = this.checkForIntersecting();
    this.holderOver = intersect;
    if (this.currentWallOver || this.holderOver) {
      const addImageData = {
        file: file,
        side: this.currentSide,
        holderOver: this.holderOver,
        uploadTask: uploadTask
      };
      if (this.currentWallOver || this.holderOver.defaultArtMesh) {
        this.currentWallOver.addImageFile(addImageData);
      } else {
        this.holderOver.artMesh.parent.holderClass.addArt(file, uploadTask);
      }
    } //else it's straight in vault
  };

  itemDropHandler = itemData => {
    this.dragging = false;
    let intersect = this.checkForIntersecting();
    this.holderOver = intersect;
    if (this.currentWallOver || this.holderOver) {
      const addImageData = {
        itemData: itemData,
        side: this.currentSide,
        holderOver: this.holderOver,
        draggableImageRef: this.draggableImageRef
        // uploadTask: uploadTask
      };
      if (this.currentWallOver || this.holderOver.defaultArtMesh) {
        console.log("add addImageFile", addImageData);
        this.currentWallOver.addImageFile(addImageData);
      } else {
        this.holderOver.artMesh.parent.holderClass.addArt(addImageData);
      }
    }
    this.setState({
      draggableVaultElementActive: false,
      draggableVaultItem: null
    });
  };

  floorTileCallback(item) {
    this.floor.floorTileCallback(item);
  }

  frameClickHandler(item) {
    // console.log("type", item.type, item.color);
    this.setState({ selectedTile: item });
  }

  artClickHandler(item, draggableVaultElement) {
    console.log("artClickHandler", item);
    this.setState({
      draggableVaultElementActive: true,
      draggableVaultItem: item
    });
    this.draggableImageRef = React.createRef();
    this.dragging = true;
  }

  hoverArtMesh(artMesh) {
    console.log("hoverArtMesh", artMesh, this.dragging);
    if (!this.dragging) {
      // this.setSceneMeshes();
      this.transformControls.showZ = artMesh.parent.wallPos === 0;
      this.transformControls.showX = artMesh.parent.wallPos === 1;
      this.transformControls.attach(artMesh);
      this.activeArtMesh = artMesh;

      this.transformControls2.showZ = artMesh.parent.wallPos === 0;
      this.transformControls2.showX = artMesh.parent.wallPos === 1;
      // this.transformControls2.showY = true;

      this.transformControls2.attach(artMesh);
    }
  }

  unhoverArtMesh(artMesh) {
    if (!this.transformControls.dragging && !this.transformControls2.dragging) {
      this.transformControls.detach();
      this.transformControls2.detach();
      this.activeArtMesh = null;
    }
  }

  onTitleChangeHandler = ({ target }) => {
    this.setState({ galleryTitle: target.value });
  };

  saveGallery = () => {
    console.log("wall entities", this.state.wallEntities);
    this.galleryData = {};
    this.galleryData.name = this.state.galleryTitle;
    this.galleryData.nameEncoded = encodeURIComponent(this.state.galleryTitle);

    this.gltfExporter.parse(this.scene, gltf => {
      this.props.firebase.storeGalleryGltf(this.galleryData, gltf);
    });

    // debugger;
    return;
    // this.makeGallerySave()

    this.galleryData.floorplan = this.state.floorplan;
    this.galleryData.wallData = [];

    this.state.wallEntities.forEach(item => {
      const wall = (({ col, row, pos, height, opacity }) => ({
        col,
        row,
        pos,
        height,
        opacity
      }))(item);
      wall.sides = {};
      this.framesToSave = [];
      this.galleryData.wallData.push(wall);
      this.state.wallEntities.forEach((item, wallIndex) => {
        const wall = (({ col, row, pos, height, opacity }) => ({
          col,
          row,
          pos,
          height,
          opacity
        }))(item);

        Object.entries(item.sides).forEach((value, index) => {
          const side = value[1];

          console.log("sides", side, index);
          const sideFrames = side.frames;
          sideFrames.forEach((item, wallIndex) => {
            this.framesToSave.push(item);
            console.log("item", item);
          });
          console.log(value[0]);
          // wall.sides[value[0]] = frames;
        });

        // console.log("this.scene for export", this.scene);
      });
    });
    console.log("finished loops galleryData", this.galleryData);
    console.log("this.framesToSave", this.framesToSave);
    this.framesToResolve = [];
    this.framesToSave.forEach((item, index2) => {
      this.gltfExporter.parse(item.group, gltf => {
        // gltf.accessors.forEach(item => (item.byteOffset = 0));
        gltf = JSON.parse(
          JSON.stringify(gltf, function(k, v) {
            if (v === undefined) {
              return null;
            }
            return v;
          })
        );
        this.framesToSave[index2] = { gltf: gltf };
        this.framesToResolve.push(Promise.resolve(gltf));
        if (this.framesToSave.length === this.framesToResolve.length) {
          Promise.all(this.framesToResolve).then(
            this.makeGalleryDbSave.bind(this)
          );
        }
      });

      // this.props.firebase.storeGallery(galleryData);
    });
    // this.props.firebase.storeGallery(galleryData);
  };

  makeGalleryDbSave(galleryData) {
    this.galleryData.frameGroups = this.framesToSave;
    console.log(
      "makeGalleryDbSave this.framesToSave",
      this.galleryData,
      this.framesToSave
    );
    this.props.firebase.storeGallery(this.galleryData);
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
    if (!intersect0) return;
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
    this.activeArtMesh.parent.holderClass.rescale();
    this.objectChanged = false;
  }

  transformMouseUpHandler(event) {
    const intersect = this.checkForIntersecting();
    if (!intersect) this.unhoverArtMesh();
    if (event.mode === "translate" && this.objectChanged) {
      this.resetTranslatedArt();
    }
    if (event.mode === "scale" && this.objectChanged) {
      this.resetScaledArt();
    }
  }

  getWallFromIntersect(intersect) {
    const intersectedWallIndex = this.wallMeshes.indexOf(intersect.object);
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
      wallOver: this.wallEntities[intersectedWallIndex] || null,
      wallSideOver: side
      // voxelClicked: voxelClicked
    };

    return intersectedData;
  }

  transformObjectChangeHandler() {
    if (!this.objectChanged) {
      this.objectChanged = true;
      this.activeArtMesh.parent.holderClass.removeArtFrame();
    }
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
      // console.log("intersect in check ", intersect);
      // intersect &&
      //   console.log("intersect.object.name", intersect, intersect.object.name);
    });
    // if (canMove !== fourCornersAr.length) debugger;
    return canMove === fourCornersAr.length;
  };

  setupRaycaster() {
    this.raycaster = new THREE.Raycaster();
  }

  checkForIntersecting(options) {
    this.camera.updateMatrixWorld();
    this.scene.updateMatrixWorld();
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.rayIntersectObject(this.raycaster, 1000);
    // console.log("checkForIntersecting intersects", intersects);
    if (!intersects) {
      // console.log("no intersects");
      return false;
    }

    let intersectedData = {};

    let intersect0 = intersects.object;
    if (intersect0.name === "artMesh" || intersect0.name === "defaultArtMesh") {
      this.hoverOverObject = intersect0;
      intersectedData[intersect0.name] = intersect0;
    }
    //check if it intersects floors
    const intersectedWallIndex = this.wallMeshes.indexOf(intersect0);

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
      // if (this.state.selectedTile) {
      //   console.log("selectedTile", this.state.selectedTile);
      //   this.wallEntities[intersectedWallIndex].setFrameColor(
      //     this.state.selectedTile,
      //     side
      //   );
      // }
      intersectedData = {
        wallOver: this.wallEntities[intersectedWallIndex] || null,
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
    console.log("processFloorplan", this.props);
    if (this.props.location.state) {
      // if plan is provided by router
      this.props.firebase.getPlanByKey(
        this.props.location.state.plan,
        this.getPlanCallback.bind(this)
      );
    } else {
      console.log("no state in location");
    }
  }

  getPlanCallback = snapshot => {
    console.log("snapshot", snapshot.val());
    const floorSnapshot = snapshot.val();
    this.floorPlan = floorSnapshot.data;
    this.setState({ floorplan: floorSnapshot });
    this.setWalls();
    this.setFloor();
    // this.addHelperGrid();
    // this.renderRenderer();
    this.animate();
    this.initialWallBuild();
    this.setupListeners();
    this.initialCameraAnimation();
    this.setSceneMeshes();
    this.addTransformControls();
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
    this.setState({ wallEntities: this.wallEntities });
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

  setSceneMeshes() {
    this.meshesInScene = [];
    this.scene.traverse(node => {
      if (node instanceof THREE.Mesh) {
        // insert your code here, for example:
        // if (node.objecttype !== )
        this.meshesInScene.push(node);
      }
    });

    // console.log("this.meshesInScene", this.meshesInScene);
  }

  rayIntersect(ray, distance) {
    //used by flaneur controls
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

  rayIntersectOptions({ origin, direction, includes, distance }) {
    this.scene.updateMatrixWorld();
    this.raycaster.set(origin, direction);

    let transformDirectionArrow = new THREE.ArrowHelper(
      direction,
      origin,
      10,
      Math.random() * 0xffffff
    );
    // this.scene.add(transformDirectionArrow);

    let all = this.raycaster.intersectObjects(this.meshesInScene);
    // console.log("all intersects", all);
    let intersects = all.filter(
      node =>
        node.distance < distance && includes.indexOf(node.object.name) !== -1
    );

    return intersects[0] || null;
  }

  rayIntersectObject(ray, distance, excludeCurrent) {
    this.scene.updateMatrixWorld();
    // console.log("this.meshesInScene", this.meshesInScene);
    let all = ray.intersectObjects(this.meshesInScene);
    // console.log("all", all);
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
            node.object.name === "frameMesh")
      );
    }

    return intersects[0] || null;
  }

  getElevatorFloors() {
    let floors = {
      0: {
        name: "Art",
        y: 470,
        floorComponent: VaultFloor,
        refPath: "users/" + this.props.firebase.currentUID + "/art",
        level: 2,
        tileCallback: this.artClickHandler.bind(this),
        draggable: true
      },
      1: {
        name: "Frames",
        y: 0,
        floorComponent: VaultFloor,
        refPath: "master/frametiles",
        level: 0,
        tileCallback: this.frameClickHandler.bind(this) //to do
      },
      2: {
        name: "Floor surfaces",
        y: 235,
        floorComponent: VaultFloor,
        refPath: "master/floortiles",
        level: 1,
        tileCallback: this.floorTileCallback.bind(this)
      }
    };
    return floors;
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
  // (<Draggable><DraggableVaultElement /></<Draggable>)
  render() {
    console.log("render planner", this.state.draggableVaultElement);
    return (
      <ErrorBoundary>
        <div className="floorplan-title">
          <GalleryTitle
            content={this.state.galleryTitle}
            onTitleChangeHandler={this.onTitleChangeHandler}
          />
          <SaveButton onClick={this.saveGallery} />
        </div>
        <h3>Floorplan: {this.state.floorplan && this.state.floorplan.title}</h3>
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
              imgSrc={this.state.draggableVaultItem.url}
            />
          </Draggable>
        )}

        {this.props.firebase.currentUID && (
          <Elevator name="Vault" floors={this.getElevatorFloors()} />
        )}
        <Uploader
          fileDragover={this.dragOverHandler}
          fileDragLeaveHandler={this.fileDragLeaveHandler}
          fileDrop={(item, uploadTask) =>
            this.fileDropHandler(item, uploadTask)
          }
          wallOver={this.state.wallOver}
        />
      </ErrorBoundary>
    );
  }
}

const SaveButton = props => {
  return (
    <button className="primary-button" onClick={() => props.onClick()}>
      Save
    </button>
  );
};

const DraggableVaultElement = React.forwardRef((props, ref) => (
  <div className="draggable-vault-element">
    <img src={props.imgSrc} style={{ width: "140px" }} ref={ref} />
  </div>
));

const MainCanvas = props => {
  return <div id="boardCanvas" ref={mount => props.refer(mount)} />;
};

export default withAuthentication(withFirebase(Builder));
