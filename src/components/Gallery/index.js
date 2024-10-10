import React, { Component } from "react";

import * as THREE from "three";
import "../../css/builder.css";
import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { connect } from "react-redux";

import  AnimateUpdatables  from "../Scene/AnimateUpdatables";
import { addAnimationUpdatables } from "../../redux/actions";

import FlaneurControls from "../PlanBuilder/FlaneurControls";

// import MainCanvas from "./MainCanvas";
import MainCanvas from "../Scene/MainCanvas";

import ErrorBoundary from "../ErrorBoundary";

import PageTitle from "../Navigation/PageTitle";
import { GalleryHelp } from "./GalleryHelp";
import { ArtDetails } from "./ArtDetails";
// import { FocusEye } from "./FocusEye";

import { MapControls } from "./orbit";
import { DragControls } from "./drag";

import { isMobile } from "react-device-detect";

import Catalogue from "./Catalogue";

import Gui from "../Gui";

import Walls from "../PlanBuilder/Scene/Walls";
import GeneralLight from "../PlanBuilder/Scene/GeneralLight";

import Lights from "../PlanBuilder/Scene/Lights";

import Sculptures from "../PlanBuilder/Scene/Sculptures";
import Floor from "../PlanBuilder/Scene/Floor";
import ForwardStats from "../Scene/ForwardStats"

import { createSceneData } from "../../redux/actions";
import _, { isEqual } from "lodash";

let cameraLookAt = new THREE.Vector3(0, 45, -5); //0, 50, -200

class GalleryBase extends Component {
  state = {
    onArt: null, //art details -- frame 
    focusEye: false,
    hoverOnArt: null,
    guiAdded: false,
    sculptures: [],
    sculptureAnimations: [],
    catalogue: [],
  };

  constructor(props) {
    super(props);
    console.log("Gallery", props.match.params.galleryName, props);
    this.flaneurMode = "Gallery";
    const { camera, scene, renderer } = this.props;
    this.scene = scene; // new THREE.Scene();
    this.camera = camera; //new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    this.renderer = renderer;

    this.GalleryHelp = GalleryHelp({ callback: this.helpCallback });
    console.log("this.props.camera", this.props.camera);
    this.props.addAnimationUpdatables({gallery:this.animate})
    this.stats = React.createRef();
  }

