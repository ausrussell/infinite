import React, { Component } from "react";
import * as THREE from "three";
import Frame from "./Frame";
import WallLight from "./WallLight";
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

    this.defaultFrameWidth = this.wallWidth * 0.8;
    this.defaultFrameHeight = 20;
    this.builderWidth = this.builder.width;
    this.midpointX = this.builder.voxelsX / 2;
    this.midpointY = this.builder.voxelsY / 2;
    // this.wallHeight = 1;

    this.buildVelocity = 10;
    this.setXYZ();
    this.sides = { front: {}, back: {} };

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

  dragOverHandler(side) {
    this.currentSideOver = this.sides[side];
    // if (!this.spotlightAdded && !this.hasArt) {
    //   // this.wallSpotlight = this.getDefaultWallSpotlight();
    //   // this.group.add(this.wallSpotlight);
    //   this.spotLight.intensity = 1;
    //   this.spotlightAdded = true;
    //   this.frameGroup.children[0].material.opacity = 1;
    // }

    this.currentSideOver.wallLight.switchOn(0.5);

    // this.group.add(this.wallSpotlight);
  }
  dragOutHandler(side) {
    const currentSide = this.sides[side];

    if (!this.hasArt) {
      // this.frameGroup.children[0].material.opacity = 0;

      this.currentSideOver.wallLight.switchOff();
      // this.currentSide.spotlightAdded = false;
    }
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
      // this.frame = new Frame(this);
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
      // this.wallSpotlight = this.getDefaultWallSpotlight();
      // this.group.add(this.wallSpotlight);
      this.addLights();
      this.addFrames();
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

  addFrames() {
    this.frameFront = new Frame(this);
    this.frameFront.setFrameMesh(
      this.defaultFrameWidth,
      this.defaultFrameHeight
    );
    this.frameGroupFront = this.frameFront.getFrameGroup();
    this.frameBack = new Frame(this, "back");
    this.frameBack.setFrameMesh(
      this.defaultFrameWidth,
      this.defaultFrameHeight
    );
    this.frameGroupBack = this.frameBack.getFrameGroup();

    // console.log("this.frame.hasArt", this.frame.hasArt);
    // if (this.frame.hasArt) {
    //   this.spotLight.intensity = 0.1;
    // }
    this.sides.front.frame = this.frameFront;
    this.sides.back.frame = this.frameBack;

    this.group.add(this.frameGroupFront);
    this.group.add(this.frameGroupBack);
  }

  addLights() {
    this.wallLightFront = new WallLight(this);
    this.wallLightFront.setWallLight();
    // this.spotLight.shadow.camera.fov = this.controls.fov;
    this.mesh.updateMatrix();
    this.wallLightFrontGroup = this.wallLightFront.getWallLightGroup();
    this.sides.front.wallLight = this.wallLightFront;
    this.group.add(this.wallLightFrontGroup);

    this.wallLightBack = new WallLight(this, "back");
    this.wallLightBack.setWallLight();
    this.wallLightBackGroup = this.wallLightBack.getWallLightGroup();
    this.sides.back.wallLight = this.wallLightBack;
    this.group.add(this.wallLightBackGroup);
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

  setFrameColor(item, side) {
    this.sides[side].frame.setFrameColor(item);
  }

  renderColor() {
    console.log("renderColor", this.color);
    this.mesh.material.emissive.setHex(this.color);
  }
  addImageFile(file, side) {
    console.log("addImageFile", file);
    this.builder.scene.updateMatrixWorld(true);
    this.sides[side].frame.addArt(file);
    this.sides[side].wallLight.switchOn();
    this.hasArt = true;
    // this.sides[side].wallLight.switchOn
    // this.sidess[side].spotlightAdded = true;
    // this.frameGroup.children[0].material.opacity = 1;
  }
}

export default WallEntity;
