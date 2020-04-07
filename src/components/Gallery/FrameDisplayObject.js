import * as THREE from "three";
import TextureAdder from "../../Helpers/TextureAdder"

class Frame {
  constructor({ scene, wall, data, side }) {
    this.scene = scene;
    this.data = JSON.parse(data);
    this.wall = wall;
    this.side = side;
    this.wallDepth = 5;
    this.textureLoader = new THREE.TextureLoader();
    this.group = new THREE.Group();
    this.frameWidth = 1;
  }

  renderArt() {
    console.log("renderArt", this);
    console.log("this.artMesh", this.artMesh);
    debugger;
    this.artMesh.position.set(0, 0, this.wallDepth);
    this.group.add(this.artMesh);
    if (this.side === "back") this.group.rotateY(Math.PI);
    this.wall.wallGroup.add(this.group);
    this.artMesh.translateZ(this.wallDepth);
  }

  setGroup() {
    this.wall.wallGroup.add(this.group);
    this.group.position.set(
      this.data.groupPosition.x,
      this.data.groupPosition.y,
      0
    );
  }
  setArt() {
    const { art } = this.data;
    console.log("art", art);
    const texture = this.textureLoader.load(art.file);
    const artPlane = new THREE.PlaneGeometry(art.width, art.height, 0);
    this.iMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: texture,
      opacity: 1
      // transparent: true
    });
    this.artMesh = new THREE.Mesh(artPlane, this.iMaterial);
    this.artMesh.translateZ(this.wallDepth);
    this.group.add(this.artMesh);
    if (this.side === "back") this.group.rotateY(Math.PI);
  }
  setFrame() {
    const { frame } = this.data;
    console.log("frame", frame);
    this.setFrameMesh();
    const textureAdder = new TextureAdder({ material: this.fmaterial });
    textureAdder.setDataToMaterial(frame);
    this.group.add(this.frameMesh);
  }
  loadHandler = texture => {
    this.fmaterial.color.set("#fff");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.05, 0.05);
    this.fmaterial.map = texture;
    this.fmaterial.needsUpdate = true;
  };

  setFrameMesh(plane) {
    const imageWidth = this.data.art.width;
    const imageHeight = this.data.art.height;

    // const imageWidth = plane.parameters.width * this.artMesh.scale.x;
    // const imageHeight = plane.parameters.height * this.artMesh.scale.y;
    // console.log("imageWidth", imageWidth, this.artMesh.scale.x);
    this.setFrameGeometry(imageWidth, imageHeight);
    this.setDefaultFrameMaterial();
    const mesh = new THREE.Mesh(this.fgeometry, this.fmaterial);
    this.totalWidth = imageWidth; // + 2 * this.frameWidth;
    this.totalHeight = imageHeight; // + 2 * this.frameWidth;
    this.frameMesh = mesh;
    this.frameMesh.name = "frameMesh";
    this.setFramePosition();
    return mesh;
  }
  setFramePosition() {
    const wallMatrix = this.wall.wallMesh.matrixWorld;
    const shiftedLeft = wallMatrix.makeTranslation(
      (-this.artMesh.geometry.parameters.width * this.artMesh.scale.x) / 2, //-(this.totalWidth / 2),
      (-this.artMesh.geometry.parameters.height * this.artMesh.scale.y) / 2,
      0 // this.side === "back" ? -(this.wallDepth * 1.5) : this.wallDepth * 0.5
    );
    this.frameMesh.position.setFromMatrixPosition(shiftedLeft);
  }

  setDefaultFrameMaterial() {
    // const texture1 = this.loader.load("../textures/wood/wood3.png");
    this.fmaterial = new THREE.MeshLambertMaterial({
      color: 0x666666,
      side: THREE.DoubleSide
      // transparent: true,
      // map: texture1
    });
  }
  setFrameGeometry(imageWidth, imageHeight) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, imageHeight);
    shape.lineTo(imageWidth, imageHeight);
    shape.lineTo(imageWidth, 0);
    shape.lineTo(0, 0);

    const hole = new THREE.Shape();
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
  renderFrame() {
    this.setGroup();
    console.log("renderFrame", this.data, this);
    this.setArt();
    this.data.frame && this.setFrame();
  }
}

export default Frame;
