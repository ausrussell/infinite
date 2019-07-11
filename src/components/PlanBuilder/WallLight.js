import * as THREE from "three";

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
    this.spotLight.target = this.wall.mesh;
    // this.spotLight.castShadow = true;
    // this.spotLight.shadow.camera.fov = this.controls.fov;
    this.spotLight.penumbra = 1;
    this.side = side;
    this.switchedOn = false;
  }
  setWallLight() {
    this.wall.mesh.updateMatrix();
    const wallMatrix = this.wall.mesh.matrixWorld;
    // const frameBackMatrix = this.mesh.matrixWorld;
    const shifted = wallMatrix.makeTranslation(
      0,
      this.wall.wallHeight,
      this.side === "back" ? -60 : 60
    );
    this.wall.mesh.updateMatrix();

    this.spotLight.position.setFromMatrixPosition(shifted);
    // this.spotLight.updateMatrix();
    //
    // var geometry = new THREE.BoxGeometry(100, 100, 100);
    // var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // var cube = new THREE.Mesh(geometry, material);
    // cube.position.setFromMatrixPosition(shifted);
    // this.wall.builder.scene.add(cube);
    // // this.spotLight.position.setFromMatrixPosition(shifted);
    //
    // //
    // //
    // var light = new THREE.PointLight(0xff0000, 1, 100);
    // this.spotLight.position.set(-50, 50, 50);
    // // light.position.setFromMatrixPosition(shifted);
    // // this.wall.builder.scene.add(light);
    //
    // this.wall.builder.scene.add(this.spotLight);
  }

  getWallLightGroup() {
    return this.spotLight;
  }

  switchOn(intensity = 0.8) {
    this.spotLight.intensity = intensity;
    this.switchedOn = true;
  }
  switchOff(intensity = 0) {
    this.spotLight.intensity = intensity;
    this.switchedOn = false;
  }
}

export default WallLight;
