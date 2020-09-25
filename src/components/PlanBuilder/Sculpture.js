// import React, { Component } from "react";
import * as THREE from "three";
// import { Vector3 } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
const { Quaternion } = THREE;

export default class Sculpture {
  constructor(builder) {
    this.builder = builder;
    this.scene = this.builder.scene
    this.export = {};
    this.loader = new GLTFLoader();
    console.log("Sculpture scene", this.scene)
  }

  surroundingsTileCallback = item => {
    console.log("Sculpture surroundingsTileCallback item", item);
    if (item) {
      this.export = item;
      this.setDataToMaterial(item)
    }
    else {
      this.reset();
    }
  };

  setDataToMaterial = ({ url,
    position,
    quaternion,
    scale,
    clips }) => {
    console.log("sculpture url", url);
    this.url = url;
    this.loader.load(url, (gltf) => {
      this.gltf = gltf;
      this.gltfScene = gltf.scene;


      if (position){//from database
        this.gltfScene.position.set(position.x, position.y, position.z);
        // this.gltfScene.children[0].rotation.set(0, 0,  - Math.PI / 2);
        // this.scene.add(this.gltfScene);
  
        const rotation = new Quaternion(quaternion._x, quaternion._y, quaternion._z, quaternion._w)
        this.gltfScene.setRotationFromQuaternion(rotation);
  
        this.gltfScene.scale.set(scale.x, scale.y, scale.z)

        // var boundingBox = new THREE.Box3();
        // var mesh = gltf.children[0];
        // boundingBox.copy( mesh.geometry.boundingBox );
        // mesh.updateMatrixWorld( true ); // ensure world matrix is up to date
        // boundingBox.applyMatrix4( mesh.matrixWorld );




      } else {//from tile
        // const box = new THREE.Box3().setFromObject(this.gltfScene);
        // const center = box.getCenter(new THREE.Vector3());
        // this.gltfScene.position.x += (gltf.scene.position.x - center.x);
        // this.gltfScene.position.y += (gltf.scene.position.y - center.y);
        // gltf.scene.position.z += (gltf.scene.position.z - center.z);

      }

      this.scene.add(this.gltfScene);
this.setHelper();



      this.checkforAnimations();
      this.builder.sculptureCallback(this)
    });
  }

  setHelper(){
    const box = new THREE.Box3().setFromObject(this.gltfScene);
    this.helper = new THREE.Box3Helper( box, 0xffff00 );

    this.scene.add(this.helper);
  }

  checkforAnimations() {
    this.clips = this.gltf.animations || [];
    if (this.clips.length > 0) {
      this.mixer = new THREE.AnimationMixer(this.gltfScene);
    }
  }

  playAnimation(value) {
    var action = this.mixer.clipAction(this.clips[0]);// need to check name for multiples
    // if (this.builder.preview || this.builder.fla){
    if (value) {
      action.play();
      console.log("playAnimation", action);

    }
    else {
      action.stop();
    console.log("stopAnimation", action);

    }
    // }
  }

  addItemToBuilder(item) {
    this.setDataToMaterial(item);
  }

  reset() {
    this.export = null;
    this.destroy();
    this.scene.background = null;
  }

  getExport = () => {
    console.log("this.gltfScene", this.gltfScene, this.gltfScene.position, this.gltfScene.children[0].position);
// debugger;
    let { x, y, z } = this.gltfScene.position;
    const position = { x: x, y: y, z: z }
    const { _w, _x, _y, _z } = this.gltfScene.quaternion;
    const quaternion = { _w: _w, _x: _x, _y: _y, _z: _z }
    const s = this.gltfScene.scale;
    const scale = { x: s.x, y: s.y, z: s.z }

    const exportValues = {
      url: this.url,
      position: position,
      quaternion: quaternion,
      scale: scale,
      clips: this.clips ? this.clips.length : null
    }
    console.log("exportValues", exportValues)


    return exportValues;
  }

  // add3dFromData = (sculptureOptions) => {
  //   const { url,
  //     position,
  //     quaternion,
  //     scale,
  //     clips } = sculptureOptions;
  //   this.loader.load(url, (gltf) => {
  //     this.gltf = gltf;
  //     this.url = url;
  //     this.gltfScene = gltf.scene;
  //     const box = new THREE.Box3().setFromObject(gltf.scene);
  //     const center = box.getCenter(new THREE.Vector3());
  //     // gltf.scene.position.x += ( gltf.scene.position.x - center.x );
  //     // gltf.scene.position.y += ( gltf.scene.position.y - center.y  );
  //     // gltf.scene.position.z += ( gltf.scene.position.z - center.z );
  //     console.log("this.gltfScene.position", this.gltfScene.position)

  //     this.gltfScene.children[0].position.set(position.x, position.y, position.z);
  //     // this.gltfScene.children[0].rotation.set(0, 0,  - Math.PI / 2);
  //     this.scene.add(this.gltfScene);

  //     const rotation = new Quaternion(quaternion._x, quaternion._y, quaternion._z, quaternion._w)
  //     this.gltfScene.children[0].setRotationFromQuaternion(rotation);

  //     this.gltfScene.children[0].scale.set(scale.x, scale.y, scale.z)

  //     // this.clips = clips || null;
  //     if (clips) {
  //       // debugger;
  //       this.checkforAnimations();

  //       this.playAnimation(true);
  //     }
  //     if (this.builder.sculptureCallback) this.builder.sculptureCallback(this); //just for builder
  //   });
  // }

  destroy() {
    this.scene.background.image = []
    this.scene.background.dispose();
    this.scene.background = null;

  }


}
