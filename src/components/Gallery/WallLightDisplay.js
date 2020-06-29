import * as THREE from "three";

const WallLightDisplay = options => {
  // console.log("WallLightDisplay", options);
  const { intensity, position, color, target, builder } = options;
  const threeColor = new THREE.Color(...color);
  const spotLight = new THREE.SpotLight(threeColor);
  const targetObject = new THREE.Object3D();
  const scene = builder.scene;

  scene.add(targetObject);
  targetObject.position.set(...target);
  spotLight.position.set(...position);
  spotLight.target = targetObject;
  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 500;
  spotLight.angle = 0.4;
  spotLight.intensity = intensity;
  spotLight.penumbra = 1;

  scene.add(spotLight);
  // console.log("target", ...target);
  return spotLight;
};

export { WallLightDisplay };
