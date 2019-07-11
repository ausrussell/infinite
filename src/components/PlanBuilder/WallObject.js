// import React, { Component } from "react";
import * as THREE from "three";
import Frame from "./Frame";
import WallLight from "./WallLight";
import animate from "../../Helpers/animate";
// import * as dat from "dat.gui";

// const gui = new dat.GUI();

const wallWidth = 20;
const wallHeight = 60;
const wallDepth = 5;

class WallObject {
  constructor(options) {
    const { x, y, pos, builder, totalWalls } = options;
    this.col = x;
    this.row = y;
    this.pos = pos;
    this.builder = builder;
    this.midpointX = this.builder.voxelsX / 2;
    this.midpointY = this.builder.voxelsY / 2;
    this.height = 1;
    this.setXZPos();

    // this.renderWall();
    // this.animateWallBuild();
    // setTimeout(
    //   () =>
    //     (this.animateBuildInterval = setInterval(
    //       () => this.animateWallBuild(),
    //       20
    //     )),
    //   100 * this.row * this.col
    // );
    // this.animateBuildInterval = setInterval(
    //   () => this.animateWallBuild(),
    //   10 * this.row * this.col
    // );
  }

  initialAnimateBuild(index) {
    // debugger;
    // if (this.bulder) {
    const animationStartDelay = 8000 / this.builder.wallEntities.length;
    setTimeout(() => this.animateWallBuild(), index * animationStartDelay);
    // } else {
    //   debugger;
    // }
  }

  setXZPos() {
    this.posX = (this.col - this.midpointX) * wallWidth + wallWidth / 2;
    this.posZ = (this.row - this.midpointY) * wallWidth;
  }

  renderWall() {
    const geometry = new THREE.BoxGeometry(wallWidth, this.height, wallDepth);
    this.wallMaterial = new THREE.MeshStandardMaterial({
      // wireframe: true
      color: 0xe1f5fe
    });
    this.wallMesh = new THREE.Mesh(geometry, this.wallMaterial);
    this.wallGroup = new THREE.Group();
    // this.group.receiveShadow = true;
    // this.group.castShadow = true;
    this.wallGroup.add(this.wallMesh);
    this.builder.scene.add(this.wallGroup);

    this.builder.scene.updateMatrixWorld(true);
    this.wallGroup.position.set(this.posX, this.height / 2, this.posZ); //this.height / 2
    this.builder.scene.updateMatrixWorld(true);

    if (this.pos === 0) {
      this.wallGroup.translateX(-(wallWidth / 2));
      this.wallGroup.translateZ(wallWidth / 2);
      this.wallGroup.rotateY(Math.PI / 2);
    }
  }

  animateWallBuild() {
    const wallAni = new animate({
      duration: 2000,
      timing: "circ",
      draw: progress => this.drawing(progress)
    });
    wallAni.animate(performance.now());
  }
  drawing = progress => {
    this.height = 60 * progress;
    this.builder.scene.remove(this.wallGroup);
    this.renderWall();
  };
}

export default WallObject;
