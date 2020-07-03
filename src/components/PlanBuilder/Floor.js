// import React, { Component } from "react";
import * as THREE from "three";
import TextureAdder from "../../Helpers/TextureAdder"


export default class Floor {
  constructor(props) {
    console.log("just floor", props)
    this.builder = props.builder;
    // this.addFloorMesh();
    this.export = { color: "#f8f1f0" };
  }

  renderFloor() {
    console.log("renderFloor", this.scene, this.floorItem);
    this.addFloorMesh();
    this.setDataToMaterial();
  }

  getFloorMesh() {
    return this.floorMesh;
  }

  setFloorMaterial() {
    this.floorMaterial = new THREE.MeshStandardMaterial();
  }
  addFloorMesh(item) {
    // this.builder.gridDepth,
    // this.builder.gridWidth,
    this.export = item;
    this.floorPlane = new THREE.PlaneBufferGeometry(
      this.builder.state.voxelsX * this.builder.state.wallWidth,
      this.builder.state.voxelsY * this.builder.state.wallWidth
    );
    this.setFloorMaterial();
    this.textureAdder = new TextureAdder({ material: this.floorMaterial });
    if (item) this.setDataToMaterial(item);
    this.floorMesh = new THREE.Mesh(this.floorPlane, this.floorMaterial);
    this.floorMesh.name = "mainFloor";
    this.floorMesh.receiveShadow = true;
    this.floorMesh.rotateX(-Math.PI / 2);
    console.log("this.floorMesh", this.floorMesh);
    this.builder.scene.add(this.floorMesh);
  }

  setDataToMaterial(data) {
    this.textureAdder.setDataToMaterial(data);
  }

  resetMaterial() {
    this.floorMaterial.dispose();
    this.floorMesh.material = null;
    this.setFloorMaterial();
    this.floorMesh.material = this.floorMaterial;
    this.textureAdder = new TextureAdder({ material: this.floorMaterial });
    this.export = { color: "#f8f1f0" };
  }

  floorTileCallback = item => {
    console.log("floorTileCallback item", item);
    this.export = item;
    delete this.export.ref;
    this.setDataToMaterial(item);
  };

  getExport = () => this.export;
}
