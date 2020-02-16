import * as THREE from "three";
import FrameDisplayObject from "./FrameDisplayObject";

class WallDisplayObject {
  constructor(options) {
    console.log("WallDisplayObject", options);
    // this.builder = options;
    const { col, row, pos, height, sides, builder } = options;
    // const { x, y, pos, builder } = options;
    this.col = col;
    this.row = row;
    this.pos = pos;
    this.sides = sides || {};
    console.log("Wall display", col, row, pos, height, sides);
    this.builder = builder;
    this.scene = this.builder.scene;
    this.midpointX = this.builder.voxelsX / 2;
    this.midpointY = this.builder.voxelsY / 2;

    this.height = height; //1;
    this.opacity = 1;
    // this.sides = { front: {}, back: {} };
    this.wallWidth = 20;
    this.wallHeight = 60;
    this.wallDepth = 5;
    // this.defaultImageWidth = this.wallWidth * 0.6;
    // this.defaultImageHeight = 15;
    this.setXZPos();
    // this.renderWall();
    // this.addLights();
    // this.addFrames();
    this.art = [];
  }
  setXZPos() {
    this.posX =
      (this.col - this.midpointX) * this.wallWidth + this.wallWidth / 2;
    this.posZ = (this.row - this.midpointY) * this.wallWidth;
    console.log("this.posX, this.posZ", this.posX, this.posZ);
  }

  renderWall() {
    const geometry = new THREE.BoxGeometry(
      this.wallWidth,
      this.wallHeight,
      this.wallDepth
    );
    this.wallMaterial = new THREE.MeshStandardMaterial({
      // wireframe: true
      color: 0xe1f5fe,
      opacity: 1,
      transparent: true
    });
    this.wallMesh = new THREE.Mesh(geometry, this.wallMaterial);
    this.wallMesh.name = "wallMesh";
    this.wallGroup = new THREE.Group();
    this.wallGroup.receiveShadow = true;
    // this.group.castShadow = true;
    this.wallGroup.add(this.wallMesh);
    this.wallGroup.name = "wallGroup";
    this.builder.scene.add(this.wallGroup);
    this.builder.scene.updateMatrixWorld(true);
    this.wallGroup.position.set(this.posX, this.height / 2, this.posZ);
    console.log("wall pos", this.posX, this.height / 2, this.posZ);
    this.builder.scene.updateMatrixWorld(true);
    if (this.pos === 0) {
      this.wallGroup.translateX(-(this.wallWidth / 2)); //
      this.wallGroup.translateZ(this.wallWidth / 2);
      this.wallGroup.rotateY(Math.PI / 2);
    }
    console.log('this.sides["front"].length', this.sides);
    if (this.sides["front"]) {
      this.renderSides();
    }
  }

  renderSides() {
    console.log(
      "renderSides",
      this.col,
      this.row,
      this.sides && this.sides["front"]
    );
    Object.keys(this.sides).forEach(side => this.artForSide(side));
  }

  artForSide(side) {
    console.log("side", this.sides[side]);
    this.art[side] = [];
    // console.log("this.sides[side]", this.sides[side]);
    this.sides[side].forEach((item, index) => {
      console.log("artForSide", item, index);
      const options = {
        scene: this.scene, //??
        wall: this,
        data: item,
        side: side
      };
      const frameObj = new FrameDisplayObject(options);
      frameObj.renderFrame();
      this.art[side].push(frameObj);

      // const artMesh = item[0];
      // console.log("artForSide", item);
      // const options = item;
      // options.side = side;
      // options.wall = this;

      // const frameObj = new FrameDisplayObject(options);
      // this.art[side].push(new FrameDisplayObject(options));
      // this.art[side][index]
      // frameObj.renderArt();
    });
  }
}

export default WallDisplayObject;
