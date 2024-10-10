import React, { Component, useEffect } from "react";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper";
import { addAnimationUpdatables, addPhysicsObject } from "../../redux/actions";

import * as THREE from "three";
import { connect } from "react-redux";

const textureLoader = new THREE.TextureLoader();
const frameDepth = 0.07 * 2;
const frameGap = 0.3;
const artOptions = [
  {
    position: [0, 0, 0],
    width: 1.5,
    place: "leftWall",
    wallOffset: frameDepth + frameGap, //0.5,
    positioning: "lean",
    leanDirection: [-1, 0, 0],
    push: true

  },
  {
    position: [0, 0, 0],
    width: 1.15,
    place: "leftWall",
    wallOffset: frameDepth * 2 + frameGap * 3, //20.9,
    positioning: "lean",
    leanDirection: [-1, 0, 0],
    push: true,
  },
  {
    position: [0, 0, 0],
    width: 1.29,
    place: "backWall",
    positioning: "lean",
    wallOffset: frameDepth * 2 + frameGap ,//0.2, // 0.072 + frameGap,//0.2,

    leanDirection: [0, 0, -1],
    push: true

  },
  {
    position: [0, 0, 0],
    width: 0.45,
    place: "backWall",
    positioning: "lean",
    wallOffset: frameDepth *2 + frameGap * 2, //.45,

    leanDirection: [0, 0, -1],
    push: true
  },
  {
    position: [7.45, 3, -0.2],
    width: 1.35,
    place: "backWall",
    positioning: "wall",
  },

  {
    position: [4.8, 2.6, -0.2],
    width: 0.9,
    place: "backWall",
    positioning: "wall",
  },
  {
    position: [3.45, 2, -0.2],
    width: 0.9,
    place: "backWall",
    positioning: "wall",
  },
  {
    position: [1, 2.3, -0.2],
    width: 1.4,
    place: "backWall",
    positioning: "wall",
  },
];

