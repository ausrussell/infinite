import * as THREE from "three";
import animate from "../../Helpers/animate";

class WallLight {
  constructor(props, side = "front") {
    // this.controls = this.setupControls();
    const targetObject = new THREE.Object3D();

    if (props.color) {
      const { intensity, position, color, target, builder } = props;
      this.builder = builder;
      this.scene = this.builder.scene;

      const threeColor = new THREE.Color(...color);
      this.spotLight = new THREE.SpotLight(threeColor);

      this.spotLight.position.set(...position);
      console.log("settingh this.spotLight", this.spotLight);

      this.spotLight.shadow.camera.near = 1;
      this.spotLight.shadow.camera.far = 500;
      this.spotLight.angle = 0.4;
      this.spotLight.intensity = intensity;
      this.spotLight.penumbra = 1;
      this.setTarget(target);
      this.builder.scene.add(this.spotLight);
    } else {
      this.wall = props;
      this.builder = this.wall.builder;
      this.spotLightColor = "#ffffff";
      this.spotLight = new THREE.SpotLight(this.spotLightColor);
      // this.spotLight.castShadow = true;
      this.spotLight.shadow.camera.near = 1;
      this.spotLight.shadow.camera.far = 500;
      this.spotLight.angle = 0.4;
      this.spotLight.intensity = 0.2;
      this.spotLight.distance = 0;
      // targetObject.position.set(...target);

      const wallPos = this.wall.wallMesh.getWorldPosition();
      this.spotLight.target = this.wall.wallMesh;
      // this.spotLight.castShadow = true;
      // this.spotLight.shadow.camera.fov = this.controls.fov;
      this.spotLight.penumbra = 1;
      this.side = side;
    }

    // this.switchedOn = false;
    this.posHolder = new THREE.Vector3();

    this.setConeHelper();
    // this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
  }

  componentWillUnmount() {
    this.removeListeners();
  }
  removeListeners() {
    window.removeEventListener("keydown", this.keydownHandler);
  }

  getExport = () => {
    const { intensity, color } = this.spotLight;
    const { x, y, z } = this.spotLight.getWorldPosition();
    const target = this.spotLight.target.getWorldPosition();
    return {
      intensity: intensity,
      position: [x, y, z],
      color: [color.r, color.g, color.b],
      target: [target.x, target.y, target.z]
    };
  };
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

  setTarget(targetPositionArray) {
    var helperTargetGeometry = new THREE.SphereGeometry(3);

    var helperTargetMaterial = new THREE.MeshNormalMaterial({
      color: 0xcfccee,
      transparent: true,
      opacity: 0.5
    });
    this.helperTarget = new THREE.Mesh(
      helperTargetGeometry,
      helperTargetMaterial
    );
    // this.coneHelper.visileble = false;
    this.helperTarget.name = "helperTarget";
    this.posHolder = this.spotLight.target.getWorldPosition();
    console.log("target posHolder", this.posHolder);
    this.helperTarget.position.set(...targetPositionArray);

    this.scene.add(this.helperTarget);
    // this.helperTarget.position.set(...targetPositionArray);
    this.spotLight.target = this.helperTarget;
  }
  setConeHelper() {
    var geometry = new THREE.ConeGeometry(5, 20, 32);
    geometry.rotateX(Math.PI / 2);
    geometry.rotateY(Math.PI);
    this.coneMaterial = new THREE.MeshBasicMaterial({
      color: 0xcfccee,
      transparent: true,
      opacity: 0.5
    });
    this.coneHelper = new THREE.Mesh(geometry, this.coneMaterial);
    // this.coneHelper.visible = false;
    this.coneHelper.name = "LightConeHelper";
    this.coneHelper.controllerClass = this;
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

    if (this.builder.addLightToArray) {
      this.builder.addLightToArray(this);
    }
  }
  displayHelper() {
    // this.builder.scene.add(this.helperTarget);

    this.builder.scene.add(this.coneHelper);

    this.posHolder = this.spotLight.getWorldPosition();
    this.coneHelper.position.set(
      this.posHolder.x,
      this.posHolder.y,
      this.posHolder.z
    );
    this.coneHelper.lookAt(this.spotLight.target.getWorldPosition());
    this.coneHelper.attach(this.spotLight);
    this.coneHelper.attach(this.helperTarget);

    this.spotLight.target = this.helperTarget;
    this.builder.setSceneMeshes();
    // this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
    this.addLightEditListeners();
  }

  undisplayHelper() {
    // debugger;
    this.builder.scene.attach(this.spotLight);
    this.builder.scene.attach(this.helperTarget);
    this.builder.scene.remove(this.coneHelper);

    console.log("undisplayHelper this.spotLight", this.spotLight);
  }

  selectHandler() {
    this.coneMaterial.color.set(0x9999ff);
    this.coneMaterial.opacity = 0.75;
  }
  addLightEditListeners() {
    window.addEventListener("keydown", this.keydownHandler.bind(this));
    // window.addEventListener("mousedown", this.mousedownHandler);
  }

  // mousedownHandler = () => {
  //   console.log("light mousedownHandler");
  //   this.wall.builder.detachTransformControls();
  // };

  keydownHandler = e => {
    const keycode = e.keyCode;
    console.log("keydownHandler", keycode);

    switch (e.keyCode) {
      case 88: //x
        this.setTransformMode("rotate");
        break;
      case 90: //z
        this.setTransformMode("translate");
        break;
      case 13: //enter
        // this.wall.builder.detachTransformControls();
        this.deselectSpotlight();
        break;
      default:
        break;
    }
  };

  setTransformMode(mode) {
    this.builder.transformControls.setMode(mode);
  }

  deselectSpotlight() {
    this.coneMaterial.color.set(0xcfccee);
    this.coneMaterial.opacity = 0.5;

    window.removeEventListener("keydown", this.keydownHandler);
    this.builder.deselectSpotlight();
  }

  removeSpotlight() {
    this.builder.deselectSpotlight();

    this.builder.scene.remove(this.coneHelper);
    this.builder.removeSpotlight(this);
  }

  switchOff() {
    console.log("switchOff", this.wall.col);

    this.spotLight.intensity = 0;
  }
}

export default WallLight;
