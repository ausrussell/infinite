// import React, { Component } from "react";
//... [ 0] [ 3] [ 6] [ 9]  [0,0] [1,0] [2,0] [3,0]   [  ] [py] [  ] [  ]      [ ] [2] [ ] [ ]     
//... [ 1] [ 4] [ 7] [10]  [0,1] [1,1] [2,1] [3,1]   [nx] [pz] [px] [nz]      [1] [4] [0] [5]     
//... [ 2] [ 5] [ 8] [11]  [0,2] [1,2] [2,2] [3,2]   [  ] [ny] [  ] [  ]
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
    console.log("surroundings setDataToMaterial urls",urls)
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
