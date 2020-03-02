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
    this.setConeHelper();
    // this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
  }
  setWallLight() {
    this.wall.wallMesh.updateMatrix();
    const wallMatrix = this.wall.wallMesh.matrixWorld;
    const shifted = wallMatrix.makeTranslation(
      0,
      this.wall.wallHeight,
      this.side === "back" ? -60 : 60
    );

    // this.builder.scene.add(this.cone);

    this.spotLight.position.setFromMatrixPosition(shifted);
  }
  setConeHelper() {
    var geometry = new THREE.ConeGeometry(5, 20, 32);
    geometry.rotateX(Math.PI / 2);
    geometry.rotateY(Math.PI);
    var material = new THREE.MeshNormalMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.5
    });
    this.coneHelper = new THREE.Mesh(geometry, material);
    // this.coneHelper.visible = false;
    this.coneHelper.name = "LightConeHelper";
    this.coneHelper.controllerClass = this;

    var helperTargetGeometry = new THREE.SphereGeometry(3);

    var helperTargetMaterial = new THREE.MeshNormalMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.5
    });
    this.helperTarget = new THREE.Mesh(
      helperTargetGeometry,
      helperTargetMaterial
    );
    // this.coneHelper.visible = false;
    this.helperTarget.name = "helperTarget";
  }

  updateIntensity(intensity) {
    this.spotLight.intensity = intensity;
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
    console.log("hoverOff");
    this.spotLight.intensity = intensity;
    this.spotLight.color.setHex(0xffffff);
    this.hoverAni && this.hoverAni.end();

    if (this.wall.currentSideOver.hasArt) this.switchOn();
    // this.switchedOn = false;
  }
  switchOn(intensity = 0.8) {
    console.log("switchOn", this.wall.col);
    this.spotLight.intensity = intensity;
    this.spotLight.color.setHex(0xffffff);

    // debugger;
    if (this.wall.builder.addLightToArray) {
      this.wall.builder.addLightToArray(this);
    }
  }
  displayHelper() {
    // this.setConeHelper();
    // this.spotLight.add(this.coneHelper);
    // this.wall.builder.scene.add(this.spotLightHelper);
    this.wall.builder.scene.add(this.helperTarget);

    this.wall.builder.scene.add(this.coneHelper);
    console.log(
      "this.spotLight.getWorldPosition();",
      this.spotLight.getWorldPosition()
    );

    this.posHolder = new THREE.Vector3();
    this.posHolder = this.spotLight.getWorldPosition();
    this.coneHelper.position.set(
      this.posHolder.x,
      this.posHolder.y,
      this.posHolder.z
    );

    this.posHolder = this.spotLight.target.getWorldPosition();
    this.helperTarget.position.set(
      this.posHolder.x,
      this.posHolder.y,
      this.posHolder.z
    );

    // this.coneHelper.position.set(0, 0, 0);

    this.coneHelper.lookAt(this.spotLight.target.getWorldPosition());

    this.coneHelper.attach(this.spotLight);

    this.coneHelper.attach(this.helperTarget);
    this.spotLight.target = this.helperTarget;

    // this.spotLight.children[0].lookAt(this.spotLight.target.getWorldPosition());
    this.wall.builder.setSceneMeshes();
    // debugger;
    // this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
    // this.wall.builder.scene.add(this.spotLightHelper);
    this.addLightEditListeners();
  }
  addLightEditListeners() {
    window.addEventListener("keydown", this.keydownHandler);
    // window.addEventListener("mousedown", this.mousedownHandler);
  }

  mousedownHandler = () => {
    console.log("light mousedownHandler");
    this.wall.builder.detachTransformControls();
  };

  keydownHandler = e => {
    const keycode = e.keyCode;
    console.log("keydownHandler", keycode);

    switch (e.keyCode) {
      case 88: //x
        this.wall.builder.transformControls.setMode("rotate");
        break;
      case 90: //z
        this.wall.builder.transformControls.setMode("translate");
        break;
      case 13: //enter
        // this.wall.builder.detachTransformControls();
        this.wall.builder.deselectSpotlight();
        break;
    }
  };

  switchOff() {
    console.log("switchOff", this.wall.col);

    this.spotLight.intensity = 0;
  }
}

export default WallLight;
