import * as THREE from "three";

import { connect } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper";

import { Shaders } from "./shaders";
const useShader = "marble"; //null; // "upos";

const Ceiling = ({ scene, walls }) => {
  useEffect(() => {
    let ceilingMesh;

    const addCeiling = () => {
      const { leftWall, rightWall } = walls;
      const floorDimensions = {
        a: new THREE.Vector3(-5.0, 0.0, 8.0),
        b: new THREE.Vector3(-2.0, 0.0, -10.0),
        c: new THREE.Vector3(4.0, 0.0, -3.0),
        d: new THREE.Vector3(5.0, 0.0, 10.0),
      };
      const { a, b, c, d } = floorDimensions;
      // geometry
      const points = [
        leftWall.localToWorld(a.clone().setY(10)),
        leftWall.localToWorld(b.clone().setY(5)),
        rightWall.localToWorld(c.clone().setY(5)),
        rightWall.localToWorld(d.clone().setY(15)),
      ];

      makeHackCube(points);
    };
    console.log("walls for ceiling", walls);

    const makeHackCube = (points) => {
      console.log("makeHackCube");
      // Only trying to make it clear most vertices are unique

      const a = points[0];
      const b = points[1];
      const c = points[2];
      const d = points[3];
      const h = .3;
      const vertices = [
        // front
        { pos: a.toArray(), norm: [0, 0, 1], uv: [0, 1] }, // 0
        { pos: d.toArray(), norm: [0, 0, 1], uv: [1, 1] }, // 1
        { pos: [a.x, a.y + h, a.z], norm: [0, 0, 1], uv: [0, 0] }, // 2
        { pos: [d.x, d.y + h, d.z], norm: [0, 0, 1], uv: [1, 0] }, // 3
        // right
        { pos: d.toArray(), norm: [1, 0, 0], uv: [0, 1] }, // 4
        { pos: c.toArray(), norm: [1, 0, 0], uv: [1, 1] }, // 5
        { pos: [d.x, d.y + h, d.z], norm: [1, 0, 0], uv: [0, 0] }, // 6
        { pos: [c.x, c.y + h, c.z], norm: [1, 0, 0], uv: [1, 0] }, // 7
        // back
        { pos: c.toArray(), norm: [0, 0, -1], uv: [0, 1] }, // 8
        { pos: b.toArray(), norm: [0, 0, -1], uv: [1, 1] }, // 9
        { pos: [c.x, c.y + h, c.z], norm: [0, 0, -1], uv: [0, 0] }, // 10
        { pos: [b.x, b.y + h, b.z], norm: [0, 0, -1], uv: [1, 0] }, // 11
        // left
        { pos: b.toArray(), norm: [-1, 0, 0], uv: [0, 1] }, // 12
        { pos: a.toArray(), norm: [-1, 0, 0], uv: [1, 1] }, // 13
        { pos: [b.x, b.y + h, b.z], norm: [-1, 0, 0], uv: [0, 0] }, // 14
        { pos: [a.x, a.y + h, a.z], norm: [-1, 0, 0], uv: [1, 0] }, // 15
        // top
        { pos: [c.x, c.y + h, c.z], norm: [0, 1, 0], uv: [0, 1] }, // 16
        { pos: [b.x, b.y + h, b.z], norm: [0, 1, 0], uv: [1, 1] }, // 17
        { pos: [d.x, d.y + h, d.z], norm: [0, 1, 0], uv: [0, 0] }, // 18
        { pos: [a.x, a.y + h, a.z], norm: [0, 1, 0], uv: [1, 0] }, // 19
        // bottom
        { pos: d.toArray(), norm: [0, -1, 0], uv: [d.x, d.z] }, // 20
        { pos: a.toArray(), norm: [0, -1, 0], uv: [a.x, a.z] }, // 21
        { pos: c.toArray(), norm: [0, -1, 0], uv: [c.x, c.z] }, // 22
        { pos: b.toArray(), norm: [0, -1, 0], uv: [b.x, b.z] }, // 23
      ];
      const positions = [];
      const normals = [];
      const uvs = [];
      for (const vertex of vertices) {
        positions.push(...vertex.pos);
        normals.push(...vertex.norm);
        uvs.push(...vertex.uv);
      }

      const geometry = new THREE.BufferGeometry();
      const positionNumComponents = 3;
      const normalNumComponents = 3;
      const uvNumComponents = 2;

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array(positions),
          positionNumComponents
        )
      );

      geometry.setAttribute(
        "normal",
        new THREE.BufferAttribute(
          new Float32Array(normals),
          normalNumComponents
        )
      );

      geometry.setAttribute(
        "uv",
        new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents)
      );

      geometry.setIndex([
        0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7, 8, 9, 10, 10, 9, 11, 12, 13, 14, 14,
        13, 15, 16, 17, 18, 18, 17, 19, 20, 21, 22, 22, 21, 23,
      ]);

      //   const hackCube = new THREE.mesh()
      let material;

      if (useShader) {
        const { uniforms, vertexShader, fragmentShader } = Shaders[useShader];
        material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
        });
      } else {
        material = new THREE.MeshBasicMaterial();
      }

      const hackCube = new THREE.Mesh(geometry, material);
      console.log("hack geometry", geometry);
      scene.add(hackCube);
    };
    if (walls) {
      addCeiling();
    }
    return () => {
      scene.remove(ceilingMesh);
    };
  }, [scene, walls]);
  console.log("walls in ceiling root", walls);
  return null;
};

const mapStateToProps = (state) => {
  const { scene } = state;
  return { scene };
};
export default connect(mapStateToProps)(Ceiling);
