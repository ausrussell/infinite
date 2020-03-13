import * as THREE from "three";

const GeneralLightDisplay = options => {
  console.log("GeneralLightDisplay", options);
  const { intensity, color, builder } = options;

  const threeColor = new THREE.Color(...color);

  const hemisphereLight = new THREE.HemisphereLight(
    threeColor,
    0xffffff,
    intensity
  );

  // const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
  const scene = builder.scene;
  scene.add(hemisphereLight);
  console.log("hemisphereLight", hemisphereLight);
  return hemisphereLight;
};

export { GeneralLightDisplay };
