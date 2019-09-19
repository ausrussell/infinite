import * as THREE from "three";

import { TransformControls } from "./TransformControls";

class Frame {
  constructor(props, side = "front") {
    // super(props);
    this.wall = props;
    const { wallDepth, wallWidth, wallHeight } = this.wall;

    //defaults for frame
    this.wallDepth = wallDepth;
    this.wallWidth = wallWidth;
    this.wallHeight = wallHeight;
    this.maxFrameWidth = this.wallWidth * 0.8;
    this.maxFrameHeight = wallHeight * 0.8;
    console.log("this.maxFrameWidth", this.maxFrameWidth);

    this.hasArt = this.wall.sides[side].hasArt;
    this.loader = new THREE.TextureLoader();
    this.side = side;
    this.offset = new THREE.Vector3();
    this.group = new THREE.Group();
    this.group.side = this.side;
    this.group.wallPos = this.wall.pos;
    this.group.name = "artHolder";
    this.group.holderClass = this;

    this.frameWidth = 1;
    // console.log("Frame constructor", this.wall, this.wall.col, this.side);
  }

  setDefaultFrameMaterial() {
    const texture1 = this.loader.load("../textures/wood/wood3.png");
    this.fmaterial = new THREE.MeshLambertMaterial({
      color: 0x666666,
      side: THREE.DoubleSide
      // transparent: true,
      // map: texture1
    });
  }

