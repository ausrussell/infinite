import React, { Component } from "react";
import * as THREE from "three";
import Frame from "./Frame";
import * as dat from "dat.gui";

const gui = new dat.GUI();

class WallEntity extends Component {
  constructor(wall, builder) {
    super(wall, builder);
    this.wall = wall;
    this.pos = wall.pos;
    this.builder = builder;
    this.wallWidth = this.builder.gridWidth / this.builder.voxelsX;
    this.wallDepth = 5;
    this.wallHeight = 60;

    this.builderWidth = this.builder.width;
    this.midpointX = this.builder.voxelsX / 2;
    this.midpointY = this.builder.voxelsY / 2;
    // this.wallHeight = 1;

    this.buildVelocity = 10;
    this.setXYZ();
    this.renderWall();
    this.color = 0xfffefe;
    this.lightOn = false;
    this.hasArt = false;
  }

  setupControls() {
    var controls = new function() {
      this.rotationSpeed = 0.03;
      this.bouncingSpeed = 0.03;
      // this.ambientColor = ambiColor;
      // this.pointColor = this.spotLight.color.getStyle();
      this.intensity = 1;
      this.distance = 0;
      this.angle = 0.1;
      this.shadowDebug = false;
      this.castShadow = true;
      this.target = "Plane";
      this.stopMovingLight = false;
      this.penumbra = 0;
    }();

    gui.add(controls, "intensity", 0, 5).onChange(e => {
      this.spotLight.intensity = e;
    });
    gui.add(controls, "penumbra", 1, 1).onChange(e => {
      this.spotLight.penumbra = e;
    });

    gui.add(controls, "distance", 0, 200).onChange(e => {
      this.spotLight.distance = e;
    });

    gui.add(controls, "angle", 0.4, 1).onChange(e => {
      this.spotLight.angle = e;
      this.pp.update();
    });

    // gui.add(controls, "fov", 0, 200).onChange(e => {
    //   this.spotLight.fov = e;
    //   this.pp.update();
    // });

    return controls;
  }

  dragOverHandler() {
    if (!this.spotlightAdded && !this.hasArt) {
      // this.wallSpotlight = this.getDefaultWallSpotlight();
      // this.group.add(this.wallSpotlight);
      this.spotLight.intensity = 1;
      this.spotlightAdded = true;
      // debugger;
      this.frameGroup.children[0].material.opacity = 1;
    }

    // this.group.add(this.wallSpotlight);

    // debugger;
  }
  dragOutHandler() {
    // debugger;
    if (!this.hasArt) {
      this.frameGroup.children[0].material.opacity = 0;

      this.spotLight.intensity = 0;
      this.spotlightAdded = false;
    }
  }

  getDefaultWallSpotlight() {
    // this.controls = this.setupControls();

    this.spotLightColor = "#ffffff";
    this.spotLight = new THREE.SpotLight(this.spotLightColor);
    const wallMatrix = this.mesh.matrixWorld;
    const shiftedLight = wallMatrix.makeTranslation(
      0,
      0, //this.wallHeight,
      20 //this.wallDepth + 20
    );

    // this.spotLight.castShadow = true;
    this.spotLight.shadow.camera.near = 1;
    this.spotLight.shadow.camera.far = 1000;
    this.spotLight.angle = 0.4;
    this.spotLight.intensity = 0;
    this.spotLight.distance = 0;
    this.spotLight.target = this.group;
    // this.spotLight.shadow.camera.fov = this.controls.fov;
    this.spotLight.penumbra = 1;

    const frameMatrix = this.mesh.matrixWorld;
    const shifted = frameMatrix.makeTranslation(0, this.wallHeight, 60);
    this.spotLight.position.setFromMatrixPosition(shifted);
    this.group.add(this.spotLight);

    this.pp = new THREE.SpotLightHelper(this.spotLight);
    this.pp.matrix = this.pp.light.matrix;

    var geometry = new THREE.SphereGeometry(3, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0xf0ef00 });
    var sphere = new THREE.Mesh(geometry, material);

    sphere.position.setFromMatrixPosition(shifted);

    this.lightGroup = new THREE.Group();

    // this.lightGroup.add(sphere);
    //
    // this.lightGroup.add(this.pp);
    return this.lightGroup;
  }
  setXYZ() {
    // if (this.wall.pos === "top") {
    this.depth = this.wallDepth;
    this.width = this.wallWidth;
    this.posX =
      (this.wall.col - this.midpointX) * this.wallWidth + this.wallWidth / 2;
    this.posZ = (this.wall.row - this.midpointY) * this.wallWidth;
  }
  renderWall() {
    console.log("renderWall", this.width, this.wallHeight, this.depth);

    // Combine the geometry and material into a mesh
    if (!this.mesh) {
      const geometry = new THREE.BoxGeometry(
        this.width,
        this.wallHeight,
        this.depth
      );
      // Create a MeshBasicMaterial with a color white and with its wireframe turned on
      const material = new THREE.MeshStandardMaterial({
        // wireframe: true
      });

      // const material = new THREE.MeshLambertMaterial({
      //   //MeshStandardMaterial
      //   // wireframe: true
      // });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.receiveShadow = true;
      this.mesh.castShadow = true;
      this.frame = new Frame(this);
      this.group = new THREE.Group();
      // this.group.receiveShadow = true;
      // this.group.castShadow = true;
      this.group.add(this.mesh);

      this.builder.scene.add(this.group);
      this.builder.scene.updateMatrixWorld(true);
      this.group.position.set(this.posX, this.wallHeight / 2, this.posZ); //this.height / 2
      this.builder.scene.updateMatrixWorld(true);

      if (this.pos === "left") {
        this.group.translateX(-(this.width / 2));
        this.group.translateZ(this.width / 2);
        this.group.rotateY(Math.PI / 2);
      }
      // this.wallSpotlight = this.getDefaultWallSpotlight();
      // this.group.add(this.wallSpotlight);
      this.wallSpotlight = this.getDefaultWallSpotlight();
      this.group.add(this.wallSpotlight);
      this.frameGroup = this.frame.getFrameGroup();

      console.log("this.frame.hasArt", this.frame.hasArt);
      // if (this.frame.hasArt) {
      //   debugger;
      //   this.spotLight.intensity = 0.1;
      // }
      this.group.add(this.frameGroup);
    }
    // if (this.frameGroup) this.group.remove(this.frameGroup);
    // this.frameGroup = this.frame.getFrameGroup();

    // this.testLight();
    this.renderColor();

    // if (this.heightScale) {
    //   console.log("this.heightScale", this.heightScale);
    //   this.mesh.scale.set(1, this.heightScale, 1);
    //   // } else {
    // }

    console.log("render wall", this.wallHeight);
  }

  getMesh() {
    return this.mesh;
    // return this.group;
  }
  getGroup() {
    return this.group;
  }
  getHeight() {
    return this.wallHeight;
  }
  setHeight(height) {
    this.wallHeight = height;
    this.heightScale = height;
  }
  setColor(color) {
    this.color = color;
    console.log("setColor", color);
  }

  setFrameColor(item) {
    this.frame.setFrameColor(item);
  }

  renderColor() {
    console.log("renderColor", this.color);
    this.mesh.material.emissive.setHex(this.color);
  }
  addImageFile(file) {
    console.log("addImageFile", file);
    // debugger;
    this.frame.addArt(file);
    this.hasArt = true;
    this.spotLight.intensity = 1;
    this.spotlightAdded = true;
    // debugger;
    this.frameGroup.children[0].material.opacity = 1;
  }
}

export default WallEntity;
