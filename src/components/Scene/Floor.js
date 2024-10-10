import * as THREE from "three";
import { connect } from "react-redux";
import { useEffect, useState, useRef } from "react";

import {
  setDataToNewMaterial,
  disposeNode,
} from "../../../Helpers/TextureAdder";
import {Shaders} from "./shaders";

const shades = {
  cheq: {
    uniforms: {
      color1: {
        type: "c",
        value: new THREE.Color(0xffffff),
      },
      color2: {
        type: "c",
        value: new THREE.Color(0x000000),
      },
      scale: {
        type: "f",
        value: 10,
        min: 1, // only used for dat.gui, not needed for production
        max: 100, // only used for dat.gui, not needed for production
      },
    },
    vertexShader: `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`,
    fragmentShader: `uniform vec3 color1;
uniform vec3 color2;
uniform float scale;
varying vec2 vUv;
void main() {
  vec2 center = -1.0 + 2.0 * vUv;
  vec2 uv = floor(center.xy * scale);
  if(mod(uv.x + uv.y, 2.0) > 0.5){
    gl_FragColor = vec4(color1, 1.0);
  }else{
    gl_FragColor = vec4(color2, 1.0);
  }
}`,
  },
  upos: {
    uniforms: {},
    vertexShader: `varying vec3 col;

    void main() {
      col = vec3(uv, 1.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
      `,
    fragmentShader: `
    varying vec3 col;
    void main(void)
    {
      gl_FragColor = vec4(col, 1.0);
    }`,
  },
  matrix: {
    uniforms: {
      colour: { type: "c", value: new THREE.Color(0x89ff89) },
      rows: { type: "f", value: 15 },
      glow: { type: "f", value: 1.0 },
      glowRadius: { type: "f", value: 1.0 },
      charDetail: { type: "f", value: 3.0 },
      speed: { type: "f", value: 10.0 },
      // iGlobalTime: { type: "f", value: clock.getDelta(), hidden: 1}
    },
    vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
} `,
    fragmentShader: `
   
// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com
// https://www.shadertoy.com/view/MlfXzN
// Modified by 2Pha

uniform vec3 colour;
uniform float rows;
uniform float glow;
uniform float glowRadius;
uniform float charDetail;
uniform float speed;
uniform float iTime;
varying vec2 vUv;

float random(in float x){
    return fract(sin(x)*43758.5453);
}

float random(in vec2 st){
    return fract(sin(dot(st.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float randomChar(in vec2 outer,in vec2 inner){
    float grid = charDetail;
    vec2 margin = vec2(.2,.05);
    float seed = 23.;
    vec2 borders = step(margin,inner)*step(margin,1.-inner);
    return step(.5,random(outer*seed+floor(inner*grid))) * borders.x * borders.y;
}

vec3 matrix(in vec2 st){
    vec2 ipos = floor(st*rows)+vec2(1.,0.);

    ipos += vec2(.0,floor(iTime*speed*random(ipos.x)));

    vec2 fpos = fract(st*rows);
    vec2 center = (.5-fpos);

    float pct = random(ipos);
    float glowamount = (glowRadius-dot(center,center)*3.)*glow;

    return vec3(randomChar(ipos,fpos) * pct * glowamount) * colour;
}

void main() {
    gl_FragColor = vec4(matrix(vUv),1.0);
}
  `,
  },
};
// const useShader = "cheq"; //null; // "upos";

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
      const { data } = floorplan;
      const width = data.length * floorplan.defaults.wallWidth;
      const depth = data[0].length * floorplan.defaults.wallWidth;
      // const floorPlane = new THREE.PlaneBufferGeometry(width, depth);

      const floorPlane = new THREE.BufferGeometry(Object.values(floorDimensions));


      
      let floorMaterial;
      const useShader = "matrix"; // Math.random() > 0.5 ? "cheq" : "upos";
      // const useShader =Math.random() > 0.5 ?    "upos" : "cheq"; // Math.random() > 0.5 ? "cheq" : "upos";

      if (useShader) {
        const shaderKeys = Object.keys(Shaders);
        const useThisShader = 
          shaderKeys[parseInt(Math.random() * Object.keys(Shaders).length)];

        const { uniforms, vertexShader, fragmentShader } =
          shades[useThisShader];
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
      const mesh = new THREE.Mesh(floorPlane, floorMaterial);
      mesh.rotateX(-Math.PI / 2);
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
