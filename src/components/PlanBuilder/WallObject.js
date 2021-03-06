// import React, { Component } from "react";
import * as THREE from "three";
import Frame from "./Frame";
import WallLight from "./WallLight";
import Animate from "../../Helpers/animate";
import TextureAdder from "../../Helpers/TextureAdder";

class WallObject {
  constructor(options) {
    // console.log("WallObject", options);
    const { x, y, pos, builder, texture } = options;
    this.texture = texture;
    this.col = x;
    this.row = y;
    this.pos = pos;
    this.builder = builder;
    this.midpointX = this.builder.state.voxelsX / 2;
    this.midpointY = this.builder.state.voxelsY / 2;
    this.height = 60; //1;
    this.wallGroup = new THREE.Group();
    this.wallGroup.setTexture = (data) => this.setDataToMaterial(data);
    this.opacity = 0;
    this.sides = { front: {}, back: {} };
    this.wallWidth = 20;
    this.wallHeight = 60;
    this.wallDepth = 5;
    this.defaultImageWidth = this.wallWidth * 0.6;
    this.defaultImageHeight = 15;
    if (options.preview) {
      //just change location if in Studio
      this.posX = this.posZ = 0;
    } else {
      this.setXZPos();
    }

    this.renderWall();
    this.textureAdder = new TextureAdder({ material: this.wallMaterial });
    texture && this.textureAdder.setDataToMaterial(this.texture);

    if (options.preview) {
      this.wallMesh.translateY(-30);
    } else {
      this.addLights();
      this.addFrames();
    }
    this.setupExport();
  }

  setupExport() {
    this.export = (({ col, row, pos, height, opacity }) => ({
      col,
      row,
      pos,
      height,
    }))(this);
    this.export.texture = this.texture || { color: 0xe1f5fe };
  }

  addArtToExport() {
    this.export.sides = {};
    const artToSave = [];
    const borrowedArtToSave = [];

    Object.entries(this.sides).forEach((value, index) => {
      const side = value[1];
      const framesToSave = [];
      const sideFrames = side.frames;
      sideFrames.forEach((item) => {
        const frameData = item.getExport();
        console.log("frameData", frameData.art);
        framesToSave.push(JSON.stringify(frameData));
        if (frameData.borrowed) {
          borrowedArtToSave.push(frameData.art.key);
        } else {
          artToSave.push(frameData.art.key);
        }
      });
      this.export.sides[value[0]] = framesToSave;
    });

    if (artToSave.length) this.export.artKeys = artToSave;
    if (borrowedArtToSave.length)
      this.export.borrowedArtToSave = borrowedArtToSave;
  }

  getExport = () => {
    this.addArtToExport();
    return this.export;
  };

  initialAnimateBuild(index, done) {
    const animationStartDelay =
      this.builder.initialAnimationTime /
      this.builder.state.wallEntities.length;
    setTimeout(() => {
      this.animateWallBuild(() => done && done(index));
    }, index * animationStartDelay);
  }

  setXZPos() {
    this.posX =
      (this.col - this.midpointX) * this.wallWidth + this.wallWidth / 2;
    this.posZ = (this.row - this.midpointY) * this.wallWidth;
  }

