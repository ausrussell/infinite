import * as THREE from "three";
import {
    setDataToNewMaterial,
  } from "../../../Helpers/TextureAdder";
const extrudeSettings = {
  steps: 2,
  depth: 2,
  bevelEnabled: true,
  bevelThickness: 0.5,
  bevelSize: 1,
  bevelOffset: 0,
  bevelSegments: 8,
};

const defaultFrameMaterialOptions = {
  side: THREE.DoubleSide,
  transparent: true,
};

export default class Frame extends THREE.Mesh {
  constructor(art, frame) {
    super();
    this.art = art;
    this.data = frame;
    this.name = "frame";
    this.setFrameMesh();
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
    this.geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
  }

  setFrameMaterial() {
    this.material = new THREE.MeshStandardMaterial(defaultFrameMaterialOptions);
    setDataToNewMaterial(this.data, this.material)

  }
  setFramePosition(imageWidth, imageHeight) {
    const shiftedLeft = this.art.matrixWorld.makeTranslation(
      -imageWidth / 2,
      -imageHeight / 2,
      0
    );
    this.position.setFromMatrixPosition(shiftedLeft);
  }

  setFrameMesh() {
    const imageWidth = this.art.geometry.parameters.width * this.art.scale.x;
    const imageHeight = this.art.geometry.parameters.height * this.art.scale.y;
    this.setFrameGeometry(imageWidth, imageHeight);
    this.setFrameMaterial();
    this.setFramePosition(imageWidth, imageHeight);
    this.art.add(this);
  }
}
