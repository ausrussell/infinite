import * as THREE from "three";

class GeneralLight {
  constructor(props) {
    // this.builder = props.builder;
    console.log("GeneralLight component", props);
    this.builder = props.builder;
    let { intensity, color } = props;
    if (!color) color = [1, 1, 1];
    if (!intensity) intensity = 0.6;
    const threeColor = new THREE.Color(...color);
    let options = [threeColor, 0xffffff, intensity];
    // this.light = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 1); //0.02
    this.light = new THREE.HemisphereLight(...options);

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
  removeLight() {
    console.log("General Light removeLight", this);
    if (this.light) this.builder.scene.remove(this.light);
  }
  getExport() {
    const { intensity, color } = this.light;
    return {
      intensity: intensity,
      color: [color.r, color.g, color.b]
    };
  }
}

export default GeneralLight;
