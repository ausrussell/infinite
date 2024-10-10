import * as THREE from "three";
import {  Vector3 } from "three";
import { gsap } from "gsap";

const shardColors = [
  new THREE.Color().setHex(0xd1c4e9),
  new THREE.Color().setHex(0x3f51b5),
  new THREE.Color().setHex(0xce90eb),
  new THREE.Color().setHex(0xd1c4e9),
  new THREE.Color().setHex(0x9575cd),
  new THREE.Color().setHex(0x673ab7),
];
const focusColor = new THREE.Color().setHex(0xff0000); //ccc //ee0409
const floorD = { x: 9, z: 9 };
const shardPosition = new THREE.Vector3();
const dummy = new THREE.Object3D();

const shardCoords = [.5,2.5, .125]
// const shardCoords = [3, 4.75, 0.125];//.125

const rectWidth = 3 / 3;
const rectHeight = 4.75 / 1.5;
const margin = 0.1;
const holeStartHeight = rectHeight * 0.5;
const holeEndHeight = rectHeight * 0.75;

const shardPlane = new THREE.BoxGeometry(...shardCoords);
const shardMaterial = new THREE.MeshStandardMaterial({
  // color: 0xd1c4e9,
  opacity: 0.85,
  transparent: true,
});
const worldFront = new THREE.Vector2(0, 8); //8.65 //14

const frontDuration = 2; //in secs

class Shards {
  constructor({ numberOfShards, animTl, shardsCallback }) {
    console.log("Shards constructor");
    // this.scene = scene;
    this.numberOfShards = numberOfShards;
    this.animTl = animTl;
    this.positions = [];
    this.shardCurves = [];
    this.focussedIndex = null;
    this.shardsMesh = new THREE.InstancedMesh(
      shardPlane,
      shardMaterial,
      numberOfShards
    );
    this.shardsCallback = shardsCallback;
    // this.shardsMesh = this.getShardFocus();
    this.setShards();

    this.shardsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
  }

