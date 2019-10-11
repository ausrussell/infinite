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
    this.defaultImageWidth = this.wallWidth * 0.6;
    this.defaultImageHeight = 15;
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
    this.wallMesh.name = "wallMesh";
    this.wallGroup = new THREE.Group();
    this.wallGroup.receiveShadow = true;
    // this.group.castShadow = true;
    this.wallGroup.add(this.wallMesh);
    this.wallGroup.name = "wallGroup";
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

    wallAni.animate(performance.now());
    this.opacity = 1;
    this.wallMaterial.opacity = this.opacity;
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
      // this.currentSideOver.defaultFrame.addDefault();
      this.wallGroup.add(this.currentSideOver.defaultFrame.group);
      // this.builder.setSceneMeshes(); //maybe update method in builder
    }
  }

  dragOutHandler(side) {
    this.currentSideOver.wallLight.hoverOff();
    if (!this.sides[side].hasArt) {
      this.wallGroup.remove(this.currentSideOver.wallLight.spotLight); //???
      this.wallGroup.remove(this.currentSideOver.defaultFrame.group);
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
    Object.keys(this.sides).forEach(side =>
      this.createDefaultFramesForSide(side)
    );
  }
  createDefaultFramesForSide(side) {
    this.sides[side].defaultFrame = new Frame(this, side);
    let options = {
      imageWidth: this.defaultImageWidth,
      imageHeight: this.defaultImageHeight,
      defaultFrame: true,
      index: 0
    };
    this.sides[side].defaultFrame.setDefaultFrameGroup(options);
    this.sides[side].frames = [];
  }

  positionMovedHolder(artMesh, side) {
    this.builder.scene.updateMatrixWorld(true);
    let index = this.sides[side].frames.push(new Frame(this, side));
    this.sides[side].frames[index - 1].setArtMesh(artMesh);
    this.sides[side].hasArt = true;
    this.currentSideOver = this.sides[side];
    this.updateWallLight(side);
    console.log("positionMovedHolder this.wallGroup", this.wallGroup);
    console.log(
      "positionMovedHolder this.currentSideOver",
      this.currentSideOver
    );
  }

  updateWallLight(side) {
    if (this.sides[side].hasArt) {
      this.wallGroup.add(this.sides[side].wallLight.spotLight);
      this.sides[side].wallLight.switchOn();
    } else {
      this.wallGroup.remove(this.sides[side].wallLight.spotLight);
    }
  }

  removeFrame(frame, side) {
    console.log("removing frame from ", this.col);
    console.log("light off ", side, this.sides[side].wallLight.spotLight);

    let index = this.sides[side].frames.indexOf(frame);
    console.log(
      "removeFrame",
      this.col,
      this.sides[side].frames.indexOf(frame)
    );
    this.sides[side].frames.splice(index, 1);
    console.log(
      "removeFrame after splice",
      this.sides[side].frames.indexOf(frame)
    );
    this.switchLightOffIfNoArt(side);
  }
  switchLightOffIfNoArt(side) {
    console.log(
      "switchLightOffIfNoArt this.sides[side].frames",
      this.sides[side].frames
    );
    if (this.sides[side].frames.length === 0) {
      this.sides[side].hasArt = false;
    }
    this.updateWallLight(side);
  }
  addImageFile(file, side, holderOver) {
    //need to fix holderOver for when dropped on art
    console.log("addImageFile", this.col, side);
    this.builder.scene.updateMatrixWorld(true);
    this.sides[side].hasArt = true;
    console.log("addImageFile", this.sides[side].frames);
    if (holderOver.defaultArtMesh || holderOver.wallOver) {
      this.sides[side].wallLight.hoverOff();
      let index = this.sides[side].frames.push(new Frame(this, side));
      this.currentSideOver.frames[index - 1].addArt(
        file,
        this.currentSideOver.defaultFrame
      );
      this.wallGroup.remove(this.currentSideOver.defaultFrame.group);

      // this.currentSideOver.defaultFrame.addArt(file);
      // this.currentSideOver.defaultFrame.removeDefault();
      this.updateWallLight(side);
      return;
    }

    this.sides[side].wallLight.hoverOff();
  }

  setFrameColor(item, side) {
    this.sides[side].frame.setFrameColor(item);
  }
}

export default WallObject;
