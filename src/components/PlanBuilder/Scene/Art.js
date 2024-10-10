import * as THREE from "three";
import Frame from "./Frame";

const textureLoader = new THREE.TextureLoader();
const hoverOffset = 9;
const hoverHoleOffset = 1.9;

export default class Art extends THREE.Mesh {
  constructor(props) {
    super();
    const { wall, side, data } = props;
    this.data = data;
    this.wall = wall;
    this.side = side;
    this.borrowed = false;
    this.file = null;
    this.name = "art";
    this.frame = null;
    this.addArtFromData();
    this.add(this.createHoverMesh());
  }

  setArt(art) {
    const texture = textureLoader.load(art.file);
    console.log("setArt art", art);
    this.geometry = new THREE.PlaneGeometry(art.width, art.height);
    this.material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: texture,
      opacity: 1,
      transparent: true,
    });
    this.file = art.file;
    this.borrowed = art.borrowed;
  }

  setArtPosition(groupPosition) {
    const { x, y } = groupPosition;
    const forwardOrBack = this.side === "back" ? -1 : 1; //art position should be totally set in data
    const z = forwardOrBack * this.wall.geometry.parameters.depth;
    this.position.set(x, y, z);
    if (this.side === "back") this.rotateY(Math.PI);
  }

  addArtFromData() {
    const { groupPosition, art, frame } = JSON.parse(this.data);
    this.setArt(art);
    this.setArtPosition(groupPosition);
    // if (frame) {
    this.frame = new Frame(this, frame);
    // }
    this.wall.add(this);
  }

  hoverHandler() {
    console.log("hoverHandler");
    this.hoverMaterial.opacity = .8;
  }
  unhoverHandler() {
    console.log("unhoverHandler");
    this.hoverMaterial.opacity = 0;
  }

  getRectangleShape(w, h) {
    const shape = new THREE.Shape()
      .moveTo(-w / 2, -h / 2)
      .lineTo(-w / 2, h / 2)
      .lineTo(w / 2, h / 2)
      .lineTo(w / 2, -h / 2);
    return shape;
  }
  createHoverMesh() {
    console.log("this in art", this);
    const { height, width } = this.geometry.parameters;
    const hoverShape = this.getRectangleShape(
      width + hoverOffset,
      height + hoverOffset
    );
    const hole = this.getRectangleShape(
      width + hoverOffset - hoverHoleOffset,
      height + hoverOffset - hoverHoleOffset
    );
    hoverShape.holes.push(hole);
    const hoverGeometry = new THREE.ShapeBufferGeometry(hoverShape);
    this.hoverMaterial = new THREE.MeshStandardMaterial({
      color: this.borrowed ? "#ff8f00" : 0x4527a0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });

    this.hoverMesh = new THREE.Mesh(hoverGeometry, this.hoverMaterial);

    this.hoverMesh.translateZ(1);
    return this.hoverMesh;
  }
  // this.defaultFrameHoverMaterial();

  // setHoverGeometry() {
  //   const shapeHover = this.getRectangleShape(this.imageWidth + hoverOffset, this.imageHeight + hoverOffset)
  //   const holeClone = this.getRectangleShape(this.imageWidth + hoverOffset - hoverHoleOffset, this.imageHeight + hoverOffset - hoverHoleOffset)
  //   shapeHover.holes.push(holeClone);
  //   this.fHoverGeometry = new THREE.ShapeBufferGeometry(shapeHover);
  // }

  // defaultFrameHoverMaterial = () => new THREE.MeshStandardMaterial({
  //   color: (this.art.borrowed) ? "#ff8f00": 0x4527a0,
  //   side: THREE.DoubleSide,
  //   transparent: true,
  //   opacity: 0
  // })
}
