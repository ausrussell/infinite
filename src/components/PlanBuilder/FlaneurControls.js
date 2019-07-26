import * as THREE from "three";
import Animate from "../../Helpers/animate";

const degreesToRadians = degrees => {
  return (degrees * Math.PI) / 180;
};
// THREE.FirstPersonControls = function(object, domElement) {
class FlaneurControls {
  constructor(object, builder) {
    this.object = object;
    this.builder = builder;
    // debugger;
    // this.domElement = domElement !== undefined ? domElement : document;
    // this.domElement = document;
    this.domElement = this.builder.mount;

    this.enabled = true;

    this.movementSpeed = 20;
    this.lookSpeed = 0.04;

    this.lookVertical = true;
    this.autoForward = false;

    this.activeLook = true;

    this.heightSpeed = false;
    this.heightCoef = 1.0;
    this.heightMin = 0.0;
    this.heightMax = 1.0;

    this.constrainVertical = true;
    this.verticalMin = 1.4;
    this.verticalMax = 1.7;

    this.autoSpeedFactor = 0.0;

    this.mouseX = 0;
    this.mouseY = 0;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.mouseDragOn = false;

    this.viewHalfX = 0;
    this.viewHalfY = 0;

    // private variables

    this.lat = 0;
    this.lon = 0;

    this.lookDirection = new THREE.Vector3();
    this.spherical = new THREE.Spherical();
    this.target = new THREE.Vector3();

    if (this.domElement !== document) {
      this.domElement.setAttribute("tabindex", -1);
    }
    //
    // //
    //
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.bindEvents();
    this.handleResize();
    this.createClickFloor();
    this.loadImagery();
  }

  loadImagery() {
    var loader = new THREE.TextureLoader();
    loader.load("../imagery/foot.png", imagery => this.setUpFootsteps(imagery));
  }

  setTarget(vector) {
    this.target.set(...vector);
    this.targetSetExternally = true;
    // console.log("...vector", ...vector);
  }
  unsetTarget() {
    this.targetSetExternally = false;
  }

  handleResize() {
    if (this.domElement === document) {
      this.viewHalfX = window.innerWidth / 2;
      this.viewHalfY = window.innerHeight / 2;
    } else {
      this.viewHalfX = this.domElement.offsetWidth / 2;
      this.viewHalfY = this.domElement.offsetHeight / 2;
    }
  }

  onMouseDown = event => {
    if (this.domElement !== document) {
      this.domElement.focus();
    }
    // debugger;
    // event.preventDefault();
    // event.stopPropagation();

    if (this.activeLook) {
      switch (event.button) {
        case 0:
          this.moveForward = true;
          break;
        case 2:
          this.moveBackward = true;
          break;
        default:
          break;
      }
    }

    this.mouseDragOn = true;
  };
  //
  onMouseUp = event => {
    event.preventDefault();
    event.stopPropagation();

    if (this.activeLook) {
      switch (event.button) {
        case 0:
          this.moveForward = false;
          break;
        case 2:
          this.moveBackward = false;
          break;
        default:
          break;
      }
    }

    this.mouseDragOn = false;
  };
  //
  onMouseMove = event => {
    // this.enabled = true;
    // clearTimeout(this.cameraTimeout);
    // this.cameraTimeout = setTimeout(this.cameraTimer, 1009);
    console.log("flaneur mousemove");

    this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
    this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
    console.log("this.mouseX", this.mouseX, this.builder.mouse.x);
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.checkForIntersecting();
  };

  onKeyDown = event => {
    //event.preventDefault();
    console.log("onKeyDown", event.keyCode);
    switch (event.keyCode) {
      case 38: /*up*/
      case 87:
        /*W*/ this.moveForward = true;
        break;

      case 37: /*left*/
      case 65:
        /*A*/ this.moveLeft = true;
        break;

      case 40: /*down*/
      case 83:
        /*S*/ this.moveBackward = true;
        break;

      case 39: /*right*/
      case 68:
        /*D*/ this.moveRight = true;
        break;

      case 82:
        /*R*/ this.moveUp = true;
        break;
      case 70:
        /*F*/ this.moveDown = true;
        break;
      default:
        break;
    }
  };
  //
  onKeyUp = event => {
    switch (event.keyCode) {
      case 38: /*up*/
      case 87:
        /*W*/ this.moveForward = false;
        break;

      case 37: /*left*/
      case 65:
        /*A*/ this.moveLeft = false;
        break;

      case 40: /*down*/
      case 83:
        /*S*/ this.moveBackward = false;
        break;

      case 39: /*right*/
      case 68:
        /*D*/ this.moveRight = false;
        break;

      case 82:
        /*R*/ this.moveUp = false;
        break;
      case 70:
        /*F*/ this.moveDown = false;
        break;
      case 27:
        // debugger;
        /*Esc*/ this.enabled = !this.enabled;
        break;
      default:
        break;
    }
  };
  //
  lookAt(x, y, z) {
    if (x.isVector3) {
      this.target.copy(x);
    } else {
      this.target.set(x, y, z);
    }
    // console.log("x,y,z", x, y, z);
    this.object.lookAt(this.target);

    this.setOrientation();
    // console.log("this.lon, this.lat", this.lon, this.lat);

    return this;
  }
  //
  // update() {
  //   var targetPosition = new THREE.Vector3();
  //
  //   return function

