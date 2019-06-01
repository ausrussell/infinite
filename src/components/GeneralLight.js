import * as THREE from "three";

class GeneralLight {
  constructor(props) {
    this.light = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 1); //0.02
    // this.light = new THREE.AmbientLight(0xffffff);
    // this.light.intensity = 0.5;
  }

  getLight() {
    return this.light;
  }
}

export default GeneralLight;
