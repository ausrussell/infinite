import React, { Component } from "react";
import * as THREE from "three";

const texturesPath = "../textures/";

export const floorData = [
  {
    key: 0,
    type: "texture-array",
    url: texturesPath + "wood/hardwood2_diffuse.jpg",
    floorMat: new THREE.MeshStandardMaterial({
      roughness: 0.8,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.0005
    }),
    map: texturesPath + "wood/hardwood2_diffuse.jpg",
    bumpMap: texturesPath + "wood/hardwood2_bump.jpg",
    roughnessMap: texturesPath + "wood/hardwood2_roughness.jpg"
  },
  {
    key: 1,
    type: "texture-array",
    url: texturesPath + "concrete_stone/concrete01_diff.jpg",
    floorMat: new THREE.MeshStandardMaterial({
      roughness: 0.8,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.0005
    }),
    map: texturesPath + "concrete_stone/concrete01_diff.jpg",
    bumpMap: texturesPath + "concrete_stone/concrete01_norm.jpg",
    roughnessMap: texturesPath + "concrete_stone/concrete01_spec.jpg"
  },
  { key: 9, type: "color", color: "#543499" },
  { key: 10, color: "#564449", type: "color" },
  { key: 2, type: "color", color: "#111111" },
  { key: 3, type: "color", color: "#FFFFFF" },
  { key: 4, type: "texture", url: "../textures/wood/hardwood.jpg" },
  {
    key: 5,
    type: "texture",
    url: "../textures/concrete_stone/concrete01_diff.jpg"
  },
  {
    key: 6,
    type: "texture",
    url: "../textures/concrete_stone/stonetiles_001_diff.jpg"
  },
  {
    key: 7,
    type: "texture",
    url: "../textures/concrete_stone/stonetiles_002_diff.jpg"
  },
  {
    key: 8,
    type: "texture",
    url: "../textures/concrete_stone/stonetiles_003_diff.jpg"
  }
];

export default class Floor {
  constructor(builder) {
    this.builder = builder;
    this.addFloorMesh();
  }
  // setScene(scene) {
  //   this.scene = scene;
  // }
  getFloorMesh() {
    return this.floorMesh;
  }
  addFloorMesh() {
    this.floorPlane = new THREE.PlaneBufferGeometry(
      this.builder.gridWidth,
      this.builder.gridWidth,
      10
    );
    // this.floorMaterial = new THREE.MeshLambertMaterial({
    //   //MeshStandardMaterial
    //   color: "#ffffff",
    //   side: THREE.DoubleSide
    // });

    this.floorMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.8,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.0005
      // side: THREE.DoubleSide
    });

    this.floorMesh = new THREE.Mesh(this.floorPlane, this.floorMaterial);
    this.floorMesh.receiveShadow = true;
    this.floorMesh.rotateX(-Math.PI / 2);
    console.log("this.floorMesh", this.floorMesh);
    // this.scene = this.builder.scene;

    this.builder.scene.add(this.floorMesh);
  }

  floorLoadHandler = texture => {
    this.floorMaterial.color.set("#fff");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(25, 25);
    this.floorMaterial.map = texture;
    this.floorMaterial.needsUpdate = true;
  };

  floorArrayMapLoadHandler = map => {
    // this.floorMaterial.color.set("#fff");

    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    map.repeat.set(10, 24);
    this.floorMaterial.map = map;
    this.floorMaterial.needsUpdate = true;
  };

  floorArrayMapLoadHandler = map => {
    console.log("floorArrayMapLoadHandler");

    this.floorMaterial.color.set("#fff");

    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    map.repeat.set(10, 24);
    this.floorMaterial.map = map;
    this.floorMaterial.needsUpdate = true;
  };
  floorArrayMapBumpLoadHandler = map => {
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    map.repeat.set(10, 24);
    this.floorMaterial.bumpMap = map;
    this.floorMaterial.needsUpdate = true;
    console.log("floorArrayMapBumpLoadHandler");
  };
  floorArrayMapRoughnessLoadHandler = map => {
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    map.repeat.set(10, 24);
    this.floorMaterial.roughnessMap = map;
    this.floorMaterial.needsUpdate = true;
    console.log("floorArrayMapRoughnessLoadHandler");
    console.log("floorMesh", this.floorMesh);
  };

  floorTileCallback = item => {
    console.log("floor tile", item);
    if (item.color) {
      this.floorMaterial.map = null;
      this.floorMaterial.color.set(item.color);
      this.floorMaterial.needsUpdate = true;
    } else if (item.type === "texture") {
      var loader = new THREE.TextureLoader();
      // loader.crossOrigin = "";
      this.floorMaterial.map = null;

      loader.load(item.url, texture => this.floorLoadHandler(texture));
    } else if (item.type === "texture-array") {
      // debugger;
      // this.floorMaterial = item.floorMat;
      // this.floorMaterial.needsUpdate = true;

      var textureLoader = new THREE.TextureLoader();
      textureLoader.load(item.map, map => this.floorArrayMapLoadHandler(map));
      textureLoader.load(item.bumpMap, map =>
        this.floorArrayMapBumpLoadHandler(map)
      );
      textureLoader.load(item.roughnessMap, map =>
        this.floorArrayMapRoughnessLoadHandler(map)
      );
    }
  };
}
