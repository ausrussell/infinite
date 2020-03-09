import * as THREE from "three";

class GeneralLight {
  constructor(props) {
    // this.light = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 1); //0.02
    this.light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);

    // this.light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    // this.light.color.setHSL(0.6, 1, 0.6);
    // this.light.groundColor.setHSL(0.095, 1, 0.75);
    // this.light.position.set(0, 50, 0);
    // this.light = new THREE.AmbientLight(0xffffff);
    // this.light.intensity = 0.5;
  }

  getLight() {
    // this.light.color.setHSL(0.6, 1, 0.6);
    // this.light.groundColor.setHSL(0.095, 1, 0.75);
    // this.light.position.set(0, 50, 0);
    return this.light;
  }
}

export default GeneralLight;