  componentDidMount() {
    console.log("Gallery this.props", this.props);
    this.setUpScene();
    console.log("!this.scene.children.length", !this.scene.children.length);
    if (this.scene.children.length === 0) {//no scene loaded
      console.log("Gallery didMount");
      this.galleryRef = this.props.firebase.getGalleryByName(
        this.props.match.params.galleryName,
        this.processGallery
      );
    }

    this.backListener = this.props.history.listen((loc, action) => {
      if (action === "POP") {
        this.emptyScene();
        this.galleryRef = this.props.firebase.getGalleryByName(
          this.props.match.params.galleryName,
          this.processGallery
        );
        // this.flaneurControls.moveToInitial();
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("this state, prev", this.state, prevState);
    // console.log("prev this",prevProps, this.props)
    // console.log("newprops.scene.children.length",prevProps.collidableObjects, this.props.collidableObjects)
    // if(this.props.collidableObjects.le);
    console.log("props", isEqual(prevProps, this.props));
    function changedKeys(o1, o2) {
      var keys = _.union(_.keys(o1), _.keys(o2));
      return _.filter(keys, function (key) {
        return o1[key] !== o2[key];
      });
    }
    let changedKeysAr = changedKeys(prevState, this.state);
    console.log("changedKeys for State", changedKeysAr);

    console.log("chnaged state", this.state[changedKeysAr[0]]);
    changedKeysAr = changedKeys(prevProps, this.props);
    console.log("changedKeys for props", changedKeysAr);
    console.log("chnaged props 0 ", this.props[changedKeysAr[0]]);
    console.log("chnaged props 1 ", this.props[changedKeysAr[1]]);
    if (this.props.art.length !== prevProps.art.length) {
      // console.log("set ART");
    }

    if (this.props.firebase.isCurator && !this.state.guiAdded) {
      this.addGui();
    }
  }

  componentWillUnmount() {
    console.log("Gallery unmount");
    window.removeEventListener("resize", this.onWindowResize);
    // this.flaneurControls && this.flaneurControls.dispose();
    this.emptyScene(true);
    this.gui && this.gui.gui.destroy();
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



  setupListeners() {
    this.focusGallery();
    // this.setupFlaneurControls();
    window.addEventListener("resize", this.onWindowResize, false);
    // Events.addEventListener("hoveron", this.hoverOn);
    // Events.addEventListener("hoveroff", this.hoverOff);
  }
  // hoverOn = (data) => {
  //   console.log("hoveron data", data);
  //   data.object.scope &&
  //     data.object.scope.hoverOn &&
  //     data.object.scope.hoverOn();
  // };

  // hoverOff = (data) => {
  //   console.log("hoverOff data", data);
  //   data.object.scope &&
  //     data.object.scope.hoverOn &&
  //     data.object.scope.hoverOff();
  // };

  onWindowResize = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  //scene setup
  setUpScene() {
    this.camera.position.set(0, 45, 200); //260
    this.camera.lookAt(cameraLookAt);
    this.mount.appendChild(this.renderer.domElement);
  }

  focusGallery = () => {
    this.mount.focus();
  };
  setupFlaneurControls() {
    // this.setUpFlyControls();
    // this.flaneurControls = new FlaneurControls(this.camera, this);

    if (isMobile) {
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
      this.props.art,
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
        // if (hoveredOn3d) {
        //   this.flaneurControls.moveTo3d(hoveredOn3d);
        // } else {
        //   this.flaneurControls.moveToArt(e.object);
        // }
      } else {
        console.log("setting this.lastTap", this.lastTap);
        this.lastTap = now;
      }
    });
    // this.mapControls.addEventListener("moveLeaveArt", (e) => {
    //   this.flaneurControls.offArtHandler();
    // });
  }

  rayIntersect(ray, distance) {
    // console.log("ray",ray);

    //used by flaneur controls
    // let collidableObjects = this.wallEntities.map(item => item.getMesh()); //used for raycaster
    var intersects = ray.intersectObjects(this.props.collidableObjects);
    for (var i = 0; i < intersects.length; i++) {
      // Check if there's a collision
      if (intersects[i].distance < distance) {
        console.log("collide");
        return true;
      }
    }
    return false;
  }

  initialCameraAnimation() {
    // this.flaneurControls.initialCameraAnimation();
  }

  processGallery = (data, val) => {
    console.log("processGallery", data);
    this.onWindowResize();
    this.props.createSceneData(data);
    this.startAnimating();
  };

  startAnimating() {
    this.setupListeners();
    this.animate();
    // this.flaneurControls && this.flaneurControls.setUpCollidableObjects(); //removed for OrbitControls
  }

  addBox() {
    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  }

  helpCallback = () => {
    setTimeout(
      () => this.render.domElement.focus(),// this.flaneurControls && this.flaneurControls.setFocus(),
      500
    ); //to overcome ant d difficult refocussing
  };

  getArtDetail = (key, type) => {
    const options = {
      refPath: "users/" + this.state.owner + "/" + type + "/" + key,
      once: true,
      callback: () => {}, //this.setArtDetails,
    };

    console.log("getArtDetail", options);
    this.props.firebase.getAsset(options);
  };

  setArtDetails = (snap) => {
    const snapVal = !snap ? null : snap.val();
    this.state.onArt !== snapVal && this.setState({ onArt: snapVal });
  };

  offArtHandler = () => {
    this.setArtDetails(null);
    this.state.onArt !== null && this.setState({ focusEye: null });
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
    // this.stats.current.update();
    this.renderer.render(this.scene, this.camera);

  };

  animateOLD = () => {
    const delta = this.clock.getDelta();
    // this.flaneurControls && this.flaneurControls.update(delta);
    this.mapControls && this.mapControls.update();
    this.flyControls && this.flyControls.update(delta);
    this.state.sculptureAnimations.forEach((item) => {
      item.mixer.update(delta);
    });
    this.renderer.render(this.scene, this.camera);
    // this.stats && this.stats.update();
    this.animateCall = requestAnimationFrame(() => this.animate());
  };

  render() {
    const { sceneData, owner } = this.props;
    console.log("sceneData, owner, this.props",sceneData, owner, this.props)
    return (
      <ErrorBoundary>
        <PageTitle
          title={sceneData.title}
          help={this.GalleryHelp}
          titleClickHandler={this.titleClickHandler}
        >
          <Catalogue
            galleryData={sceneData}
            owner={sceneData.owner}
            changeGallery={this.changeGallery}
          />
        </PageTitle>
        <MainCanvas refer={(mount) => (this.mount = mount)} />
        <AnimateUpdatables />
        <FlaneurControls  />
        <Walls />
        <Sculptures />
        <GeneralLight />
        <Floor />
        <Lights />
        {this.state.onArt && (
          <ArtDetails
            selectedArt={this.state.onArt}
            changeGallery={this.changeGallery}
          />
        )}
        {/* {this.state.focusEye && <FocusEye focusEye={this.state.focusEye} />} */}
        <ForwardStats />
      </ErrorBoundary>
    );
  }
}
const mapStateToProps = (state) => {
  console.log("gallerystate",state)
  const { camera, renderer, sceneData } = state;
  const collidableObjects = state.scene.children.filter(
    (item) => item.name === "wall"
  );
  console.log("collidableObjects in mapState", collidableObjects);
  const art = [];
  state.scene.traverse(function (node) {
    if (node.name === "art") {
      art.push(node);
    }
  });

  return { sceneData, camera, scene: state.scene, renderer, collidableObjects, art }; //{scene: state.scene};
};

const Gallery = compose(
  connect(mapStateToProps, { createSceneData, addAnimationUpdatables }),
  withAuthentication,
  withFirebase,
  withRouter
)(GalleryBase);

export default Gallery;
