// import React, { Component } from "react";
import * as THREE from "three";

export default class Surroundings {
  constructor(builder) {
    this.builder = builder;
    this.export = {};
  }


  surroundingsTileCallback = item => {
    console.log("surroundingsTileCallback item", item);
    if (item){
    this.export = item;
    this.setDataToMaterial(item)
    }
    else {
      this.reset();
    }
  };

  setDataToMaterial(item){
      const urls = [
        item.px, item.nx, item.py, item.ny, item.pz, item.nz
      ];
      var reflectionCube = new THREE.CubeTextureLoader().load(urls);
      this.builder.scene.background = reflectionCube; 
  }

  reset(){
    this.export = null;
    this.builder.scene.background = null;
  }

  getExport = () => {
    // debugger;
    this.export && delete this.export.ref;
    return this.export;}
}
