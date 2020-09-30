// import React, { Component } from "react";
import * as THREE from "three";
// import { Vector3 } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Animate from "../../Helpers/animate";

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

  setDataToMaterial = (data) => {

    const { url,
      position,
      quaternion,
      scale,
      key } = data;
    this.key = key;
    this.url = url;
    this.loader.load(url, (gltf) => {
      this.gltf = gltf;
      this.gltfScene = gltf.scene;

      this.rotationGroup = new THREE.Group();

      if (position) {//from database
        this.gltfScene.position.set(position.x, position.y, position.z);
        this.rotation = new Quaternion(quaternion._x, quaternion._y, quaternion._z, quaternion._w)
        this.gltfScene.scale.set(scale.x, scale.y, scale.z);
        // this.rotationGroup = new THREE.Group();
        this.rotationGroup.add(this.gltfScene)
        this.ratio = 1;
        this.setHelper();
        this.scene.add(this.rotationGroup);
        this.setViewingPosition();
        this.rotationGroup.setRotationFromQuaternion(this.rotation);

      } else {//from tile
        this.rotationGroup.add(this.gltfScene)
        this.setHelper();
        this.scene.add(this.rotationGroup);
      }

      // this.scene.add(this.rotationGroup);

      this.gltfScene.scope = this;
      // this.scene.add(this.viewingPosition);


      this.checkforAnimations();
      this.builder.sculptureCallback(this)
    });
  }

  artLeaveHandler = () => {
    console.log("artLeaveHandler in sculpture");
    this.hoverOff();
  }


  hoverOn() {
    this.helper.visible = true
  }

  hoverOff() {
    console.log("Sculpture hoverOff", this.helper)
    this.helper.visible = false;
  }

  artHoverHandler = () => {
    this.artHoverAni = new Animate({
      duration: 1200,
      timing: "circ",
      repeat: true,
      draw: progress => this.artHoverLoop(progress),
      bounce: true
    });
    this.artHoverAni.animate();
  }


  artHoverLoop = progress => {
    this.fHoverMaterial.opacity = .25 + (progress * .5);
  }

  setHelper() {
    const box = new THREE.Box3().setFromObject(this.gltfScene);
    this.center = box.getCenter(new THREE.Vector3());
    const size = box.getSize();
    this.imageWidth = size.x;
    this.imageHeight = size.y;
    this.ratio = size.x / size.y;
    this.helper = new THREE.Box3Helper(box, 0x4527a0);
    this.helper.material.linewidth = 4;//doesn't do anything?
    this.helper.visible = false;
    console.log("this.helper", this.helper)
    this.rotationGroup.add(this.helper);

  }
  setViewingPosition() {
    const helperTargetGeometry = new THREE.ConeGeometry(5, 20, 32);
    helperTargetGeometry.rotateX(Math.PI / 2);
    helperTargetGeometry.rotateY(Math.PI);
    const helperTargetMaterial = new THREE.MeshNormalMaterial({
      color: 0xcfccee,
      transparent: true,
      opacity: 0
    });

    this.viewingPosition = new THREE.Mesh(
      helperTargetGeometry,
      helperTargetMaterial
    );

    this.viewingPosition.name = "helperTarget";
console.log("this.helper.position.x",this.helper.position.x, this.helper.getWorldPosition());
const helperWorldPos = this.helper.getWorldPosition()
    this.viewingPosition.position.x = helperWorldPos.x;//(this.gltfScene.position.x - center.x);
    this.viewingPosition.position.y = helperWorldPos.y;//+= (this.gltfScene.position.y - center.y);
    this.viewingPosition.position.z = helperWorldPos.z + 30;// += (this.gltfScene.position.z - center.z);
    this.rotationGroup.add(this.viewingPosition)
    this.viewingPosition.lookAt(this.helper.position);
    console.log("viewingPosition",this.viewingPosition)

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
      clips: this.clips ? this.clips.length : null,
      key: this.key
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