  setDefaultFrameGroup(options) {
    this.group = new THREE.Group();
    const { imageWidth, imageHeight } = options;
    // this.defaultMesh = mesh;
    const defaultPlane = new THREE.PlaneGeometry(imageWidth, imageHeight, 0);

    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
      // color: "#f111ff"
    });
    const defaultArtMesh = new THREE.Mesh(defaultPlane, material);
    this.group.add(defaultArtMesh);
    // console.log("defaultArtMesh.position", defaultArtMesh.position);
    defaultArtMesh.translateZ(this.wallDepth);
    this.artMesh = defaultArtMesh;

    this.setDefaultFrameMaterial();
    this.setFrameMesh(defaultPlane);
    this.group.add(this.frameMesh);
    console.log("default group position", this.group.position);
    if (this.side === "back") this.group.rotateY(Math.PI);
  }

  setFrameMesh(plane) {
    const imageWidth = plane.parameters.width;
    const imageHeight = plane.parameters.height;

    this.setFrameGeometry(imageWidth, imageHeight);
    if (!this.fmaterial) this.setDefaultFrameMaterial();
    const mesh = new THREE.Mesh(this.fgeometry, this.fmaterial);
    this.totalWidth = imageWidth + 2 * this.frameWidth;
    this.totalHeight = imageHeight + 2 * this.frameWidth;
    const wallMatrix = this.wall.wallMesh.matrixWorld;
    const shiftedLeft = wallMatrix.makeTranslation(
      -imageWidth / 2, //-(this.totalWidth / 2),
      -imageHeight / 2,
      0 // this.side === "back" ? -(this.wallDepth * 1.5) : this.wallDepth * 0.5
    );

    mesh.position.setFromMatrixPosition(shiftedLeft);

    mesh.updateMatrix();

    mesh.castShadow = true;

    if (!this.group) {
      // this.group.side = this.side;
      // this.group.wallPos = this.wall.pos;
      // this.group.name = "artHolder";
      // this.group.holderClass = this;
    }
    // if (defaultFrame) {
    // } else {
    //   // console.log("defaultDimensions for new frame");
    //   // console.log("this.holeWidth", this.holeWidth);
    //   // console.log("this.holeHeight", this.holeHeight);
    // this.group.remove(this.frameMesh);
    this.frameMesh = mesh;
    this.frameMesh.name = "frameMesh";
  }

  removeFromWall() {
    this.wall.removeFrame(this, this.side);
  }

  setFrameMeshRescaled({ totalWidth, totalHeight }) {
    this.setFrameGeometry(totalWidth, totalHeight);
    const mesh = new THREE.Mesh(this.fgeometry, this.fmaterial);
    this.group.remove(this.frameMesh);
    this.frameMesh = mesh;
    this.frameMesh.name = "frameMesh";
  }

  getWallData = () => {
    return {
      wallOver: this.wall,
      wallSideOver: this.side
    };
  };
  rescale = () => {
    let options = {
      totalWidth: this.artMesh.geometry.parameters.width * this.artMesh.scale.x,
      totalHeight:
        this.artMesh.geometry.parameters.height * this.artMesh.scale.y
    };
    this.setFrameMeshRescaled(options);
    this.group.add(this.frameMesh);
    const wallMatrix = this.wall.wallMesh.matrixWorld;
    const shiftedLeft = wallMatrix.makeTranslation(
      -(options.totalWidth / 2),
      -(options.totalHeight / 2),
      0
    );
    this.frameMesh.position.setFromMatrixPosition(shiftedLeft);
    this.frameMesh.material.opacity = 1;
  };

  setFrameGeometry(imageWidth, imageHeight) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, imageHeight);
    shape.lineTo(imageWidth, imageHeight);
    shape.lineTo(imageWidth, 0);
    shape.lineTo(0, 0);

    const hole = new THREE.Shape();

    // hole.moveTo(this.frameWidth, this.frameWidth);
    // hole.lineTo(this.frameWidth, imageHeight - this.frameWidth);
    // hole.lineTo(imageWidth - this.frameWidth, imageHeight - this.frameWidth);
    // hole.lineTo(imageWidth - this.frameWidth, this.frameWidth);
    // hole.lineTo(this.frameWidth, this.frameWidth);

    hole.moveTo(0, 0);

    hole.lineTo(0, imageHeight);
    hole.lineTo(imageWidth, imageHeight);
    hole.lineTo(imageWidth, 0);
    hole.lineTo(0, 0);
    shape.holes.push(hole);

    const extrudeSettings = {
      steps: 2,
      depth: this.wallDepth,
      bevelEnabled: true,
      bevelThickness: 0.5,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 8
    };

    this.fgeometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
  }

  removeArtFrame() {
    this.frameMesh.material.transparent = true;
    this.frameMesh.material.opacity = 0;
    console.log(
      "Frame removeArtFrame this.activeArtMesh.parent.holderClass.wall",
      this.artMesh.parent.holderClass.wall
    );
  }
  setArtMesh(artMesh) {
    // console.log(
    //   "artMesh.position",
    //   artMesh.position,
    //   artMesh.parent.position,
    //   artMesh.getWorldPosition()
    // );
    console.log("setArtMesh", this.wall.col);

    this.artMesh = artMesh;
    this.group = artMesh.parent;
    // this.wall = wall;

    this.group.holderClass = this;

    this.frameMesh = this.group.children.find(
      item => item.name === "frameMesh"
    );
    this.fmaterial = this.frameMesh.material; //reset
    let options = {
      imageWidth: artMesh.geometry.parameters.width * artMesh.scale.x,
      totalHeight: artMesh.geometry.parameters.height * artMesh.scale.y
    };
    this.setFrameGeometry(options);
    this.frameMesh.material.opacity = 1;
    const wallMatrix = this.wall.wallMesh.matrixWorld;

    this.offset
      .copy(artMesh.getWorldPosition())
      .sub(this.wall.wallGroup.getWorldPosition());
    const shiftedLeft = wallMatrix.makeTranslation(
      this.offset.x,
      this.offset.y,
      0 //  this.side === "back" ? -(this.wallDepth * 1.5) : this.wallDepth * 0.5
    );
    this.group.position.setFromMatrixPosition(shiftedLeft);
    const frameMatrix = this.frameMesh.matrixWorld;
    const shifted = frameMatrix.makeTranslation(
      0,
      0,
      this.side === "back" ? -this.wallDepth : this.wallDepth
    );
    this.artMesh.position.setFromMatrixPosition(shifted);
    this.artMesh.getWallData = this.getWallData;
    this.artMesh.rescale = this.rescale;
    this.frameMesh.updateMatrix();
    console.log(
      "Frame setArtMesh this.activeArtMesh.parent.holderClass.wall",
      this.artMesh.parent.holderClass.wall
    );

    // this.group.add(this.frameMesh);
  }

  addDefault() {
    this.group.add(this.defaultMesh);
    return;
  }
  removeDefault() {
    this.group.remove(this.defaultMesh);
    debugger;
  }
  showDefaultFrame() {
    this.defaultMesh.material.opacity = 1;
  }
  hideDefaultFrame() {
    this.defaultMesh.material.opacity = 0;
  }

  getFrameGroup() {
    return this.group;
  }
  addArt(file, holder) {
    console.log("addART", file);
    const image = new Image();
    image.src = file;
    const options = {
      file: file,
      image: image,
      holder: holder
    };
    image.onload = image => this.imageLoadedHandler(options);
  }

  fitToFrame(w, h, fitW, fitH) {
    console.log("fitToFrame w,h", w, h);
    let imageDimensions = w / h;
    const returnDimensions = [];
    let checkW = fitW / w;
    if (h * checkW < this.maxFrameHeight) {
      //usae Width
      returnDimensions.push(fitW, fitW / imageDimensions);
    } else {
      returnDimensions.push(fitH * imageDimensions, fitH);
    }
    return returnDimensions;
  }

  imageLoadedHandler(options) {
    const { image, file, holder } = options;
    const loader = new THREE.TextureLoader();
    var texture = loader.load(file);
    let imageWidth = image.width;
    let imageHeight = image.height;
    const fitW = holder.artMesh.geometry.parameters.width;
    const fitH = holder.artMesh.geometry.parameters.height;
    const artDimensions = this.fitToFrame(imageWidth, imageHeight, fitW, fitH);
    const artPlane = new THREE.PlaneGeometry(
      artDimensions[0],
      artDimensions[1],
      0
    );
    if (!this.iMaterial) {
      this.iMaterial = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: texture
      });
    } else {
      this.iMaterial.map = texture;
    }
    if (this.artMesh) this.group.remove(this.artMesh);
    this.artMesh = new THREE.Mesh(artPlane, this.iMaterial);
    const wallMatrix = this.wall.wallMesh.matrixWorld;

    this.artMesh.name = "artMesh";
    this.artMesh.getWallData = this.getWallData;
    this.artMesh.rescale = this.rescale;
    this.artMesh.translateZ(this.wallDepth);

    this.setFrameMesh(artPlane);
    // this.group.side = this.side;
    // this.group.wallPos = this.wall.pos;
    // // this.group.name = "artHolder";
    // this.group.holderClass = this;

    this.group.add(this.frameMesh);
    this.group.add(this.artMesh);
    if (this.side === "back") this.group.rotateY(Math.PI);

    console.log("add art this.group", this.group.position);

    this.wall.wallGroup.add(this.group);
    this.wall.builder.setSceneMeshes(); //maybe update method in builder
  }

  loadHandler = texture => {
    this.fmaterial.color.set("#fff");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.05, 0.05);
    this.fmaterial.map = texture;
    this.fmaterial.needsUpdate = true;
  };

  setFrameColor(item) {
    if (item.color) {
      this.fmaterial.map = null;
      this.fmaterial.needsUpdate = true;
      this.fmaterial.color.set(item.color);
    } else {
      var loader = new THREE.TextureLoader();
      // loader.crossOrigin = "";
      loader.load(item.url, texture => this.loadHandler(texture));
    }
  }
  show() {
    this.mesh.material.opacity = 1;
  }
  hide() {
    this.mesh.material.opacity = 0;
  }
}

export default Frame;