class ArtPiece extends THREE.Mesh {
  constructor({ texture, options, scene, addPhysicsObject }) {
    super();
    this.addPhysicsObject = addPhysicsObject;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    this.options = options;
    this.scene = scene;
    this.name = `artPiece_${options.index}`;
    console.log("this.name", this.name);
    const ratio = texture.image.naturalWidth / texture.image.naturalHeight;
    this.width = options.width;
    this.height = options.width * ratio;
    this.geometry = new THREE.PlaneGeometry(options.width, this.height);
    this.material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: texture,
      opacity: 1,
      transparent: true,
    });
    // this.setPosition();
    console.log("art constructed", this.scene);

    // var light = new THREE.PointLight(0xffffff, 0.1, 100);
    // light.position.z = 1;
    // light.position.y = 3;
    // this.scene.add(light);
    const positionMap = {
      lean: this.setLeanPosition,
      wall: this.setWallPosition,
    };

    if (positionMap[options.positioning]) {
      positionMap[options.positioning]();
    }
    // const helper = new VertexNormalsHelper(place, 2, 0x00ff00, 1);
    // this.scene.add(helper);
  }
  getRectangleShape(w, h) {
    const shape = new THREE.Shape()
      .moveTo(-w / 2, -h / 2)
      .lineTo(-w / 2, h / 2)
      .lineTo(w / 2, h / 2)
      .lineTo(w / 2, -h / 2);
    return shape;
  }

  setFrameGeometry(imageWidth = this.width, imageHeight = this.height) {
    const bevel = 0.08;
    const shape = new THREE.Shape();
    shape.moveTo(-bevel, -bevel);
    shape.lineTo(-bevel, imageHeight + bevel);
    shape.lineTo(imageWidth + bevel, imageHeight + bevel);
    shape.lineTo(imageWidth + bevel, -bevel);
    shape.lineTo(-bevel, -bevel);
    const hole = new THREE.Shape();

    hole.moveTo(0, 0);
    hole.lineTo(0, imageHeight);
    hole.lineTo(imageWidth, imageHeight);
    hole.lineTo(imageWidth, 0);
    hole.lineTo(0, 0);
    shape.holes.push(hole);
    const extrudeSettings = {
      steps: 200,
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelOffset: 0,
      bevelSegments: 8,
    };

    this.fgeometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
    this.fgeometry.center();
    const boxgeometry = new THREE.BoxGeometry(imageWidth, imageHeight, 0.14);
    boxgeometry.center();
    const boxmat = new THREE.MeshPhongMaterial({
      color: 0xb84f3d,
      shininess: 100,
      metalness: 1,
      //   specular: 0xf50505,
      side: THREE.BackSide,
      transparent: true,
      opacity: 1,
      // map: texture1
    });
    const boxMesh = new THREE.Mesh(boxgeometry, boxmat);

    this.fmaterial = new THREE.MeshPhongMaterial({
      color: 0xb84f3d,
      shininess: 20,
      metalness: 1,
      specular: 0x050505,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
      // map: texture1
    });

    this.fframe = new THREE.Mesh(this.fgeometry, this.fmaterial);
    this.fframe.add(boxMesh);

    this.add(this.fframe);
  }

  setLeanPosition = () => {
    const place = this.scene.getObjectByName(this.options.place);
    console.log("setLeanPosition", this.options.place, this.options);

    const r = place.rotation;
    console.log("place r", r);
    this.setFrameGeometry();

    const aabb = new THREE.Box3();
    aabb.setFromObject(this.fframe);

    const heightWithF = aabb.max.y * 2;

    const direction = new THREE.Vector3(...this.options.leanDirection);
    const raycaster = new THREE.Raycaster(new THREE.Vector3(), direction);
    const intersect = raycaster.intersectObject(place);
    console.log("intersect", intersect);
    const artBoxMat = new THREE.ShadowMaterial()
    // MeshStandardMaterial({
    //   color: 0xcccffc,
    //   transparent: true,
    //   opacity: 0.5,
    // });
    const artBoxGeo = new THREE.BoxGeometry(
      aabb.max.x * 2,
      heightWithF,
      aabb.max.z * 2
    );
    console.log("aabb.max.z", aabb.max.z);
    artBoxGeo.center();
    const physicsArtMesh = new THREE.Mesh(artBoxGeo, artBoxMat);
    const positionVec = new THREE.Vector3();
    positionVec
      .subScalar(this.options.wallOffset)
      .multiply(direction)
      .add(intersect[0].point);
    physicsArtMesh.position.copy(positionVec);
    physicsArtMesh.applyQuaternion(place.quaternion);
    physicsArtMesh.translateY(heightWithF / 2);
    physicsArtMesh.name = `physicsArtMesh_${this.options.index}`;
    physicsArtMesh.userData.artOptions = this.options;
    this.physicsArtMesh = physicsArtMesh;
    this.scene.add(this.physicsArtMesh);
    this.physicsArtMesh.add(this);
  };

  setWallPosition = () => {

    const place = this.scene.getObjectByName(this.options.place);

    const aabb = new THREE.Box3();
    aabb.setFromObject(place);
    let x = Math.abs(aabb.max.x - aabb.min.x);
    let z = Math.abs(aabb.max.z - aabb.min.z);
    let l = Math.sqrt(x * x + z * z);
    this.setFrameGeometry();

    this.position.set(...this.options.position);
    place.add(this);
  };
}


const Art = ({ scene, art, index, addPhysicsObject }) => {
  useEffect(() => {
    // const setArt = () => {
    const options = artOptions[index];
    if (options) options.index = index;
    console.log("options", options);
    const loadedHandler = (texture) => {
      const newPiece = new ArtPiece({ texture, options, scene });
      if (options.leanDirection) {
        const obj = {};
        obj[`physicsArtMesh_${index}`] = {
          mesh: newPiece.physicsArtMesh,
          mass: 15,
        };
        addPhysicsObject(obj);
      }
    };

    options && textureLoader.load(art.url, loadedHandler);
  }, [scene, art, index]);
  return null;
};

const mapStateToProps = (state) => {
  const { scene } = state;
  return { scene };
};
export default connect(mapStateToProps, { addPhysicsObject })(Art);
