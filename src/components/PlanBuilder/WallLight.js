import * as THREE from "three";
import animate from "../../Helpers/animate";

const coneColor = 0x9999ff;
const coneColorSelected = 0x99eeaa;

class WallLight {
  constructor(props, side = "front") {
    // this.controls = this.setupControls();
    const { intensity, position, color, target, builder } = props;
    if (props.color) {
      this.builder = builder;
      this.scene = this.builder.scene;

      const threeColor = new THREE.Color(...color);
      this.spotLight = new THREE.SpotLight(threeColor);

      this.spotLight.position.set(...position);
      //console.log("settingh this.spotLight", this.spotLight);

      this.spotLight.shadow.camera.near = 1;
      this.spotLight.shadow.camera.far = 500;
      this.spotLight.angle = 0.4;
      this.spotLight.intensity = intensity;
      this.spotLight.penumbra = 1;
      this.setTarget(target);
      this.builder.scene.add(this.spotLight);
    } else {
      this.wall = props;
      this.builder = builder || this.wall.builder;
      this.scene = this.builder.scene;

      this.spotLightColor = "#ffffff";
      this.spotLight = new THREE.SpotLight(this.spotLightColor);
      // this.spotLight.castShadow = true;
      this.spotLight.shadow.camera.near = 1;
      this.spotLight.shadow.camera.far = 500;
      this.spotLight.angle = 0.4;
      this.spotLight.distance = 0;
      if (target) {
        //when added by button
        //console.log("target", target);
        this.spotLight.intensity = 0.6;
        this.setTarget(target);
        this.builder.scene.add(this.spotLight);
      } else {
        //for default wall light
        this.spotLight.intensity = 0.2;
        this.spotLight.target = this.wall.wallGroup;
        const { x, y, z } = this.spotLight.target.position;
        this.setTarget([x, y, z]);
      }
      // this.spotLight.castShadow = true;
      // this.spotLight.shadow.camera.fov = this.controls.fov;
      this.spotLight.penumbra = 1;
      this.side = side;
    }

    if (position) this.spotLight.position.set(...position);

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
    const helperTargetGeometry = new THREE.SphereGeometry(1.5);

    const helperTargetMaterial = new THREE.MeshNormalMaterial({
      color: 0xcfccee,
      transparent: true,
      opacity: 0
    });
    this.helperTarget = new THREE.Mesh(
      helperTargetGeometry,
      helperTargetMaterial
    );
    this.helperTarget.name = "helperTarget";
    this.posHolder = this.spotLight.target.getWorldPosition();
    this.helperTarget.position.set(...targetPositionArray);
    this.scene.add(this.helperTarget);
    this.spotLight.target = this.helperTarget;
  }
  setConeHelper() {
    var geometry = new THREE.ConeGeometry(5, 20, 32);
    geometry.rotateX(Math.PI / 2);
    geometry.rotateY(Math.PI);
    this.coneMaterial = new THREE.MeshBasicMaterial({
      color: coneColor,
      transparent: true,
      opacity: 0.5
    });
    this.coneHelper = new THREE.Mesh(geometry, this.coneMaterial);
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
    this.spotLight.intensity = intensity;
    this.spotLight.color.setHex(0xffffff);
    this.hoverAni && this.hoverAni.end();

    // if (this.wall.currentSideOver.hasArt) this.switchOn();
  }

  addWallLightToScene() {
    // this.spotLight.intensity = 0.2;
    // this.spotLight.color.setHex(0xff3333);
    this.builder.addLightToArray(this.spotLight);
    this.hoverOff();
  }
  switchOn(intensity = 0.8) {
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
    this.coneMaterial.color.set(coneColorSelected);
    this.coneMaterial.opacity = 0.75;
  }
  addLightEditListeners() {
    window.addEventListener("keydown", this.keydownHandler.bind(this));
    // window.addEventListener("mousedown", this.mousedownHandler);
  }

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
    this.coneMaterial.color.set(coneColor);
    this.coneMaterial.opacity = 0.5;

    window.removeEventListener("keydown", this.keydownHandler);
    this.builder.deselectSpotlight();
  }

  removeSpotlight() {
    this.builder.scene.remove(this.helperTarget);

    this.builder.deselectSpotlight();

    this.coneHelper && this.builder.scene.remove(this.coneHelper);
    this.builder.scene.remove(this.spotLight)
    this.builder.scene.remove(this.coneHelper);
    console.log("this.helperTarget",this.helperTarget)
    this.builder.removeSpotlight(this);
  }

  switchOff() {
    console.log("switchOff", this.wall.col);

    this.spotLight.intensity = 0;
  }
}

export default WallLight;
