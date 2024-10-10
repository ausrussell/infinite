import * as THREE from "three";
import { connect } from "react-redux";
import { useEffect, useState, useRef } from "react";

import {
  setDataToNewMaterial,
  disposeNode,
} from "../../Helpers/TextureAdder";
import {Shaders} from "./shaders";

const useShader = "marble"; //null; // "upos";


const Floor = ({ scene, floor, floorplan }) => {
  const [sceneSet, setSceneSet] = useState(false);
  const [floorMesh, setFloorMesh] = useState();
  const anim = useRef(null);
  const floorDimensions = {
    a: new THREE.Vector3(-5.0, 0.0, 8.0),
    b: new THREE.Vector3(-2.0, 0.0, -10.0),
    c: new THREE.Vector3(4.0, 0.0, -3.0),
    d: new THREE.Vector3(5.0, 0.0, 10.0),
  };
  useEffect(() => {
    let newUniforms;
    const reset = () => {
      const old =
        scene?.children.filter((item) => item.name === "mainFloor") || [];
      old.forEach((item) => {
        disposeNode(item);
        scene.remove(item);
      });
      setFloorMesh(null);
      cancelAnimationFrame(anim.current);
    };
    if (scene && Object.keys(floor).length > 0) {
      console.log("useEffect floorplan", floorplan);
      reset();
      const floorDimensions = {
        a: [-5.0, 0.0, 8.0],
        b: [-2.0, 0.0, -10.0],
        c: [4.0, 0.0, -3.0],
        d: [5.0, 0.0, 10.0],
      };

      const rectShape = new THREE.Shape()
        .moveTo(-5.0, 8)
        .lineTo(-2.0, -10)
        .lineTo(4, -3)
        .lineTo(5, 10)
        .lineTo(-5, 8);


  
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


      
      let floorMaterial;
      // const useShader = "matrix"; // Math.random() > 0.5 ? "cheq" : "upos";
      // const useShader =Math.random() > 0.5 ?    "upos" : "cheq"; // Math.random() > 0.5 ? "cheq" : "upos";

      if (useShader) {
        // const shaderKeys = Object.keys(Shaders);
        // const useThisShader = 
        //   shaderKeys[parseInt(Math.random() * Object.keys(Shaders).length)];
        const useThisShader = Shaders[useShader]
        const { uniforms, vertexShader, fragmentShader } =
        useThisShader;
        var clock = new THREE.Clock(1);

        uniforms.iTime = {
          type: "f",
          value: clock.getDelta(),
          hidden: 1,
        };
        console.log("newUniforms", newUniforms);

        floorMaterial = new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
        });
        const animate = () => {
          uniforms.iTime.value = clock.getElapsedTime();
          anim.current = requestAnimationFrame(animate);
          // console.log("animating ",newUniforms.iGlobalTime.value)
        };
        animate();
      } else {
        floorMaterial = new THREE.MeshStandardMaterial();
      }
      console.log("floorMaterial", floorMaterial);
      console.log("floorgeometry", geometry);

      const mesh = new THREE.Mesh(geometry, floorMaterial);
      mesh.rotateX(Math.PI / 2);
      mesh.name = "mainFloor";
      setFloorMesh(mesh);
      setSceneSet(true);
      scene.add(mesh);
    }
    console.log("floorMesh scene", scene);
    return () => reset();
  }, [scene, floorplan, sceneSet]);

  // useEffect(() => {
  //   console.log("floor effect", floor, "floorMesh", floorMesh);
  //   floorMesh?.material.dispose();

  //   if (floorMesh) {
  //     floorMesh.material = null;
  //     floorMesh.material = new THREE.MeshStandardMaterial();
  //     setDataToNewMaterial(floor, floorMesh.material);
  //   }
  // }, [floor, floorMesh]);
  console.log("floor render", floor);

  return null;
};

const mapStateToProps = ({ sceneData, scene }) => {
  const { floor, floorplan } = sceneData;
  return { floor, floorplan, scene };
};

export default connect(mapStateToProps)(Floor);
