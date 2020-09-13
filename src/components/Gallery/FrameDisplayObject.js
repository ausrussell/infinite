import * as THREE from "three";
import TextureAdder from "../../Helpers/TextureAdder";
import Animate from "../../Helpers/animate";


const hoverOffset = 9;
const hoverHoleOffset = 1.9;
const bevelSize = .7;
const bevelThickness = 1;
const bevelDepth = 6;

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
    const texture = this.textureLoader.load(art.file);
    const artPlane = new THREE.PlaneGeometry(art.width, art.height, 0);
    this.iMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: texture,
      opacity: 1
      // transparent: true
    });
    this.artMesh = new THREE.Mesh(artPlane, this.iMaterial);
    this.artMesh.name = "artMesh"
    this.artMesh.translateZ(this.wallDepth);
    this.group.add(this.artMesh);
    if (this.side === "back") this.group.rotateY(Math.PI);
    this.artMesh.frameDisplayObject = this;

    this.viewingPosition = new THREE.Points();
    this.viewingPosition.position.set(this.artMesh.position.x, this.artMesh.position.y, this.artMesh.position.z);
    this.viewingPosition.translateZ(30);
    this.group.add(this.viewingPosition);
    this.ratio = art.width / art.height
  }
  setFrame() {
    const { frame } = this.data;
    this.setFrameMesh();
    if (frame.opacity && frame.opacity !== 1) this.fmaterial.transparent = true;
    const textureAdder = new TextureAdder({ material: this.fmaterial });
    textureAdder.setDataToMaterial(frame);
    this.group.add(this.frameMesh, this.frameHoverMesh);//this.frameMesh,
  }
  loadHandler = texture => {
    this.fmaterial.color.set("#fff");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.05, 0.05);
    this.fmaterial.map = texture;
    this.fmaterial.needsUpdate = true;
  };

  setFrameMesh(plane) {
    this.imageWidth = this.data.art.width;
    this.imageHeight = this.data.art.height;
    this.setFrameGeometry();
    this.setDefaultFrameMaterial();
    this.setDefaultFrameHoverMaterial();
    this.frameMesh = new THREE.Mesh(this.fgeometry, this.fmaterial);
    this.frameHoverMesh = new THREE.Mesh(this.fHoverGeometry, this.fHoverMaterial);
    this.frameHoverMesh.name = "frameHoverMesh";
    this.frameHoverMesh.renderOrder = 1;
    this.frameMesh.name = "frameMesh";
    this.setFrameHoverPosition();
  }

  setFrameHoverPosition() {
    this.frameHoverMesh.translateZ(5)
  }

  setDefaultFrameMaterial() {
    // const texture1 = this.loader.load("../textures/wood/wood3.png");
    this.fmaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      side: THREE.DoubleSide
      // transparent: true,
      // map: texture1
    });
  }

  setDefaultFrameHoverMaterial() {
    this.fHoverMaterial = new THREE.MeshStandardMaterial({
      color: 0x4527a0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
  }

  setFrameGeometry() {
    const frameOffset = (this.imageWidth > 12) ? 1.1 : .8;
    var extrudeSettings = { depth: bevelDepth, bevelEnabled: true, bevelSegments: 6, steps: 6, bevelSize: bevelSize, bevelThickness: bevelThickness };
    var frame = this.getRectangleShape(frameOffset + bevelSize + this.imageWidth, frameOffset + bevelSize + this.imageHeight)
    var hole = new THREE.Path();
    hole.moveTo(- (this.imageWidth / 2 + bevelSize), -(this.imageHeight / 2 + bevelSize));
    hole.lineTo(this.imageWidth / 2 + bevelSize, -(this.imageHeight / 2 + bevelSize));
    hole.lineTo(this.imageWidth / 2 + bevelSize, this.imageHeight / 2 + bevelSize);
    hole.lineTo(- (this.imageWidth / 2 + bevelSize), this.imageHeight / 2 + bevelSize);
    frame.holes.push(hole);
    this.fgeometry = new THREE.ExtrudeBufferGeometry(frame, extrudeSettings);
    this.setHoverGeometry();

  }

  getRectangleShape(w, h) {
    const shape = new THREE.Shape()
      .moveTo(-w / 2, -h / 2)
      .lineTo(-w / 2, h / 2)
      .lineTo(w / 2, h / 2)
      .lineTo(w / 2, -h / 2)
    return shape;

  }

  getRectanglePath(w, h) {
    const path = new THREE.Path()
      .moveTo(-w / 2, -h / 2)
      .lineTo(-w / 2, h / 2)
      .lineTo(w / 2, h / 2)
      .lineTo(w / 2, -h / 2)
    return path;

  }

  setHoverGeometry() {
    const shapeHover = this.getRectangleShape(this.imageWidth + hoverOffset, this.imageHeight + hoverOffset)
    const holeClone = this.getRectangleShape(this.imageWidth + hoverOffset - hoverHoleOffset, this.imageHeight + hoverOffset - hoverHoleOffset)
    shapeHover.holes.push(holeClone);
    this.fHoverGeometry = new THREE.ShapeBufferGeometry(shapeHover);
  }

  renderFrame() {
    this.setGroup();
    // console.log("renderFrame", this.data, this);
    this.setArt();
    this.data.frame && this.setFrame();
    // console.log("this.viewingPosition, artmesh", this.viewingPosition, this.artMesh.getWorldPosition())
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

  artLeaveHandler = () => {
    this.artHoverAni && this.artHoverAni.end();//no hover on mobile
    this.fHoverMaterial.opacity = 0;
  }

  artHoverLoop = progress => {
    this.fHoverMaterial.opacity = .25 + (progress * .5);
  }

  destroyViewingPosition(){
    this.viewingPosition.geometry.dispose();
    this.viewingPosition.material.dispose();
    this.viewingPosition.remove();
  }
}

export default Frame;
