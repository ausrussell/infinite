// import React, { Component } from "react";
import * as THREE from "three";
import TextureAdder from "../../Helpers/TextureAdder"


export default class Floor {
  constructor(props) {
    console.log("just floor",props)
    this.builder = props.builder;
    this.addFloorMesh();
    this.textureAdder = new TextureAdder({material: this.floorMaterial});
    this.export = { color: "#f8f1f0" };
  }

  renderFloor() {
    console.log("renderFloor", this.scene, this.floorItem);
    this.addFloorMesh();
    this.setDataToMaterial(this.data);
  }

  getFloorMesh() {
    return this.floorMesh;
  }

  setFloorMaterial(){
    this.floorMaterial = new THREE.MeshStandardMaterial({
      transparent: true
      // roughness: 0.8,
      // color: 0xffffff,
      // metalness: 0.2,
      // bumpScale: 0.0005
      // side: THREE.DoubleSide
    });
  }
  addFloorMesh() {
    this.floorPlane = new THREE.PlaneBufferGeometry(
      this.builder.gridWidth,
      this.builder.gridDepth
    );
    this.setFloorMaterial();

    this.floorMesh = new THREE.Mesh(this.floorPlane, this.floorMaterial);
    this.floorMesh.name = "mainFloor";
    this.floorMesh.receiveShadow = true;
    this.floorMesh.rotateX(-Math.PI / 2);
    console.log("this.floorMesh", this.floorMesh);
    this.builder.scene.add(this.floorMesh);

    // const geometry = new THREE.BoxGeometry(10, 10, 10);//uncomment to show box
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0xffffff
    //   // wireframe: true
    // });
    // const mesh = new THREE.Mesh(geometry, material);
    // // this.builder.scene.add(mesh); 

  }
  setDataToMaterial(data) {
    this.textureAdder.setDataToMaterial(data);
  }

  resetMaterial(){
    this.floorMaterial.dispose();
    this.floorMesh.material = null;
    this.setFloorMaterial();
    this.floorMesh.material = this.floorMaterial;
    this.textureAdder = new TextureAdder({material: this.floorMaterial});
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