  getShardFocus() {
    const rectShape = new THREE.Shape()
      .moveTo(0, 0)
      .lineTo(rectWidth, 0)
      .lineTo(rectWidth, rectHeight)
      .lineTo(0, rectHeight)
      .lineTo(0, 0);
    // Hole

    const hole = new THREE.Shape()
      .moveTo(rectWidth * margin, holeStartHeight)
      .lineTo(rectWidth * (1 - margin), holeStartHeight)
      .lineTo(rectWidth * (1 - margin), holeEndHeight)
      .lineTo(rectWidth * margin, holeEndHeight)
      .lineTo(rectWidth * margin, holeStartHeight);
    rectShape.holes.push(hole);

    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 10,
      steps: 10,
      bevelSize: 0.05,
      bevelThickness: 0.03,
    };
    const geometry = new THREE.ExtrudeBufferGeometry(
      rectShape,
      extrudeSettings
    );
    geometry.center();
    const material = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      opacity: 0.85,
      transparent: true,
    });
    // const mesh = new THREE.Mesh(geometry, material);
    return new THREE.InstancedMesh(geometry, material, this.numberOfShards);
  }

  setShards() {
    for (let i = 0; i < this.numberOfShards; i++) {
      //set shards path and colors
      const originalEllipse = this.makeEllipse();
      this.shardCurves[i] = {
        originalEllipse,
      };
let rndColor = shardColors[Math.floor(Math.random() * shardColors.length)]
      this.shardsMesh.setColorAt(
        i,
        rndColor
      );
      this.shardsMesh.instanceColor.needsUpdate = true;
      this.positions[i] = new Vector3();
      this.shardCurves[i].tl = this.makeTl(i);
    }
  }

  // shardMaterial.instanceColor.needsUpdate = true;

  makeTl(i) {
    var tl = gsap.timeline();
    //   const position = this.clock.getDelta();
    const place = { position: 0 };

    tl.fromTo(
      place,
      { position: 0 },
      {
        duration: 10,
        position: 1,
        ease: "none",
        repeat: -1,
        callbackScope: this,
        onUpdateParams: [i, place],
        onCompleteParams: [i],
        onUpdate: this.curveUpdate,
        onComplete: this.tweenComplete,
      }
    );
    return tl;
  }
  tweenComplete(i) {
    console.log("tweenComplete i", i);
    this.shardsCallback();
  }

  reverseTweenComplete(i) {
    this.shardCurves[i].frontalEllipse = null;
    this.shardCurves[i].tl.resume();
  }

  generateHelperPoint({ x, y, z }) {
    var dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(new THREE.Vector3().toArray(), 3)
    );
    var dotMaterial = new THREE.PointsMaterial({ size: 1 });
    var dot = new THREE.Points(dotGeometry, dotMaterial);
    dot.position.set(x, y, z);
    // this.scene.add(dot);
  }
  curveUpdate(i, { position }) {
    let ellipseToFollow =
      this.shardCurves[i].frontalEllipse || this.shardCurves[i].originalEllipse;
    ellipseToFollow.getPoint(position, shardPosition);
    shardPosition.set(shardPosition.x, 2, shardPosition.y);
    this.positions[i].copy(shardPosition); //[shardPosition.x, 80, shardPosition.y];
    dummy.position.copy(this.positions[i]);
    dummy.rotation.y = Math.abs(ellipseToFollow.getTangent(position).x);
    // if (this.shardCurves[i].frontalEllipse) {
    // // this.generateHelperPoint(dummy.position)
    // }
    dummy.updateMatrix();
    this.shardsMesh.setMatrixAt(i, dummy.matrix);
  }

  makeEllipse() {
    let aclockwise = Math.random() > 0.5 ? false : true;
    let rndAngle = Math.random() * 2 * Math.PI;
    let x = floorD.x * 2 * Math.random() - floorD.x;

    return new THREE.EllipseCurve(
      x,
      floorD.z * Math.random() - floorD.z / 2,
      0.25 + Math.random() * 1.25,
      1.25 + Math.random() * 1.25, // xRadius, yRadius
      aclockwise ? rndAngle - 2 * Math.PI : rndAngle,
      aclockwise ? rndAngle : rndAngle - 2 * Math.PI, // aStartAngle, aEndAngle
      Math.random() > 0.5 ? false : true, // aClockwise
      aclockwise,
      0 // aRotation
    );
  }

  makeEllipseToFront({ x, z }) {
    console.log("makeEllipseToFront", x, z);
    const curveAr = [
      new THREE.Vector2(x, z),
      new THREE.Vector2(0, 2.5),
      worldFront,
    ];
    const curve = new THREE.SplineCurve(curveAr);
    return curve;
  }

  update() {
    this.shardsMesh.instanceMatrix.needsUpdate = true;
  }

  initializeToFrontAnim(i, pos) {
    console.log("pos", pos);
    const elipseToFront = this.makeEllipseToFront(pos);
    this.shardCurves[i].frontalEllipse = elipseToFront;
    const frontTl = gsap.timeline();
    const place = { position: 0 };

    frontTl.fromTo(
      place,
      { position: 0 },
      {
        duration: frontDuration,
        position: 1,
        ease: "none",
        // repeat: -1,
        callbackScope: this,
        onUpdateParams: [i, place],
        onCompleteParams: [i],
        onReverseCompleteParams: [i],
        onUpdate: this.curveUpdate,
        onComplete: this.tweenComplete,
        onReverseComplete: this.reverseTweenComplete,
      }
    );
    return frontTl;
  }

  focus(index) {
    console.log(
      "Shards focus",
      index,
      "this.focussedIndex",
      this.focussedIndex
    );
    this.shardsMesh.setColorAt(index, focusColor);
    this.shardsMesh.instanceColor.needsUpdate = true;
    this.shardCurves[index].tl.pause();
    console.log(
      "this.shardCurves[index]?.tlFrontAnim?.progress()",
      this.shardCurves[index]?.tlFrontAnim?.progress()
    );
    if (this.shardCurves[index]?.tlFrontAnim?.progress() > 0) {
      this.shardCurves[index].tlFrontAnim.play(); //(this.shardCurves[index].tlFrontAnim?.progress() * frontDuration
    } else {
      this.shardCurves[index].tlFrontAnim = this.initializeToFrontAnim(
        index,
        this.positions[index]
      );
    }
    this.unfocus();

    this.focussedIndex = index;
  }
  unfocus() {
    console.log("unfocus this.focussedIndex", this.focussedIndex);
    if (this.focussedIndex !== null) {
      console.log(
        "progress",
        this.shardCurves[this.focussedIndex].tlFrontAnim.progress()
      );
      this.shardCurves[this.focussedIndex].tlFrontAnim.reverse();
    }
    this.focussedIndex = null;
  }
}
export default Shards;
