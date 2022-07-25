import React, { Component } from "react";
import { connect } from "react-redux";
import * as THREE from "three";

import {
  createScene,
  addSculptures,
  addSculpture,
} from "../../../redux/actions";
import FlaneurControls from "../FlaneurControls";

import Walls from "./Walls";
import Lights from "./Lights";

import GeneralLight from "./GeneralLight";
import Sculptures from "./Sculptures";
import Floor from "./Floor";

class Scene extends Component {
  constructor(props) {
    super(props);
    console.log("Scene constructor", props);
    this.clock = new THREE.Clock();
  }

  componentDidMount() {
    console.log("Scene onComponentMount", this.mount);
    this.setUpScene();
  }

  setUpScene() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.setState({ width, height });
    this.scene = new THREE.Scene();
    this.props.createScene(this.scene);
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    this.camera.position.set(0, 45, 260);
    this.camera.fov = 60;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
    // this.addGeneralLight();
    this.addBox();
    this.renderer.render(this.scene, this.camera);
    console.log("this.renderer", this.renderer);
    this.setupListeners();
    this.animate();
    this.camera.updateProjectionMatrix();
  }

  setupListeners() {
    console.log("setupListeners", this.mount);
    // this.mount.addEventListener(
    //   "mousemove",
    //   this.onMouseMove.bind(this),
    //   false
    // );
    // this.mount.addEventListener(
    //   "mousedown",
    //   this.onMouseDown.bind(this),
    //   false
    // );
    window.addEventListener("resize", this.onWindowResize, false);
    // this.setupFlaneurControls();
    // console.log("setupListeners this.scene", this.scene.children);
  }

  setupFlaneurControls() {
    // if(this.flaneurControls) this.flaneurControls.dispose();
    this.flaneurControls = new FlaneurControls(this.camera, this);
  }

  addBox() {
    const geometry = new THREE.BoxGeometry(20, 20, 20);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1faf34,
      // wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "box helper";
    this.scene.add(mesh);
    mesh.position.set(0, 10, 10);
    console.log("this.scene", this.scene);
  }

  onWindowResize = () => {
    console.log("renderer.info.memory before", this.renderer.info);
    console.log("renderer.info.memory before", this.renderer.info.memory);
    console.log("scene.children", this.scene.children);
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  animate = () => {
    this.renderer.render(this.scene, this.camera);
    // const delta = this.clock.getDelta();
    // console.log("animate delta",delta)

    // if (this.flaneurControls) {
    // this.flaneurControls.update(delta);
    // // }
    // if (this.state.sculptureAnimations.length > 0) {
    //   this.state.sculptureAnimations.forEach((item) => {
    //     item.mixer.update(delta);
    //   });
    // }

    requestAnimationFrame(this.animate);
    this.stats && this.stats.update();
  };

  render() {
    return (
      <div id="boardCanvas" ref={(mount) => (this.mount = mount)}>
        <Walls />
        <Sculptures />
        <GeneralLight />
        <Floor />
        <Lights />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  console.log("Plan Builder state ", state);
  return state;
};

export default connect(mapStateToProps, {
  createScene,
  addSculptures,
  addSculpture,
})(Scene);
