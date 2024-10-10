import * as THREE from "three";
import { connect } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "three.meshline";
import { withFirebase } from "../Firebase";
import { setDataToNewMaterial } from "../../Helpers/TextureAdder";

// const matisseStudioTexture =
//   "/users/zHXGGNge3bS76tWjQ9wlhacZ8wD2/wall/-N8z1e47VvhpGG5w1i5Y";
const matisseStudioTexture =
  "/users/zHXGGNge3bS76tWjQ9wlhacZ8wD2/wall/-M4Q4OafSh8wxNk3VFe3";
const Lines = ({ scene, lineGeometry, firebase }) => {
  useEffect(() => {
    let mesh;

    const setToNewMaterial = (material) => {
      // material.computeVertexNormals();
      const { getAsset } = firebase;
      const options = {
        refPath: matisseStudioTexture,
        once: true,

        callback: (snap) => {
          console.log("snap.val()", snap.val(), material, texData);
          const texData = snap.val();
          setDataToNewMaterial(texData, material);
        },
      };
      getAsset(options);
      // setDataToNewMaterial(this.data.texture, this.material);
    };

    const addLines = () => {
      const points = lineGeometry;

      //   const points = [];
      //   for (let j = 0; j < Math.PI; j += (2 * Math.PI) / 100) {
      //     points.push(new THREE.Vector3(Math.cos(j), Math.sin(j), 0));
      //   }
      console.log("points", points);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new MeshLine();
      line.setGeometry(geometry);
      const options = {
        lineWidth: 0.1,
      };
      const material = new MeshLineMaterial(options);
      setToNewMaterial(material);
      mesh = new THREE.Mesh(line, material);
      scene.add(mesh);
    };

    if (lineGeometry.length) addLines();
    return () => {
      scene.remove(mesh);
    };
  }, [scene, lineGeometry]);

  //   useEffect(() => {
  //     if (lineGeometry) {

  //         console.log("lineGeometry",lineGeometry)
  //       const geometry = lineGeometry;
  //       const line = new MeshLine();
  //       line.setGeometry(geometry);
  //       const options = {
  //         lineWidth: 0.1,
  //       };
  //       const material = new MeshLineMaterial(options);
  //       const mesh = new THREE.Mesh(line, material);
  //       scene.add(mesh);
  //     }
  //   }, [lineGeometry]);

  return null;
};

const mapStateToProps = (state) => {
  const { scene } = state;
  return { scene };
};
export default connect(mapStateToProps)(withFirebase(Lines));
