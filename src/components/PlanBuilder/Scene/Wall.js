// import React, { Component } from "react";
import * as THREE from "three";
import Art from "./Art";
// import WallLight from "./WallLight";
// import Animate from "../../Helpers/animate";
import {
  setDataToNewMaterial,
  disposeNode,
} from "../../../Helpers/TextureAdder";

export default class Wall extends THREE.Mesh {
  constructor({ wall, floorplan, scene }) {
    super();
    this.scene = scene;
    this.data = wall;
    this.floorplan = floorplan;
    this.name = "wall";
    this.createWall(wall);
    this.setDataToNewMaterial();
    this.addFramesToSides();
  }
  createWall() {
    const { wallWidth, wallHeight, wallDepth } = this.floorplan.defaults;
    this.geometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
    this.material = new THREE.MeshStandardMaterial();
    this.position.set(...this.getPosition());
    this.scene.add(this);
  }

  getPosition() {
    const { wallWidth, wallHeight } = this.floorplan.defaults;
    const midCol = this.floorplan.data.length / 2;
    const midRow = this.floorplan.data[0].length / 2;
    let x = (this.data.col - midCol) * wallWidth + wallWidth / 2;
    let z = (this.data.row - midRow) * wallWidth;
    const y = wallHeight / 2;
    if (this.data.pos === 0) {
      x -= wallWidth / 2;
      z += wallWidth / 2;
      this.rotateY(Math.PI / 2);
    }
    return [x, y, z];
  }

  removeGroup() {
    disposeNode(this);
    this.scene.remove(this);
  }

  addFramesToSides() {
    Object.entries(this.data.sides || {}).forEach((sideItem) => {
      const side = sideItem[0];
      sideItem[1].forEach((data) => {
        const options = {
          wall: this,
          side,
          data,
        };
        new Art(options);
      });
    });
  }

  setDataToNewMaterial() {
    setDataToNewMaterial(this.data.texture, this.material);
  }
}
