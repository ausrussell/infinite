import React, { Component } from "react";

import * as THREE from "three";
import "../../css/builder.css";
import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";
import { withRouter } from "react-router-dom";

import FlaneurControls from "../PlanBuilder/FlaneurControls";
import MainCanvas from "./MainCanvas";
import ErrorBoundary from "../ErrorBoundary";
import GeneralLight from "../PlanBuilder/GeneralLight";
import SceneLoader from "./SceneLoader";
import PageTitle from "../Navigation/PageTitle";
import { GalleryHelp } from "./GalleryHelp";
import { ArtDetails } from "./ArtDetails";
import { FocusEye } from "./FocusEye";

import { compose } from "recompose";

import { MapControls } from "./orbit";
import { DragControls } from "./drag";

import { Events } from "../PlanBuilder/FlaneurControls";

import { isMobile } from "react-device-detect";

import Catalogue from "./Catalogue";

import Gui from "../Gui";
import * as Stats from "stats-js";

class GalleryBase extends Component {
  state = {
    galleryData: {},
    voxelsX: 14,
    voxelsY: 10,
    wallWidth: 20,
    wallMeshes: [],
    artMeshes: [],
    onArt: null, //art details -- frame
    focusEye: false,
    guiAdded: false,
    stats: false,
    owner: null,
    sculptures: [],
    sculptureAnimations: [],
    visible: false,
    catalogue: [],
  };

  constructor(props) {
    super(props);
    console.log("Gallery", props.match.params.galleryName, props);
    this.flaneurMode = "Gallery";
    this.walls = props.walls;
    console.log(this.walls, this.voxelsX);
    this.clock = new THREE.Clock();
    this.frameObjects = [];
    this.GalleryHelp = GalleryHelp({ callback: this.helpCallback });
  }

  componentDidMount() {
    console.log("Gallery this.props", this.props);
    this.setUpScene();

    this.galleryRef = this.props.firebase.getGalleryByName(
      this.props.match.params.galleryName,
      this.processGallery
    );

    this.backListener = this.props.history.listen((loc, action) => {
      if (action === "POP") {
      // debugger;

        this.emptyScene();
        this.galleryRef = this.props.firebase.getGalleryByName(
          this.props.match.params.galleryName,
          this.processGallery
        );
    this.flaneurControls.moveToInitial();

      }
    });
  }

  componentDidUpdate(oldProps, oldState) {
    console.log("oldState, this.state", oldState, this.state);
    if (this.props.firebase.isCurator && !this.state.guiAdded) {
      this.addGui();
      this.setupStats();
    }
  }

  componentWillUnmount() {
    console.log("Gallery unmount");
    window.removeEventListener("resize", this.onWindowResize);
    this.flaneurControls && this.flaneurControls.dispose();
    this.emptyScene(true);
    this.gui && this.gui.gui.destroy();
    this.stats && document.body.removeChild(this.stats.dom);
    this.backListener();
  }

