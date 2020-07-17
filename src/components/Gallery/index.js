import React, { Component } from "react";
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
    onArt: null,
    guiAdded: false,
    stats: false
  };
  constructor(props) {
    super(props);
    console.log("Gallery", props.match.params.galleryName, props);
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
    const height = this.mount.clientHeight;
    this.setState({ width: width, height: height });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
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
    // this.animateCall = () => requestAnimationFrame(() => this.animate());

    this.animate();
    this.flaneurControls.setUpCollidableObjects();

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
    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  }


  helpCallback = () => {
    setTimeout(() => this.flaneurControls.setFocus(), 500);//to overcome ant d difficult refocussing
  }

  getArtDetail(key) {
    const options = {
      refPath: "users/" + this.props.firebase.currentUID + "/art/" + key,
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
    this.flaneurControls.update(this.clock.getDelta());

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
