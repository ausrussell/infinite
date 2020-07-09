// import React, { Component } from "react";
import * as THREE from "three";

export default class Surroundings {
  constructor(builder) {
    this.builder = builder;
    this.scene = this.builder.scene
    this.export = {};
  }

  surroundingsTileCallback = item => {
    console.log("surroundingsTileCallback item", item);
    if (item) {
      this.export = item;
      this.setDataToMaterial(item)
    }
    else {
      this.reset();
    }
  };

  setDataToMaterial(item) {
    const urls = [
      item.px, item.nx, item.py, item.ny, item.pz, item.nz
    ];
    var reflectionCube = new THREE.CubeTextureLoader().load(urls);
    console.log("reflectionCube",reflectionCube)
    this.scene.background = reflectionCube;
  }

  reset() {
    this.export = null;
    this.destroy();
    this.scene.background = null;
  }

  getExport = () => {
    this.export && delete this.export.ref;
    return this.export;
  }

  destroy() {
    this.scene.background.image = []
    this.scene.background.dispose();
    this.scene.background = null;

  }
}
