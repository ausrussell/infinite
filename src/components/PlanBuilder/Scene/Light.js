import * as THREE from "three";

export default class Light extends THREE.SpotLight {
  constructor(scene, light) {
    super();
    this.scene = scene;
    this.data = light;
    this.name = "light";
    this.shadow.camera.near = 1;
    this.shadow.camera.far = 500;
    this.angle = 0.4;
    this.distance = 0;
    this.penumbra = 1;

    this.setDataToLight();
    this.scene.add(this);
  }

  setDataToLight() {
    const { intensity, position, color, target } = this.data;
    console.log(
      "intensity, position, color, target",
      intensity,
      position,
      color,
      target
    );
    this.intensity = intensity;
    this.setTarget(target);
    this.position.set(...position);
  }

  setTarget(target) {
    this.target.position.set(...target);
    this.scene.add(this.target);
  }
}
