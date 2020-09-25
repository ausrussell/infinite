import React, { Component } from "react";
import ReactDOM from 'react-dom';

import * as THREE from "three";
import "../../css/builder.css";
import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";
import FlaneurControls from "../PlanBuilder/FlaneurControls";
import MainCanvas from "./MainCanvas";
import ErrorBoundary from "../ErrorBoundary";
import GeneralLight from "../PlanBuilder/GeneralLight";
import SceneLoader from "./SceneLoader";
import PageTitle from '../Navigation/PageTitle';
import { GalleryHelp } from './GalleryHelp'
import { ArtDetails } from './ArtDetails'
import { compose } from 'recompose';

// import MapControls from "orbit-controls-es6";
// import { OrbitControls, MapControls } from "three/examples/jsm/controls/OrbitControls"
import { MapControls } from "./orbit";
import { DragControls } from "./drag";



import { isMobile } from 'react-device-detect';

import Gui from "../Gui";
import * as Stats from "stats-js";
// const OrbitControl = new OrbitControls();
// const MapControls = require('three-orbit-controls')(THREE)
// const MapControls = require('./orbit')(THREE)


// const {MapControls} = OrbitControls;

class GalleryBase extends Component {
  state = {
    galleryData: {},
    voxelsX: 14,
    voxelsY: 10,
    wallWidth: 20,
    wallMeshes: [],
    artMeshes: [],
    onArt: null,
    guiAdded: false,
    stats: false,
    owner: null,
    sculptureAnimations:[]
  };

  constructor(props) {
    super(props);
    // debugger;
    console.log("Gallery", props.match.params.galleryName, props);
    this.flaneurMode = "Gallery";
    this.walls = props.walls;
    console.log(this.walls, this.voxelsX);
    this.clock = new THREE.Clock();
    this.frameObjects = [];
    this.GalleryHelp = GalleryHelp({ callback: this.helpCallback })
  }

  componentDidMount() {
    console.log("Gallery this.props", this.props);
    this.setUpScene();

    this.galleryRef = this.props.firebase.getGalleryByName(
      this.props.match.params.galleryName,
      this.processGallery
    );

  }

  componentDidUpdate(oldProps, oldState) {
    console.log("oldState, this.state", oldState, this.state);
    if (this.props.firebase.isCurator && !this.state.guiAdded) {
      this.addGui();
      this.setupStats()
    }
  }

  componentWillUnmount() {
    console.log("Gallery unmount");
    window.removeEventListener("resize", this.onWindowResize);
    this.flaneurControls && this.flaneurControls.dispose();
    this.emptyScene();
    this.gui && this.gui.gui.destroy();
    this.stats && document.body.removeChild(this.stats.dom);
  }

  disposeNode = (parentObject) => {
    parentObject.traverse(function (node) {
      // console.log("node", node)
      if (node instanceof THREE.Mesh) {
        if (node.geometry) {
          node.geometry.dispose();
        }
        if (node.material) {
          if (node.material instanceof THREE.MeshFaceMaterial || node.material instanceof THREE.MultiMaterial) {
            node.material.materials.forEach(function (mtrl, idx) {
              if (mtrl.map) mtrl.map.dispose();
              if (mtrl.lightMap) mtrl.lightMap.dispose();
              if (mtrl.bumpMap) mtrl.bumpMap.dispose();
              if (mtrl.normalMap) mtrl.normalMap.dispose();
              if (mtrl.specularMap) mtrl.specularMap.dispose();
              if (mtrl.envMap) mtrl.envMap.dispose();

              mtrl.dispose();    // disposes any programs associated with the material
            });
          }
          else {
            if (node.material.map) node.material.map.dispose();
            if (node.material.lightMap) node.material.lightMap.dispose();
            if (node.material.bumpMap) node.material.bumpMap.dispose();
            if (node.material.normalMap) node.material.normalMap.dispose();
            if (node.material.specularMap) node.material.specularMap.dispose();
            if (node.material.envMap) node.material.envMap.dispose();

            node.material.dispose();   // disposes any programs associated with the material
          }
        }
      }
      // console.log("end of disposeNode", i++)
    });
  }

  emptyScene() {
    console.log("this.scene.children before", this.scene.children);
    console.log("renderer.info before", this.renderer.info)
    console.log("renderer.info.memory before", this.renderer.info.memory)
    window.cancelAnimationFrame(this.animateCall);
    if (!this.sceneLoader) return;
    this.animateCall = undefined;

    this.state.artMeshes.forEach(item => {
      item.frameDisplayObject.destroyViewingPosition();
    })
    this.disposeNode(this.scene);
    this.sceneLoader.destroy();//only disposing background at the moment
    const node = this.scene;
    for (var i = node.children.length - 1; i >= 0; i--) {
      var child = node.children[i];
      this.scene.remove(child);
    }
    console.log("this.scene after", this.scene.children);
    console.log("renderer.info after", this.renderer.info)
    this.scene.dispose();
    this.setState({ artMeshes: null })
    console.log("renderer.info.memory after", this.renderer.info.memory)
    this.renderer.forceContextLoss()
    this.renderer.dispose();
    return;
  }

  addGui() {
    console.log("addGui")
    this.setState({ guiAdded: true });
    this.gui = new Gui();
    this.gui.gui.add(this.gui, "fov", 25, 180).onChange(e => {
      this.fov = e;
      this.flaneurControls.setFov(e);
    });
  }

  setupStats() {
    console.log("planbuilder setupStats");
    if (!this.state.stats) {
      this.setState({ stats: true })
      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(this.stats.dom);
      this.stats.dom.style.top = "48px";
      this.stats.dom.style.position = "absolute";
    }
  }

