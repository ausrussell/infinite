// import React, { Component } from "react";
import * as THREE from "three";

export default class Surroundings {
  constructor(builder) {
    this.builder = builder;
  }
  setDataToMaterial = item => {
    this.surroundingsTileCallback(item)
  }

  surroundingsTileCallback = item => {
    console.log("surroundingsTileCallback item", item);
    this.export = item;
if (item){
    const urls = [
      item.px, item.nx, item.py, item.ny, item.pz, item.nz
    ];
    console.log("surroundings urls", urls)
    var reflectionCube = new THREE.CubeTextureLoader().load(urls);
    this.builder.scene.background = reflectionCube;}
    else {
      this.reset();
    }
  };

  reset(){
    this.builder.scene.background = null;
  }

  getExport = () => {
    delete this.export.ref;
    return this.export;}
}