  disposeNode = (parentObject) => {
    parentObject.traverse(function (node) {
      // console.log("node", node)
      if (node instanceof THREE.Mesh) {
        if (node.geometry) {
          node.geometry.dispose();
        }
        if (node.material) {
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
      // console.log("end of disposeNode", i++)
    });
  };

  emptyScene(completeDestruction) {
    console.log("this.scene.children before", this.scene.children);
    console.log("renderer.info before", this.renderer.info);
    console.log("renderer.info.memory before", this.renderer.info.memory);
    window.cancelAnimationFrame(this.animateCall);
    if (!this.sceneLoader) return;
    if (this.animateCall) this.animateCall = undefined;

    this.state.artMeshes.forEach((item) => {
      console.log("arftMeshItem", item);
      item.frameDisplayObject &&
        item.frameDisplayObject.destroyViewingPosition();
    });
    this.disposeNode(this.scene);
    this.sceneLoader.destroy(); //only disposing background at the moment
    const node = this.scene;
    for (var i = node.children.length - 1; i >= 0; i--) {
      var child = node.children[i];
      this.scene.remove(child);
    }
    console.log("this.scene after", this.scene.children);
    console.log("renderer.info after", this.renderer.info);
    if (completeDestruction) {
      this.scene.dispose();
      this.setState({ artMeshes: null });
      console.log("renderer.info.memory after", this.renderer.info.memory);
      this.renderer.forceContextLoss();
      this.renderer.dispose();
    }
    return;
  }

  addGui() {
    console.log("addGui");
    this.setState({ guiAdded: true });
    this.gui = new Gui();
    // this.gui.gui.add(this.gui, "fov", 25, 180).onChange((e) => {
    //   this.fov = e;
    //   this.flaneurControls.setFov(e);
    // });
  }

  setupStats() {
    console.log("planbuilder setupStats");
    if (!this.state.stats) {
      this.setState({ stats: true });
      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(this.stats.dom);
      this.stats.dom.style.top = "48px";
      this.stats.dom.style.position = "absolute";
    }
  }

  setupListeners() {
    this.focusGallery();
    this.setupFlaneurControls();
    window.addEventListener("resize", this.onWindowResize, false);
    Events.addEventListener("hoveron", this.hoverOn);
    Events.addEventListener("hoveroff", this.hoverOff);
  }
  hoverOn = (data) => {
    console.log("hoveron data", data);
    data.object.scope &&
      data.object.scope.hoverOn &&
      data.object.scope.hoverOn();
  };

  hoverOff = (data) => {
    console.log("hoverOff data", data);
    data.object.scope &&
      data.object.scope.hoverOn &&
      data.object.scope.hoverOff();
  };

  onWindowResize = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  //scene setup and animation
  setUpScene() {
    const width = this.mount.clientWidth;
    // const height = this.mount.clientHeight;
    const height = this.mount.clientHeight; // height wasn't getting set after new landing animation
    this.setState({ width: width, height: height });
    console.log("height, width", height, width);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setSize(width, height);

    this.mount.appendChild(this.renderer.domElement);
    // this.addHelperGrid();

    this.renderer.render(this.scene, this.camera);
  }

  focusGallery = () => {
    this.mount.focus();
  };
  setupFlaneurControls() {
    // this.setUpFlyControls();
    this.flaneurControls = new FlaneurControls(this.camera, this);

    if (isMobile) {
      // this.mapControls =  (this.state.galleryData.title === "501A") ? new OrbitControls(this.camera, this.renderer.domElement): new MapControls(this.camera, this.renderer.domElement);
      this.mapControls = new MapControls(this.camera, this.renderer.domElement); //new
      this.mapControls.enableZoom = false;
      this.mapControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      this.mapControls.dampingFactor = 0.15;
      this.mapControls.minPolarAngle = Math.PI * 0.25; //0;//1;//0; // radians

      this.mapControls.maxPolarAngle = Math.PI * 0.75;
      this.mapControls.zoomSpeed = 1;
      this.mapControls.minDistance = -500;
      this.mapControls.maxDistance = 500;
      this.mapControls.enableKeys = false;

      this.setupDragControls();
    }
  }

  setupFocusArtForMobile(artObject) {
    this.mapControls.enableZoom = false;
    this.setState({ focusEye: artObject });
  }

  setupDragControls() {
    this.dragControls = new DragControls(
      this.state.artMeshes,
      this.camera,
      this.renderer.domElement
    );
    this.dragControls.addEventListener("dragstart", (e) => {
      //double tap
      console.log("touched e", e.object.uuid);

      const now = Date.now();
      console.log("this.lastTap && now", this.lastTap, now);
      if (this.state.onArt && e.object.uuid === this.state.onArt.artMesh.uuid) {
        // console.log("clicked on selected art", this.selectedArt.artMesh.uuid);
        if (!this.state.focusArt) this.setupFocusArtForMobile(e.object);
      }

      if (this.lastTap && now - this.lastTap < 1000) {
        console.log("do move", e.object);
        let hoveredOn3d;
        e.object.traverseAncestors((item) => {
          if (item.name === "OSG_Scene" && !hoveredOn3d) hoveredOn3d = item;
        });
        if (hoveredOn3d) {
          this.flaneurControls.moveTo3d(hoveredOn3d);
        } else {
          this.flaneurControls.moveToArt(e.object);
        }
      } else {
        console.log("setting this.lastTap", this.lastTap);
        this.lastTap = now;
      }
    });
    this.mapControls.addEventListener("moveLeaveArt", (e) => {
      this.flaneurControls.offArtHandler();
    });
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
  processGallery = (data, val) => {
    console.log("processGallery", data);
    this.setState({ owner: data.owner });
    if (this.galleryData) this.emptyScene();
    this.setState({ galleryData: data }, this.setScene);
    this.setupListeners();
    this.setCamera();
    this.animate();
    this.flaneurControls && this.flaneurControls.setUpCollidableObjects(); //removed for OrbitControls
  };

  isWallMesh(item) {
    if (item.name === "wallGroup") {
      return item.children.filter((child) => child.name === "wallMesh");
    }
  }

  setScene() {
    // Load a glTF resource
    console.log("setScene",this.state.galleryData)
    const options = {
      scene: this.scene,
      sceneData: this.state.galleryData,
      builder: this,
    };
    this.sceneLoader = new SceneLoader(options);
    this.sceneLoader.renderData();

    this.onWindowResize();
    // this.addBox();
    // this.addHelperGrid();
  }
  setCamera() {
    this.camera.position.z = 245;
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
    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  }

  helpCallback = () => {
    setTimeout(
      () => this.flaneurControls && this.flaneurControls.setFocus(),
      500
    ); //to overcome ant d difficult refocussing
  };

  getArtDetail = (key, type) => {
    const options = {
      refPath: "users/" + this.state.owner + "/" + type + "/" + key,
      once: true,
      callback: this.setArtDetails,
    };

    console.log("getArtDetail", options);
    this.props.firebase.getAsset(options);
  };

  setArtDetails = (snap) => {
    const snapVal = !snap ? null : snap.val();
    console.log("gotArtDetails onArt", snapVal);
    this.setState({ onArt: snapVal });
  };

  offArtHandler = () => {
    console.log("offArtHandler");
    this.setArtDetails(null);
    this.setState({ focusEye: null });
  };

  onArtHandler(selectedArt) {
    console.log("glallery onArtHandler", selectedArt);
    const frameMesh = selectedArt.artMesh;
    if (this.state.focusEye || !frameMesh) return;
    const frameMat = frameMesh.matrixWorld;
    var box = new THREE.Box3();
    box.setFromObject(frameMesh);
    let boxSize = box.getSize();
    const frameWidth = selectedArt.wall.pos === 0 ? boxSize.z : boxSize.x;
    const frameHeight = boxSize.y;
    var newpos = new THREE.Vector3(
      frameMesh.position.x - frameWidth / 2,
      frameMesh.position.y + frameHeight / 2,
      frameMesh.position.z - 5
    );
    newpos.applyMatrix4(frameMat);
    newpos.project(this.camera);
    newpos.x = Math.round(((newpos.x + 1) * this.mount.clientWidth) / 2);
    newpos.y = Math.round(((-newpos.y + 1) * this.mount.clientHeight) / 2);
    newpos.mount = this.mount;
    const widthHalf = this.mount.clientWidth / 2;
    const heightHalf = this.mount.clientHeight / 2 + this.mount.offsetTop;

    newpos.center = {
      x: widthHalf,
      y: heightHalf,
    };
    newpos.leaveHandler = this.leaveHandler;
    this.setState({ focusEye: newpos });
  }

  leaveHandler = () => {
    console.log("glallery leavehandler");
    this.flaneurControls.offArtHandler();
  };

  titleClickHandler = () => {
    console.log("titleClickHandler");
    // this.camera.position.z = 245;
    // this.camera.position.y = 45;
    this.flaneurControls.moveToInitial();
  };

  changeGallery = ({ galleryKey, nameEncoded }) => {
    console.log("changeGallery", galleryKey);
    this.emptyScene();
    this.props.history.push(`/Gallery/${nameEncoded}`);
    // this.props.history.replace({ pathname: `/Gallery/${nameEncoded}`})
    this.props.firebase.getPublicGalleryById(
      galleryKey,
      this.buildGalleryChange
    );
  };
  buildGalleryChange = (data) => {
    this.processGallery(data);
    this.flaneurControls.moveToInitial();
  };

  animate = () => {
    // console.log("animate")
    const delta = this.clock.getDelta();
    this.flaneurControls && this.flaneurControls.update(delta);
    this.mapControls && this.mapControls.update();
    this.flyControls && this.flyControls.update(delta);
    this.state.sculptureAnimations.forEach((item) => {
      item.mixer.update(delta);
    });
    this.renderer.render(this.scene, this.camera);
    this.stats && this.stats.update();
    this.animateCall = requestAnimationFrame(() => this.animate());
  };

  render() {
    const { galleryData, owner } = this.state;
    return (
      <ErrorBoundary>
        <div className="page-header-area">
          <PageTitle
            title={galleryData.title}
            help={this.GalleryHelp}
            titleClickHandler={this.titleClickHandler}
          >
            <Catalogue galleryData={galleryData} owner={owner} changeGallery={this.changeGallery} />
          </PageTitle>
        </div>
        <MainCanvas refer={(mount) => (this.mount = mount)} />
        {this.state.onArt && (
          <ArtDetails
            selectedArt={this.state.onArt}
            changeGallery={this.changeGallery}
          />
        )}
        {this.state.focusEye && <FocusEye focusEye={this.state.focusEye} />}
      </ErrorBoundary>
    );
  }
}

const Gallery = compose(
  withAuthentication,
  withFirebase,
  withRouter
)(GalleryBase);

export default Gallery;