  setupListeners() {
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
    // const height = this.mount.clientHeight;
    const height = this.mount.parentElement.clientHeight - 48;// height wasn't getting set after new landing animation
    this.setState({ width: width, height: height });
    console.log("height, width", height, width, window.innerWidth, window.innerHeight)
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    // this.renderer.setSize(width, height);
    this.renderer.setSize(window.innerWidth, window.innerHeight);




    this.mount.appendChild(this.renderer.domElement);
    // this.addLight();
    // this.addHelperGrid();

    this.renderer.render(this.scene, this.camera);
    // this.mount.firstElementChild.focus();
  }

  simpleScene() {

    const canvas = this.refs.canvas;//document.querySelector('#boardCanvas');
    // reference to the actual DOM element
    const node = ReactDOM.findDOMNode(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    console.log("renderer", renderer, node)

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0000);
    {
      const color = 0xFFFFFF;
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(-1, 2, 4);
      scene.add(light);
    }

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    function makeInstance(geometry, color, x) {
      const material = new THREE.MeshPhongMaterial({ color });

      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      cube.position.x = x;

      return cube;
    }

    const cubes = [
      makeInstance(geometry, 0x44aa88, 0),
      makeInstance(geometry, 0x8844aa, -2),
      makeInstance(geometry, 0xaa8844, 2),
      makeInstance(geometry, 0xaaf844, 1),
    ];

    function render(time) {
      time *= 0.001;  // convert time to seconds
      cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
      });

      renderer.render(scene, camera);

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  focusGallery = () => {
    this.mount.focus();
  }
  setupFlaneurControls() {
    // this.setUpFlyControls();
    // debugger;
    this.flaneurControls = new FlaneurControls(this.camera, this);

    if (isMobile) {
      // this.mapControls =  (this.state.galleryData.title === "501A") ? new OrbitControls(this.camera, this.renderer.domElement): new MapControls(this.camera, this.renderer.domElement);
      // debugger;
      this.mapControls = new MapControls(this.camera, this.renderer.domElement);//new
      this.mapControls.enableZoom = false;
      this.mapControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      this.mapControls.dampingFactor = 0.05;
      this.mapControls.minPolarAngle = Math.PI * .25;//0;//1;//0; // radians

      this.mapControls.maxPolarAngle = Math.PI * .75;
      this.mapControls.zoomSpeed = 1;
      this.mapControls.minDistance = -500;
      this.mapControls.maxDistance = 500;
      this.mapControls.enableKeys = false;

      this.setupDragControls();

    }



  }

  setupDragControls() {
    this.dragControls = new DragControls(this.state.artMeshes, this.camera, this.renderer.domElement);
    this.touchCounter = 0;
    this.dragControls.addEventListener("dragstart", (e) => {
      console.log("touched e", e.object);
      this.touchCounter++;
      if (this.touchCounter > 1) this.flaneurControls.moveToArt(e.object)
      setTimeout(() => {
        this.touchCounter = 0
      }, 1000)
    })
    this.mapControls.addEventListener("moveLeaveArt", (e) => {
      console.log("moveLeaveArt", e)
      this.flaneurControls.offArtHandler()
    })
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
    this.setState({ owner: data.owner });
    if (this.galleryData) this.emptyScene();
    // this.galleryData = data;
    this.setState({ galleryData: data }, this.setScene);
    // this.setScene();
    this.setupListeners();
    this.setCamera();
    // this.animateCall = () => requestAnimationFrame(() => this.animate());

    this.animate();
    this.flaneurControls && this.flaneurControls.setUpCollidableObjects();//removed for OrbitControls

  };

  isWallMesh(item) {
    if (item.name === "wallGroup") {
      return item.children.filter(child => child.name === "wallMesh");
    }
  }

  setScene() {
    // Load a glTF resource
    const options = {
      scene: this.scene,
      sceneData: this.state.galleryData,
      builder: this
    };
    this.sceneLoader = new SceneLoader(options);
    this.sceneLoader.renderData();
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
    setTimeout(() => this.flaneurControls && this.flaneurControls.setFocus(), 500);//to overcome ant d difficult refocussing
  }

  getArtDetail = (key) => {
    const options = {
      refPath: "users/" + this.state.owner + "/art/" + key,
      once: true,
      callback: this.setArtDetails
    }

    console.log("getArtDetail", options)
    this.props.firebase.getAsset(options);
  }

  setArtDetails = snap => {
    const snapVal = (!snap) ? null : snap.val()
    console.log("gotArtDetails", snapVal);

    this.setState({ onArt: snapVal })
  }

  animate() {
    const delta = this.clock.getDelta()
    this.flaneurControls && this.flaneurControls.update(delta);
    this.mapControls && this.mapControls.update();
    this.flyControls && this.flyControls.update(delta);
    this.state.sculptureAnimations.forEach(item => item.mixer.update(delta))
    this.renderer.render(this.scene, this.camera);
    this.stats && this.stats.update();
    this.animateCall = requestAnimationFrame(() => this.animate());
  }

  render() {
    return (
      <ErrorBoundary>
        <div className="page-header-area">
          <PageTitle title={this.state.galleryData.title} help={this.GalleryHelp} />
        </div>
        <MainCanvas refer={mount => (this.mount = mount)} />
        {this.state.onArt && <ArtDetails selectedArt={this.state.onArt} />}
      </ErrorBoundary>
    );
  }
}

const Gallery = compose(
  withAuthentication,
  withFirebase,
)(GalleryBase);

export default Gallery;
