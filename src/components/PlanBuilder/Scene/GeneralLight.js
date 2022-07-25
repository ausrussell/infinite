import * as THREE from "three";
import { connect } from "react-redux";
import { useEffect, useState } from "react";
const light = new THREE.HemisphereLight();


const GeneralLight = ({ generalLight, scene }) => {
  const [sceneSet,setSceneSet] = useState(false);

  // const threeColor = new THREE.Color(1, 1, 1);
  // let options = [threeColor, 0xffffff, 0.6];

  useEffect(() => {
    if (scene && !sceneSet) {
      console.log("scene.scene", scene);
      scene.add(light);
      setSceneSet(true)
    }
    console.log("light scene", scene);
    console.log("scene, light",scene, light)
  }, [scene, sceneSet]);

  useEffect(() => {
    light.intensity = generalLight.intensity;
    light.color.setHSL(...generalLight.color);
  }, [generalLight]);

  return null;
};

const mapStateToProps = ({ sceneData, scene }) => {
  console.log("GeneralLight state ", sceneData);
  const { generalLight } = sceneData;

  return { generalLight, scene };
};

export default connect(mapStateToProps)(GeneralLight);