  detectPlayerCollision() {
    let PLAYERCOLLISIONDISTANCE = 45;
    // The rotation matrix to apply to our direction vector
    // Undefined by default to indicate ray should coming from front
    var rotationMatrix;
    // Get direction of camera
    // var cameraDirection = this.object
    //   .getDirection(new THREE.Vector3(0, 0, 0))
    //   .clone();

    var vector = new THREE.Vector3(); // create once and reuse it!

    var cameraDirection = this.object.getWorldDirection(vector);

    // Check which direction we're moving (not looking)
    // Flip matrix to that direction so that we can reposition the ray
    if (this.moveBackward) {
      rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeRotationY(degreesToRadians(180));
    } else if (this.moveLeft) {
      rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeRotationY(degreesToRadians(90));
    } else if (this.moveRight) {
      rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeRotationY(degreesToRadians(270));
    }

    // Player is not moving forward, apply rotation matrix needed
    if (rotationMatrix !== undefined) {
      cameraDirection.applyMatrix4(rotationMatrix);
    }

    // Apply ray to player camera
    var rayCaster = new THREE.Raycaster(this.object.position, cameraDirection);

    // If our ray hit a collidable object, return true
    if (this.builder.rayIntersect(rayCaster, PLAYERCOLLISIONDISTANCE)) {
      return true;
    } else {
      return false;
    }
  }

  update(delta) {
    // console.log("update delta", delta);
    if (this.enabled === false) {
      return;
    }

    if (this.heightSpeed) {
      let y = THREE.Math.clamp(
        this.object.position.y,
        this.heightMin,
        this.heightMax
      );
      let heightDelta = y - this.heightMin;

      this.autoSpeedFactor = delta * (heightDelta * this.heightCoef);
    } else {
      this.autoSpeedFactor = 0.0;
    }

    if (this.detectPlayerCollision()) return;
    let actualMoveSpeed = delta * this.movementSpeed;

    if (this.moveForward || (this.autoForward && !this.moveBackward)) {
      this.object.translateZ(-(actualMoveSpeed + this.autoSpeedFactor));
    }
    if (this.moveBackward) {
      this.object.translateZ(actualMoveSpeed);
    }

    if (this.moveLeft) {
      this.object.translateX(-actualMoveSpeed);
    }
    if (this.moveRight) {
      this.object.translateX(actualMoveSpeed);
    }

    if (this.moveUp) {
      this.object.translateY(actualMoveSpeed);
    }
    if (this.moveDown) {
      this.object.translateY(-actualMoveSpeed);
    }

    // console.log("this.object.position", this.object.position);
    /*
    let actualLookSpeed = delta * this.lookSpeed;

    if (!this.activeLook) {
      actualLookSpeed = 0;
    }

    let verticalLookRatio = 1;

    if (this.constrainVertical) {
      verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
    }

    this.lon -= this.mouseX * actualLookSpeed;
    if (this.lookVertical) {
      this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
    }

    this.lat = Math.max(-85, Math.min(85, this.lat));
    this.phi = THREE.Math.degToRad(90 - this.lat);

    this.theta = THREE.Math.degToRad(this.lon);

    if (this.constrainVertical) {
      this.phi = THREE.Math.mapLinear(
        this.phi,
        0,
        Math.PI,
        this.verticalMin,
        this.verticalMax
      );
    }
    // console.log("this.phi, this.theta", this.phi, this.theta);
    let targetPosition = this.target;
    // if (!this.targetSetExternally) {
    // console.log("not external set target");
    let position = this.object.position;
    targetPosition.x = -(
      position.x +
      100 * Math.sin(this.phi) * Math.cos(this.theta)
    );
    targetPosition.y = position.y + 100 * Math.cos(this.phi);
    targetPosition.z =
      position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);
    targetPosition
      .setFromSphericalCoords(1, this.phi, this.theta)
      .add(position);
    // this.enabled = !this.enabled;
    // this.cameraTimeout = setTimeout(this.cameraTimer, 1009);
    // }
    // console.log("this.object.quaternion", this.object.quaternion);
    // console.log("targetPosition", targetPosition);
    this.object.lookAt(targetPosition);
    */
  }
  cameraTimer = () => {
    console.log("cameraTimer");
    this.setOrientation();
    // this.targetSetExternally = true;
    // this.update();
    this.enabled = false;
  };

  contextmenu(event) {
    event.preventDefault();
  }
  //
  dispose() {
    this.domElement.removeEventListener("contextmenu", this.contextmenu, false);
    this.domElement.removeEventListener("mousedown", this.onMouseDown, false);
    this.domElement.removeEventListener("mousemove", this.onMouseMove, false);
    this.domElement.removeEventListener("mouseup", this.onMouseUp, false);

    window.removeEventListener("keydown", this.onKeyDown, false);
    window.removeEventListener("keyup", this.onKeyUp, false);
  }

