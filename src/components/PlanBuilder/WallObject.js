// import React, { Component } from "react";
import * as THREE from "three";
import Frame from "./Frame";
import WallLight from "./WallLight";
import Animate from "../../Helpers/animate";
// import * as dat from "dat.gui";

// const gui = new dat.GUI();

class WallObject {
  constructor(options) {
    const { x, y, pos, builder } = options;
    this.col = x;
    this.row = y;
    this.pos = pos;
    this.builder = builder;
    this.midpointX = this.builder.voxelsX / 2;
    this.midpointY = this.builder.voxelsY / 2;
    this.height = 60; //1;
    this.opacity = 0;
    this.sides = { front: {}, back: {} };
    this.wallWidth = 20;
    this.wallHeight = 60;
    this.wallDepth = 5;
    this.defaultFrameWidth = this.wallWidth * 0.8;
    this.defaultFrameHeight = 20;
    this.setXZPos();
    this.renderWall();
    this.addLights();
    this.addFrames();
  }

  initialAnimateBuild(index) {
    const animationStartDelay =
      this.builder.initialAnimationTime / this.builder.wallEntities.length;
    setTimeout(() => this.animateWallBuild(), index * animationStartDelay);
  }

  setXZPos() {
    this.posX =
      (this.col - this.midpointX) * this.wallWidth + this.wallWidth / 2;
    this.posZ = (this.row - this.midpointY) * this.wallWidth;
  }

  renderWall() {
    const geometry = new THREE.BoxGeometry(
      this.wallWidth,
      this.wallHeight,
      this.wallDepth
    );
    this.wallMaterial = new THREE.MeshStandardMaterial({
      // wireframe: true
      color: 0xe1f5fe,
      opacity: this.opacity,
      transparent: true
    });
    this.wallMesh = new THREE.Mesh(geometry, this.wallMaterial);
    this.wallGroup = new THREE.Group();
    // this.group.receiveShadow = true;
    // this.group.castShadow = true;
    this.wallGroup.add(this.wallMesh);

    this.builder.scene.add(this.wallGroup);
    this.builder.scene.updateMatrixWorld(true);
    this.wallGroup.position.set(this.posX, this.height / 2, this.posZ);
    this.builder.scene.updateMatrixWorld(true);
    if (this.pos === 0) {
      this.wallGroup.translateX(-(this.wallWidth / 2)); //
      this.wallGroup.translateZ(this.wallWidth / 2);
      this.wallGroup.rotateY(Math.PI / 2);
    }
  }

  animateWallBuild() {
    const wallAni = new Animate({
      duration: 1000,
      timing: "circ",
      draw: progress => this.drawing(progress)
    });
    this.opacity = 1;
    this.wallMaterial.opacity = this.opacity;
    wallAni.animate(performance.now());
  }
  drawing = progress => {
    progress += 0.01;
    this.wallMesh.scale.set(1, progress, 1);

    this.wallGroup.position.set(
      this.wallGroup.position.x,
      (this.height * this.wallMesh.scale.y) / 2, //-
      this.wallGroup.position.z
    );
  };
  getMesh() {
    return this.wallMesh;
  }
  dragEnterHandler(side) {
    console.log("dragEnterHandler", side);
    this.currentSideOver = this.sides[side];
    this.currentSideOver.wallLight.hoverOn();
    this.wallGroup.add(this.currentSideOver.wallLight.spotLight);
    if (!this.sides[side].hasArt) {
      this.currentSideOver.frame.addDefault();
    }
  }

  dragOutHandler(side) {
    this.currentSideOver.wallLight.hoverOff();
    if (!this.sides[side].hasArt) {
      this.wallGroup.remove(this.currentSideOver.wallLight.spotLight);
      this.currentSideOver.frame.removeDefault();
    }
  }

  addLights() {
    Object.keys(this.sides).forEach(side => this.lightsForSide(side));
  }
  lightsForSide(side) {
    this.sides[side].wallLight = new WallLight(this, side);
    this.sides[side].wallLight.setWallLight();
  }
  addFrames() {
    Object.keys(this.sides).forEach(side => this.framesForSide(side));
  }
  framesForSide(side) {
    this.sides[side].frame = new Frame(this, side);
    let options = {
      totalWidth: this.defaultFrameWidth,
      totalHeight: this.defaultFrameHeight,
      defaultFrame: true
    };
    this.sides[side].frame.setFrameMesh(options);
    this.wallGroup.add(this.sides[side].frame.group);
  }
  addImageFile(file, side) {
    console.log("addImageFile", file);
    this.builder.scene.updateMatrixWorld(true);
    this.sides[side].hasArt = true;
    this.sides[side].frame.addArt(file);
    this.sides[side].wallLight.switchOn();
    this.sides[side].wallLight.hoverOff();
  }
}

export default WallObject;
