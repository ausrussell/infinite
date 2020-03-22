// import React, { Component } from "react";
import * as THREE from "three";

export default class Surroundings {
  constructor(builder) {
    this.builder = builder;
  }
  

  surroundingsTileCallback = item => {
    console.log("surroundingsTileCallback item", item);


    const urls = [
      item.px,item.nx,item.py,item.ny,item.pz,item.nz
    ];

    var reflectionCube = new THREE.CubeTextureLoader().load( urls );
    // var refractionCube = new THREE.CubeTextureLoader().load( urls );
    // refractionCube.mapping = THREE.CubeRefractionMapping;

    // scene = new THREE.Scene();
    this.builder.scene.background = reflectionCube;
  };

  getExport = () => this.export;
}
