import * as THREE from "three";

import { connect } from "react-redux";
import { useEffect, useState, useRef } from "react";

import Lines from "./Lines";
import Ceiling from "./Ceiling";
import { addPhysicsObject } from "../../redux/actions";
import { Vector3, Vector2, Color } from "three";
import {Shaders} from "./shaders";

const useShader = "marble"; //null; // "upos";
const wallOptions = {
  leftWall: { hole: { w: 1.5, h: 2, x: 12.5, y: 1.5 } },
};
const HardWalls = ({ scene, addPhysicsObject }) => {
  const floorDimensions = {
    a: new THREE.Vector3(-5.0, 0.0, 8.0),
    b: new THREE.Vector3(-2.0, 0.0, -10.0),
    c: new THREE.Vector3(4.0, 0.0, -3.0),
    d: new THREE.Vector3(5.0, 0.0, 10.0),
  };
  const lineTransform = new Vector3(0, 0.2, 0.2);
  const [walls,setWalls] = useState();
  useEffect(() => {
    const getDefaultMaterial = () => {
      let material;

      if (useShader) {
        const { uniforms, vertexShader, fragmentShader } = Shaders[useShader];
        material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
        });
      } else {
        material = new THREE.MeshLambertMaterial({
          color: 0xf03fcf,
          side: THREE.DoubleSide,
          flatShading: true,
        });
        material.flatShading = true;
      }
      return material;
    };
    const addPhysicsWall = (wall) => {
      const boxMaterial = new THREE.ShadowMaterial({
        receiveShadow: true,
      });
      const boxGeometry = new THREE.BoxGeometry(20, 15, 0.12);
      // boxGeometry.center();
      const cube = new THREE.Mesh(boxGeometry, boxMaterial);

      const v1 = new THREE.Vector3(0, 0, 1).applyQuaternion(wall.quaternion);
      const v2 = new THREE.Vector3(1, 0, 0).applyQuaternion(wall.quaternion);

      cube.quaternion.copy(wall.quaternion);
      cube.position
        .copy(wall.position)
        .sub(v1.multiplyScalar(-0.06))
        .sub(v2.multiplyScalar(-2.5));
      // this.scene.add(this.wallPhysics);
      const object = { [wall.name]: cube };
      addPhysicsObject(object);
    };

    const returnCube = (w, h, d) => {
      const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccffc,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
      });
      const boxGeometry = new THREE.BoxGeometry(w, h, d);

      const cube = new THREE.Mesh(boxGeometry, boxMaterial);
      return cube;
    };

    const wallsWithHoles = (rectWidth, rectHeightl, rectHeightr, holeDim) => {
      console.log(
        "rectWidth, rectHeightl, rectHeightr, holeDim",
        rectWidth,
        rectHeightl,
        rectHeightr,
        holeDim
      );
      const rectShape = new THREE.Shape()
        .moveTo(0, 0)
        .lineTo(rectWidth, 0)
        .lineTo(rectWidth, rectHeightl)
        .lineTo(0, rectHeightr)
        .lineTo(0, 0);
      // Hole
      if (holeDim) {
        const { w, h, x, y } = holeDim;
        const hole = new THREE.Shape()
          .moveTo(x, y)
          .lineTo(x + w, y)
          .lineTo(x + w, y + h)
          .lineTo(x, y + h)
          .lineTo(x, y);
        rectShape.holes.push(hole);
        console.log("hole", hole);
      }
      const extrudeSettings = {
        depth: 0.12,
        bevelEnabled: false,
        bevelSegments: 4,
        steps: 4,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      };
      const geometry = new THREE.ExtrudeBufferGeometry(
        rectShape,
        extrudeSettings
      );

      const material = getDefaultMaterial();

      const wall = new THREE.Mesh(geometry, material);

      if (holeDim) {
        const { w, h, x, y } = holeDim;

        //   const light = this.addWindowLight(w, h);
        //   light.position.set(x + w / 2, y + h / 2, 0.12);
        //   wall.add(light);

        const cube = returnCube(w + 0.1, h + 0.4, 0.1);
        cube.position.set(x + w / 2, y + h / 2, -0.3);
        wall.add(cube);
      }

      return wall;
    };

    const addWalls = () => {
      const { a, b, c, d } = floorDimensions;
      // const a = new THREE.Vector3(...c.a);
      // const b = new THREE.Vector3(...floorDimensions.b);
      // const c = new THREE.Vector3(...floorDimensions.c);
      // const d = new THREE.Vector3(...floorDimensions.d);
      console.log("a,b", a, b);
      const { hole } = wallOptions.leftWall;
      const leftWall = wallsWithHoles(a.distanceTo(b), 10, 5, hole);
      leftWall.position.set(b.x, b.y, b.z);
      const axis = new THREE.Vector3(0, 1, 0);
      const v2 = new THREE.Vector3(0, 3, 18);
      leftWall.setRotationFromAxisAngle(axis, axis.angleTo(v2));
      leftWall.rotateY(Math.PI);
      leftWall.name = "leftWall";

      scene.add(leftWall);
      addPhysicsWall(leftWall);
      const rightWall = wallsWithHoles(c.distanceTo(d), 5, 15);
      rightWall.position.set(d.x, d.y, d.z);
      rightWall.name = "rightWall";
      const v3 = new THREE.Vector3(0, -1, 13);
  
      rightWall.setRotationFromAxisAngle(axis, axis.angleTo(v3));
      scene.add(rightWall);
      setWalls({leftWall,rightWall});
      const backWall = wallsWithHoles(b.distanceTo(c), 5, 5);
      backWall.position.set(c.x, c.y, c.z);
      backWall.name = "backWall";
      const v4 = new THREE.Vector3(0, -6, 7);
  
      backWall.setRotationFromAxisAngle(axis, axis.angleTo(v4));
      scene.add(backWall);


      console.log("leftWall geomtery", leftWall.geometry);
    };

    addWalls();
    return () => {
      // scene.remove(mesh);
    };
  }, []);
  // return null;
  return (
    <Ceiling walls={walls}>
    <Lines
      lineGeometry={[
        floorDimensions.a.clone().add(lineTransform),
        floorDimensions.b.clone().add(lineTransform),
        floorDimensions.c.clone().add(lineTransform),
      ]}
    />
    </Ceiling>
  );
};

const mapStateToProps = (state) => {
  const { scene } = state;
  return { scene };
};
export default connect(mapStateToProps, { addPhysicsObject })(HardWalls);
