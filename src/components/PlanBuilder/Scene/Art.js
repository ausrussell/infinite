import * as THREE from "three";
import Frame from "./Frame";

const textureLoader = new THREE.TextureLoader();

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
    this.addArtFromData();
  }

  setArt(art) {
    const texture = textureLoader.load(art.file);
    console.log("setArt art",art)
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

  setArtPosition(groupPosition){
    
    const {x,y} = groupPosition;
    const forwardOrBack = (this.side === "back") ? -1: 1
    const z = forwardOrBack * this.wall.geometry.parameters.depth;
    this.position.set(x,y,z);
    if (this.side === "back") this.rotateY(Math.PI);
  }

  addArtFromData() {
    const { groupPosition, art, frame } = JSON.parse(this.data);
    this.setArt(art);
    this.setArtPosition(groupPosition)
    if (frame) {
      new Frame(this, frame);
    }
    this.wall.add(this);
  }
}