  setWallMaterial() {
    this.wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xe1f5fe,
      opacity: this.opacity,
      transparent: true,
    });
  }

  renderWall() {
    const geometry = new THREE.BoxGeometry(
      this.wallWidth,
      this.wallHeight,
      this.wallDepth
    );
    this.setWallMaterial();
    this.wallMesh = new THREE.Mesh(geometry, this.wallMaterial);

    this.wallMesh.castShadow = true;
    this.wallMesh.name = "wallMesh";
    this.wallGroup.receiveShadow = true;
    // this.group.castShadow = true;
    this.wallGroup.add(this.wallMesh);
    this.wallGroup.name = "wallGroup";
    this.builder.scene.add(this.wallGroup);
    this.builder.scene.updateMatrixWorld(true);
    this.wallGroup.position.set(this.posX, this.height / 2, this.posZ);
    this.builder.scene.updateMatrixWorld(true);
    if (this.pos === 0) {
      this.wallGroup.translateX(-(this.wallWidth / 2)); //
      this.wallGroup.translateZ(this.wallWidth / 2);
      this.wallGroup.rotateY(Math.PI / 2);
    }
  }

  animateWallBuild(done) {
    const wallAni = new Animate({
      duration: 1000,
      timing: "circ",
      draw: (progress) => this.drawing(progress),
      done: done,
    });

    wallAni.animate(performance.now());
    this.opacity =
      this.texture && this.texture.opacity ? this.texture.opacity : 1;
    this.wallMaterial.opacity = this.opacity;
  }
  drawing = (progress) => {
    progress += 0.01;
    this.wallMesh.scale.set(1, progress, 1);

    this.wallGroup.position.set(
      this.wallGroup.position.x,
      (this.height * this.wallMesh.scale.y) / 2, //-
      this.wallGroup.position.z
    );
  };
  getMesh() {
    return this.wallMesh;
  }
  dragEnterHandler(side) {
    this.currentSideOver = this.sides[side];
    this.currentSideOver.wallLight.hoverOn();
    this.wallGroup.add(this.currentSideOver.wallLight.spotLight);
    if (!this.sides[side].hasArt) {
      // this.currentSideOver.defaultFrame.addDefault();
      this.wallGroup.add(this.currentSideOver.defaultFrame.group);
      // this.builder.setSceneMeshes(); //maybe update method in builder
    }
  }

  dragOutHandler(side) {
    this.currentSideOver.wallLight.hoverOff();
    if (!this.sides[side].hasArt) {
      this.wallGroup.remove(this.currentSideOver.wallLight.spotLight); //???
      this.wallGroup.remove(this.currentSideOver.defaultFrame.group);
    }
  }

  setCurrentSideOver(side) {
    this.currentSideOver = this.sides[side];
  }

  addLights() {
    Object.keys(this.sides).forEach((side) => this.lightsForSide(side));
  }
  lightsForSide(side) {
    this.sides[side].wallLight = new WallLight(this, side);
    this.sides[side].wallLight.setWallLight();
  }
  addFrames() {
    Object.keys(this.sides).forEach((side) =>
      this.createDefaultFramesForSide(side)
    );
  }
  createDefaultFramesForSide(side) {
    this.sides[side].defaultFrame = new Frame(this, side);
    let options = {
      imageWidth: this.defaultImageWidth,
      imageHeight: this.defaultImageHeight,
      defaultFrame: true,
      index: 0,
    };
    this.sides[side].defaultFrame.setDefaultFrameGroup(options);
    this.sides[side].frames = []; /// maybe move to constructor
  }

  positionMovedHolder(artMesh, side) {
    this.builder.scene.updateMatrixWorld(true);
    console.log("wallobject positionMovedHolder, artMesh",artMesh.parent.holderClass)
    let index = this.sides[side].frames.push(new Frame(this, side));
    this.sides[side].frames[index - 1].setArtMesh(artMesh);
    this.sides[side].hasArt = true;
    this.currentSideOver = this.sides[side];
  }

  addWallLightToScene(side) {
    this.sides[side].wallLight.addWallLightToScene();
  }

  updateWallLight(side) {
    if (this.sides[side].hasArt) {
      this.wallGroup.add(this.sides[side].wallLight.spotLight);
      this.wallGroup.updateMatrixWorld();
      this.sides[side].wallLight.switchOn();
    } else {
      this.wallGroup.remove(this.sides[side].wallLight.spotLight);
    }
  }

  removeFrame(frame, side) {
    let index = this.sides[side].frames.indexOf(frame);
    this.sides[side].frames.splice(index, 1);
  }
  disposeHierarchy(node, callback) {
    for (var i = node.children.length - 1; i >= 0; i--) {
      var child = node.children[i];
      this.disposeHierarchy(child, this.disposeNode);
      callback(child);
    }
  }

  disposeNode(parentObject) {
    parentObject.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        if (node.geometry) {
          node.geometry.dispose();
        }

        if (node.material) {
          if (
            node.material instanceof THREE.MeshFaceMaterial ||
            node.material instanceof THREE.MultiMaterial
          ) {
            node.material.materials.forEach(function (mtrl, idx) {
              if (mtrl.map) mtrl.map.dispose();
              if (mtrl.lightMap) mtrl.lightMap.dispose();
              if (mtrl.bumpMap) mtrl.bumpMap.dispose();
              if (mtrl.normalMap) mtrl.normalMap.dispose();
              if (mtrl.specularMap) mtrl.specularMap.dispose();
              if (mtrl.envMap) mtrl.envMap.dispose();

              mtrl.dispose(); // disposes any programs associated with the material
            });
          } else {
            if (node.material.map) node.material.map.dispose();
            if (node.material.lightMap) node.material.lightMap.dispose();
            if (node.material.bumpMap) node.material.bumpMap.dispose();
            if (node.material.normalMap) node.material.normalMap.dispose();
            if (node.material.specularMap) node.material.specularMap.dispose();
            if (node.material.envMap) node.material.envMap.dispose();

            node.material.dispose(); // disposes any programs associated with the material
          }
        }
      }
    });
  }
  disposeCallback = (item) => {
    item.remove();
  };
  removeGroup() {
    this.removeAllLights();

    this.disposeHierarchy(this.wallGroup, this.disposeCallback); //does this dispose save memory??

    this.builder.scene.remove(this.wallGroup);
  }

  removeAllLights() {
    ["front", "back"].forEach((side) => {
      this.sides[side].wallLight.removeSpotlight();
    });
  }
  switchLightOffIfNoArt(side) {
    if (this.sides[side].frames.length === 0) {
      this.sides[side].hasArt = false;
    }
    this.updateWallLight(side);
  }

  addArtRapid({itemData} ) {
    const side = this.col > 8 && this.pos === 0 ? "back" : "front";
    this.setCurrentSideOver(side);
    console.log("this.col", this.col, this.row, this.pos);
    console.log("wallside", side);
    this.currentSideOver.hasArt = true;

    let index = this.currentSideOver.frames.push(new Frame(this, side));
    itemData.holder = this.currentSideOver.defaultFrame;
    const addingPromise = new Promise((resolve, reject) => {
      console.log("resolved ");
      this.currentSideOver.frames[index - 1].addArtRapid(itemData, resolve, reject );
    });

    this.wallGroup.remove(this.currentSideOver.defaultFrame.group);
    return addingPromise
  }

  addImageFile({
    file,
    side,
    holderOver,
    uploadTask,
    itemData,
    draggableImageRef,
  }) {
    this.builder.scene.updateMatrixWorld(true);
    this.sides[side].hasArt = true;
    this.sides[side].wallLight.hoverOff();
    let index = this.sides[side].frames.push(new Frame(this, side));
    const options = {
      file: file || itemData,
      uploadTask: uploadTask,
      holder: this.currentSideOver.defaultFrame,
      draggableImageRef: draggableImageRef,
    };

    this.currentSideOver.frames[index - 1].addArt(options);

    this.wallGroup.remove(this.currentSideOver.defaultFrame.group);

    // this.currentSideOver.defaultFrame.addArt(file);
    // this.currentSideOver.defaultFrame.removeDefault();
    this.addWallLightToScene(side);
    return;
    // }
  }

  fadeInArt() {
    Object.entries(this.sides).forEach((sideItem) => {
      const side = sideItem[0];
      this.sides[side].frames.forEach((frame) => frame.fadeFrameIn());
    });
  }

  addSidesFromData = (sides) => {
    console.log("sides", sides);
    Object.entries(sides).forEach((sideItem) => {
      const side = sideItem[0];
      this.sides[side].frames = [];
      sideItem[1].forEach((item) => {
        const newFrame = new Frame(this, side);
        this.sides[side].hasArt = true;
        this.sides[side].frames.push(newFrame);
        newFrame.addFrameFromData(JSON.parse(item));
      });
    });
  };
  removeTexture() {
    this.wallMaterial.dispose();
    this.wallMesh.material = null;
    this.setWallMaterial();
    this.wallMesh.material = this.wallMaterial;
    this.textureAdder = new TextureAdder({ material: this.wallMaterial });
  }
  setDataToMaterial(data) {
    this.textureAdder.setDataToMaterial(data);
  }
  wallTileCallback = (item) => {
    this.export.texture = item;
    delete this.export.texture.ref;
    this.setDataToMaterial(item);
  };
}

export default WallObject;