  //  _onMouseMove = bind(this, this.onMouseMove);
  // var _onMouseDown = bind(this, this.onMouseDown);
  // var _onMouseUp = bind(this, this.onMouseUp);
  // var _onKeyDown = bind(this, this.onKeyDown);
  // var _onKeyUp = bind(this, this.onKeyUp);
  bindEvents() {
    this.domElement.addEventListener("contextmenu", this.contextmenu, false);
    this.domElement.addEventListener("mousemove", this.onMouseMove, false);
    this.domElement.addEventListener("mousedown", this.onMouseDown, false);
    this.domElement.addEventListener("mouseup", this.onMouseUp, false);

    window.addEventListener("keydown", this.onKeyDown, false);
    window.addEventListener("keyup", this.onKeyUp, false);
  }

  bind = (scope, fn) => {
    return function() {
      fn.apply(scope, arguments);
    };
  };

  setOrientation() {
    var quaternion = this.object.quaternion;

    this.lookDirection.set(0, 0, -1).applyQuaternion(quaternion);
    this.spherical.setFromVector3(this.lookDirection);

    this.lat = 90 - THREE.Math.radToDeg(this.spherical.phi);
    this.lon = THREE.Math.radToDeg(this.spherical.theta);
  }

  // this.handleResize();

  // setOrientation(this);

  initialCameraAnimation() {
    let cameraPosition = [0, this.builder.initialCameraHeight, 0];
    this.setCameraPosition(cameraPosition);
    this.zeroVector = new THREE.Vector3(0, 45, 0);
    // this.lookAt(this.zeroVector);
    this.cameraFlightHyp = Math.hypot(
      this.builder.initialCameraHeight,
      this.builder.cameraZAfterInitialAnimation
    );
    const cameraAni = new Animate({
      duration: this.builder.initialAnimationTime,
      timing: "circ",
      draw: progress => this.cameraFlight(progress)
    });
    cameraAni.animate();
  }

  cameraFlight = progress => {
    //45, 300
    const x = Math.sin(Math.PI * progress) * this.cameraFlightHyp;
    const cameraPosition = [
      x,
      this.builder.initialCameraHeight - 200 * progress,
      this.builder.cameraZAfterInitialAnimation * progress
    ];
    this.setCameraPosition(cameraPosition);
    // this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    if (progress < 1) {
      this.lookAt(this.zeroVector);
      // this.setTarget([0, 0, 0]);
      // this.update();
      // this.lon = 0;
      // this.lat = 0;
    } else {
      // this.moveForward = true;
      // this.lon = 0;
      // this.lat = 0;
      this.lookAt(this.zeroVector);
      this.setOrientation();
      this.unsetTarget();
    }
  };
  setCameraPosition(cameraPosition) {
    this.object.position.set(...cameraPosition);
  }
  createClickFloor() {
    // debugger;
    const clickFloorPlaneGeo = new THREE.PlaneBufferGeometry(
      this.builder.gridWidth,
      this.builder.gridDepth
    );
    clickFloorPlaneGeo.rotateX(-Math.PI / 2);
    this.clickFloorPlane = new THREE.Mesh(
      clickFloorPlaneGeo,
      new THREE.MeshStandardMaterial({
        visible: false
        // color: 0xf1f2ff
      })
    );
    this.builder.scene.add(this.clickFloorPlane);
    this.setUpFootsteps();
  }
  setUpFootsteps(imagery) {
    this.footTexture = imagery;
    const footGeo = new THREE.PlaneBufferGeometry(20, 20);
    footGeo.rotateX(-Math.PI / 2);
    const footMaterial = new THREE.MeshBasicMaterial({
      // color: 0xfefaf1,
      opacity: 0.5,
      transparent: true
    });
    footMaterial.map = this.footTexture;
    footMaterial.needsUpdate = true;
    this.footstepsHoverMesh = new THREE.Mesh(footGeo, footMaterial);
    this.builder.scene.add(this.footstepsHoverMesh);
  }

  checkForIntersecting() {
    this.object.updateMatrixWorld();
    this.raycaster.setFromCamera(this.mouse, this.object);
    const intersectedFloor = this.raycaster.intersectObjects([
      this.clickFloorPlane
    ]);
    if (intersectedFloor.length === 0) return;
    const intersect = intersectedFloor[0];

    this.footstepsHoverMesh.position
      .copy(intersect.point)
      .add(intersect.face.normal);
    this.footstepsHoverMesh.position
      .divideScalar(20)
      .floor()
      .multiplyScalar(20)
      .addScalar(10);
    this.footstepsHoverMesh.position.set(
      this.footstepsHoverMesh.position.x,
      0.3,
      this.footstepsHoverMesh.position.z
    );
  }

  getMouse() {
    return this.mouse;
  }
}

export default FlaneurControls;
