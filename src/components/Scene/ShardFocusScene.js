import React, { Component, useEffect, useRef } from "react";
import { withFirebase } from "../Firebase";
import { compose } from "recompose";
import { connect } from "react-redux";
import { createSceneData, resetSceneData } from "../../redux/actions";

import * as THREE from "three";
import { Vector2, Vector3 } from "three";
import { gsap } from "gsap";

import Walls from "../PlanBuilder/Scene/Walls";
import Lights from "../PlanBuilder/Scene/Lights";

import GeneralLight from "../PlanBuilder/Scene/GeneralLight";
import Sculptures from "../PlanBuilder/Scene/Sculptures";
import Floor from "../PlanBuilder/Scene/Floor";
import { emptyScene } from "../../Helpers/sceneHelpers";

const shardPos = [0, 50, 420];
const worldFront = new THREE.Vector3(0, 100, 360);
// let cameraLookAt = new THREE.Vector3(0, 1.79, -5); //0, 50, -200

let cameraLookAt = new THREE.Vector3(0, 45, -5); //0, 50, -200

const cameraStartPos = [0, 1.79, 0];
const loader = new THREE.TextureLoader();

const ShardFocusScene = ({
  focusGallery,
  firebase,
  onInsetGalleryLoaded,
  scene,
  createSceneData,
  resetSceneData,
}) => {
  const camera = useRef();

  useEffect(() => {
    const setupScene = () => {
      const boxMaterial = new THREE.MeshPhongMaterial({
        color: 0xdcffdc,
        transparent: true,
        opacity: 0.75,
        // wireframe: true,
        side: THREE.DoubleSide,
        // clippingPlanes: [ leftPlane]//localPlane
      });
      const boxGeometry = new THREE.BoxGeometry(1, 2, 1);

      const cube = new THREE.Mesh(boxGeometry, boxMaterial);
      // this.cube.position.set(...shardPos);
      cube.position.setY(0.02);
      cube.position.setZ(-5);
      // mesh.add(this.cube);
      scene.add(cube);
      const horizGeo = new THREE.PlaneGeometry(4.75, 20);
      const ground = new THREE.Mesh(
        horizGeo,
        new THREE.MeshPhongMaterial({
          color: 0xa0adaf,
          shininess: 150,
          transparent: true,
          opacity: 0.75,
          // wireframe: true
        })
      );

      ground.rotation.x = -Math.PI / 2; // rotates X/Y to X/Z
      ground.receiveShadow = true;
      // ground.position.setZ(-200);

      scene.add(ground);

      //ceiling
      const ceiling = new THREE.Mesh(
        horizGeo.clone(),
        new THREE.MeshPhongMaterial({
          color: 0xfffcfe,
          // shininess: 150,
          // side: THREE.DoubleSide,
          // wireframe: true
        })
      );

      ceiling.rotation.x = Math.PI / 2; // rotates X/Y to X/Z
      ceiling.receiveShadow = true;
      ceiling.position.setY(3);

      scene.add(ceiling);

      //back wall
      const backWallWidth = 4.75;
      const backWallHeight = 3;
      let rectWidth = 4.75;
      let rectHeight = 3;

      let rectShape = new THREE.Shape()
        .moveTo(0, 0)
        .lineTo(rectWidth, 0)
        .lineTo(rectWidth, rectHeight)
        .lineTo(0, rectHeight)
        .lineTo(0, 0);
      // Hole
      const holeWidth = 1;
      const holeHeight = 1;
      const holeStartX = 1.2;
      const holeStartY = 1.2;
      const hole = new THREE.Shape()
        .moveTo(holeStartX, holeStartY)
        .lineTo(holeStartX + holeWidth, holeStartY)
        .lineTo(holeStartX + holeWidth, holeStartY + holeHeight)
        .lineTo(holeStartX, holeStartY + holeHeight)
        .lineTo(holeStartX, holeStartY);
      rectShape.holes.push(hole);

      const extrudeSettings = {
        depth: 0.2,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 4,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      };
      let geometry = new THREE.ExtrudeBufferGeometry(
        rectShape,
        extrudeSettings
      );
      geometry.center();
      let material = new THREE.MeshPhongMaterial({
        color: 0xf03fcf,
        shininess: 100,
      });
      const backWall = new THREE.Mesh(geometry, material);

      backWall.position.setY(1.5);
      backWall.position.setZ(-10);

      scene.add(backWall);
      //side walls

      const leftWall = wallsWithHoles(20, 3);
      leftWall.rotateY(-Math.PI / 2);
      leftWall.position.setX(-backWallWidth / 2);
      leftWall.position.setY(backWallHeight / 2);
      scene.add(leftWall);

      const rightWall = wallsWithHoles(20, 3);
      rightWall.rotateY(-Math.PI / 2);
      rightWall.position.setX(backWallWidth / 2);
      rightWall.position.setY(backWallHeight / 2);
      scene.add(rightWall);
    };

    const wallsWithHoles = (rectWidth, rectHeight) => {
      const rectShape = new THREE.Shape()
        .moveTo(0, 0)
        .lineTo(rectWidth, 0)
        .lineTo(rectWidth, rectHeight)
        .lineTo(0, rectHeight)
        .lineTo(0, 0);
      // Hole
      const holeWidth = 1;
      const holeHeight = 1;
      const holeStartX = 1.2;
      const holeStartY = 1.2;
      const hole = new THREE.Shape()
        .moveTo(holeStartX, holeStartY)
        .lineTo(holeStartX + holeWidth, holeStartY)
        .lineTo(holeStartX + holeWidth, holeStartY + holeHeight)
        .lineTo(holeStartX, holeStartY + holeHeight)
        .lineTo(holeStartX, holeStartY);
      rectShape.holes.push(hole);

      const extrudeSettings = {
        depth: 0.02,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 4,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      };
      const geometry = new THREE.ExtrudeBufferGeometry(
        rectShape,
        extrudeSettings
      );
      geometry.center();
      const material = new THREE.MeshPhongMaterial({
        color: 0xf03fcf,
        shininess: 100,
      });
      return new THREE.Mesh(geometry, material);
    };
    const makeScene = () => {
      // scene.background = new THREE.Color(0xfeee4f);
      // scene.current = new THREE.Scene();
      // scene.background = null;

      camera.current = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      // camera.position.z = 2;
      camera.current.position.set(...cameraStartPos);
      camera.current.lookAt(cameraLookAt);

      {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        onInsetGalleryLoaded({
          focus: focusGallery,
          camera: camera.current,
          scene,
        });
      }

      setupScene();

      // return { scene, camera };
    };
    console.log("makeScene in shard focus");
    // makeScene();

    //new technique
    const returnData = (snapshot) => {
      const galleryData = snapshot.val();
      createSceneData(galleryData);

      camera.current = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        5000
      );
      camera.current.position.set(0, 45, 200); //260
      camera.current.lookAt(cameraLookAt);
      onInsetGalleryLoaded({
        focus: focusGallery,
        camera: camera.current,
        scene,
      });
    };

    if (focusGallery.index !== null) {
      const options = {
        refPath: focusGallery.item.dataPath,
        callback: returnData,
        once: true,
      };
      firebase.getAsset(options);
    } else {
      resetSceneData();
    }
  }, [focusGallery]);

  return (
    <>
      <Walls />
      <Sculptures />
      <GeneralLight />
      <Floor /> 
      <Lights />
    </>
  );
};

const mapStateToProps = (state) => {
  console.log("ShardFocusScene state ", state);
  console.log("state.sceneData", state.sceneData);
  return state; //{scene: state.scene};
};

export default compose(
  connect(mapStateToProps, { createSceneData, resetSceneData }),
  withFirebase
)(ShardFocusScene);
//, {createScene}
