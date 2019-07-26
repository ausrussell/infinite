import * as THREE from "three";
import animate from "../../Helpers/animate";

class WallLight {
  constructor(props, side = "front") {
    // this.controls = this.setupControls();
    this.wall = props;
    this.spotLightColor = "#ffffff";
    this.spotLight = new THREE.SpotLight(this.spotLightColor);
    // this.spotLight.castShadow = true;
    this.spotLight.shadow.camera.near = 1;
    this.spotLight.shadow.camera.far = 1000;
    this.spotLight.angle = 0.4;
    this.spotLight.intensity = 0.2;
    this.spotLight.distance = 0;
    this.spotLight.target = this.wall.wallMesh;
    // this.spotLight.castShadow = true;
    // this.spotLight.shadow.camera.fov = this.controls.fov;
    this.spotLight.penumbra = 1;
    this.side = side;
    // this.switchedOn = false;
  }
  setWallLight() {
    this.wall.wallMesh.updateMatrix();
    const wallMatrix = this.wall.wallMesh.matrixWorld;
    const shifted = wallMatrix.makeTranslation(
      0,
      this.wall.wallHeight,
      this.side === "back" ? -60 : 60
    );
    this.spotLight.position.setFromMatrixPosition(shifted);
  }

  getWallLightGroup() {
    return this.spotLight;
  }

  hoverOn(intensity = 0.8) {
    this.spotLight.intensity = intensity;
    this.hoverAni = new animate({
      duration: 1500,
      repeat: true,
      timing: "circ",
      draw: progress => this.hoverEffect(progress),
      bounce: true
    });
    this.hoverAni.animate();
  }
  hoverEffect = progress => {
    this.spotLight.intensity = progress / 2 + 0.5;

    this.spotLight.color.setRGB(
      1,
      (250 + 5 * progress) / 255,
      (224 - 19 * progress) / 255
    );
  };
  hoverOff(intensity = 0) {
    this.spotLight.intensity = intensity;
    this.spotLight.color.setHex(0xffffff);
    this.hoverAni.end();

    if (this.wall.currentSideOver.hasArt) this.switchOn();
    // this.switchedOn = false;
  }
  switchOn(intensity = 0.8) {
    this.spotLight.intensity = intensity;
    this.spotLight.color.setHex(0xffffff);
  }
}

export default WallLight;
