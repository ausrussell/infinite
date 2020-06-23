import * as THREE from "three";
import Animate from "../../Helpers/animate";
import { isEqual } from 'lodash';


const degreesToRadians = degrees => {
  return (degrees * Math.PI) / 180;
};

class FlaneurControls {
  constructor(object, builder) {
    this.object = object;
    console.log("this.object", this.object);
    this.builder = builder;
    console.log("this.builder", this.builder);
    this.mode = this.builder.flaneurMode;
    console.log("flaneurMode", this.mode);
    this.domElement = this.builder.mount;

    this.enabled = true;

    this.movementSpeed = 65;
    this.lookSpeed = 0.04;

    this.lookVertical = true;
    this.autoForward = false;

    this.activeLook = false; //true;

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
    this.footstepsAngle = new THREE.Vector3();

    if (this.domElement !== document) {
      this.domElement.setAttribute("tabindex", -1);
      this.domElement.focus();
    }

    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.handleResize();
    this.createClickFloor();
    this.loadImagery();
    this.currentDestination = null;
    this.defaultObjectY = 50;
    this.collisionDistance = 5;
    this.moveToDestinationAni = new Animate({
      duration: 10000,
      timing: "circ",
      draw: progress => this.moveToDestinationLoop(progress),
      done: this.doneMoveToDestination
    });
    this.moveToArtAni = new Animate({
      duration: 1000,
      timing: "circ",
      draw: progress => this.moveToArtLoop(progress),
      done: this.doneMoveToArt
    });
    this.restoreDefaultFovAni = new Animate({
      duration: 600,
      timing: "circ",
      draw: progress => this.restoreDefaultFovLoop(progress),
      done: this.doneRestoreDefaultFov
    });
    this.collidableObjects = [];
    // this.setUpCollidableObjects();

    if (this.mode === "Gallery") this.setUpArtMovement();
    this.defaultFov = 60;
    this.onArt = false;
    this.movingToArt = false;

  }

  setUpCollidableObjects() {
    this.collidableObjects = [this.clickFloorPlane, ...this.builder.state.wallMeshes];
    if (this.mode === "Gallery") {
      this.collidableObjects.push(...this.builder.state.artMeshes);
      // console.log("collidableObjects", collidableObjects)
    }
    if (this.footstepsHoverMesh) this.collidableObjects.push(this.footstepsHoverMesh);
    console.log("setUpCollidableObjects", this.collidableObjects)

  }

  loadImagery() {
    var loader = new THREE.TextureLoader();
    loader.load("../imagery/foot.png", imagery => this.setUpFootsteps(imagery));
  }

  setTarget(vector) {
    this.target.set(...vector);
    this.targetSetExternally = true;
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

  setFocus() {
    if (this.domElement !== document) {
      this.domElement.focus();
    }
  }

  onMouseDown = event => {
    if (this.domElement !== document) {
      this.domElement.focus();
    }



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
    const hoverIntersect = this.checkForIntersecting();
    if (hoverIntersect.footstepsHover) {
      this.moveToDestination();
    }
    // console.log("mousedown this.artOver",this.artOver)
    if (this.artOver) {
      // debugger;
      this.moveToArt();
    }

  };

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

  onMouseMove = event => {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - (window.innerHeight - this.domElement.offsetHeight)) / this.domElement.offsetHeight) * 2 + 1;
    this.checkForFloorHover();
    if (this.mode === "Gallery") this.checkForArtHover();
  };

  onKeyDown = event => {
    if (!this.moveToArtAni.stop) {
      this.moveToArtAni.end();
      if (this.object.fov !== this.defaultFov) this.restoreDefaultFov()
    }
    switch (event.keyCode) {
      case 38: /*up*/
      case 87:
        if (!this.moveToDestinationAni.stop) this.moveToDestinationAni.end();
        /*W*/ this.moveForward = true;
        break;

      case 37: /*left*/
      case 65:
        this.moveCameraLeft = true;
        // /*A*/ this.moveLeft = true;
        break;

      case 40: /*down*/
      case 83:
        if (!this.moveToDestinationAni.stop) this.moveToDestinationAni.end();

        /*S*/ this.moveBackward = true;
        break;

      case 39: /*right*/
      case 68:
        // /*D*/ this.moveRight = true;
        this.moveCameraRight = true;
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
        // /*A*/ this.moveLeft = false;
        this.moveCameraLeft = false;
        break;

      case 40: /*down*/
      case 83:
        /*S*/ this.moveBackward = false;
        break;

      case 39: /*right*/
      case 68:
        // /*D*/ this.moveRight = false;
        this.moveCameraRight = false;
        break;

      case 82:
        /*R*/ this.moveUp = false;
        break;
      case 70:
        /*F*/ this.moveDown = false;
        break;
      case 27:
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
    this.object.lookAt(this.target);

    this.setOrientation();

    return this;
  }

  detectPlayerCollision() {
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
    if (this.builder.rayIntersect(rayCaster, this.collisionDistance)) {
      return true;
    } else {
      return false;
    }
  }

  update(delta) {
    if (this.enabled === false) {
      return;
    }

    let oldPosition = Object.assign({}, this.object.position);

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

    // if (this.detectPlayerCollision()) return;
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

    if (this.moveCameraRight) {
      this.object.rotation.y -= 0.012;
    }

    if (this.moveCameraLeft) {
      this.object.rotation.y += 0.012;
    }

    if (!isEqual(oldPosition, Object.assign({}, this.object.position))) {
      this.checkForFloorHover();
      this.checkForArtHover();
      if (this.onArt) {
        console.log("fire restoreFov")
        this.restoreDefaultFov()
        this.onArt = false;
      }
      // console.log("update this.onArt",this.onArt);
    }
  }

  cameraTimer = () => {
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

    // window.e
    this.domElement.removeEventListener("keydown", this.onKeyDown, false);
    window.removeEventListener("keyup", this.onKeyUp, false);
  }

  bindEvents() {
    this.domElement.addEventListener("contextmenu", this.contextmenu, false);
    this.domElement.addEventListener("mousemove", this.onMouseMove, false);
    this.domElement.addEventListener("mousedown", this.onMouseDown, false);
    this.domElement.addEventListener("mouseup", this.onMouseUp, false);

    // window
    this.domElement.addEventListener("keydown", this.onKeyDown, false);
    window.addEventListener("keyup", this.onKeyUp, false);
  }

  bind = (scope, fn) => {
    return function () {
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

  initialCameraAnimation() {
    let cameraPosition = [0, this.builder.initialCameraHeight, 0];
    this.setCameraPosition(cameraPosition);
    this.zeroVector = new THREE.Vector3(0, this.defaultObjectY, 0);
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
    } else {
      this.lookAt(this.zeroVector);
      this.setOrientation();
      this.unsetTarget();
    }
  };
  setCameraPosition(cameraPosition) {
    this.object.position.set(...cameraPosition);
  }
  createClickFloor() {

    // this.builder.gridWidth,
    // this.builder.gridDepth
    const clickFloorPlaneGeo = new THREE.PlaneBufferGeometry(
      this.builder.state.voxelsX * this.builder.state.wallWidth,
      this.builder.state.voxelsY * this.builder.state.wallWidth
    );
    clickFloorPlaneGeo.rotateX(-Math.PI / 2);
    this.clickFloorPlane = new THREE.Mesh(
      clickFloorPlaneGeo,
      new THREE.MeshStandardMaterial({
        visible: false
        // color: 0xf10000
      })
    );
    this.clickFloorPlane.translateY(0.1);
    this.clickFloorPlane.name = "clickFloorPlane";
    this.builder.scene.add(this.clickFloorPlane);
    // debugger;
    // this.setUpFootsteps();
  }

  setUpArtMovement() {
    this.artOver = null;

  }
  setUpFootsteps(imagery) {
    // this.footTexture = imagery;
    const footGeo = new THREE.PlaneBufferGeometry(20, 20);

    footGeo.rotateX(-Math.PI / 2);
    const footHoverMaterial = new THREE.MeshStandardMaterial({
      // color: 0xfefaf1,
      opacity: 0.4,
      transparent: true,
      map: imagery
      // repeat: 1
    });
    const footDestinationMaterial = new THREE.MeshBasicMaterial({
      // color: 0xfefaf1,
      map: imagery,
      opacity: 1,
      transparent: true
    });

    // footHoverMaterial.map = footDestinationMaterial.map = this.footTexture;
    // footHoverMaterial.alphaMap = imagery; 
    footHoverMaterial.needsUpdate = footDestinationMaterial.needsUpdate = true;
    this.footstepsHoverMesh = new THREE.Mesh(footGeo, footHoverMaterial);
    this.footstepsHoverMesh.name = "footHover";
    this.footstepsDestinationMesh = new THREE.Mesh(
      footGeo,
      footDestinationMaterial
    );
    this.footstepsDestinationMesh.name = "footDestination";
    this.builder.scene.add(this.footstepsHoverMesh);
    this.footstepHoverOffset = new THREE.Vector3(10, 0.2, 10)
    this.bindEvents();
    this.collidableObjects.push(this.footstepsHoverMesh);
    console.log("setUpFootsteps collidableObjects", this.collidableObjects)


  }

  moveToDestination() {
    this.moveToDestinationAni.end();
    if (!this.builder.scene.getObjectByName("footDestination")) {
      this.builder.scene.add(this.footstepsDestinationMesh);
    }
    this.footstepsDestinationMesh.position.copy(
      this.footstepsHoverMesh.position
    );
    const destinationVector = new THREE.Vector3();
    destinationVector.copy(this.footstepsHoverMesh.position);
    this.currentDestination = destinationVector;
    this.moveFrom = this.object.position;
    this.moveToDestinationAni.begin();
  }

  moveToArt() {
    console.log("move to this.artOver", this.artOver, this.artOver.getWorldPosition(), this.artOver.frameDisplayObject.viewingPosition);
    const destinationVector = new THREE.Vector3(0, 1, 0);
    destinationVector.copy(this.artOver.frameDisplayObject.viewingPosition.getWorldPosition());
    var quaternion = new THREE.Quaternion();
    let r;
    r = (this.artOver.frameDisplayObject.wall.pos === 0) ? Math.PI / 2 : 0;
    if (this.artOver.frameDisplayObject.side === "back" && this.artOver.frameDisplayObject.wall.pos === 0) r = -Math.PI / 2;
    if (this.artOver.frameDisplayObject.side === "back" && this.artOver.frameDisplayObject.wall.pos === 1) r = 1;

    quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r);
    this.currentDestination = destinationVector;
    // this.currentDestination.cameraRotation = (this.artOver.frameDisplayObject.wall.pos === 0) ? 1.5 : 0;
    if (this.artOver.frameDisplayObject.side === "back" && this.artOver.frameDisplayObject.wall.pos === 0) this.currentDestination.cameraRotation = -1.5;
    this.currentDestination.cameraQuaternion = quaternion;
    const opp = (this.artOver.frameDisplayObject.ratio <= 1) ? this.artOver.geometry.parameters.height / 2 : this.artOver.geometry.parameters.width / 2;
    console.log("ratio", this.artOver.geometry.parameters.width, this.artOver.geometry.parameters.height, this.artOver.frameDisplayObject.ratio)
    const adj = 25;
    this.currentDestination.fov = Math.atan(opp / adj) * 180 / Math.PI * 2;
    console.log("this.currentDestination.fov", this.currentDestination.fov);
    console.log("destinationVector", destinationVector);
    this.moveFrom = this.object.position;
    this.moveFrom.fov = this.object.fov;
    this.moveToArtAni.begin();
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  cameraLerp(a, b, t) {
    return a + (b - a) * t;
  }

  moveToArtLoop(progress) {
    this.moveToDestinationAni.end();
    var newX = (this.moveFrom.x - ((this.moveFrom.x - this.currentDestination.x) * progress)); // interpolate between a and b where
    var newZ = (this.moveFrom.z - ((this.moveFrom.z - this.currentDestination.z) * progress)); // interpolate between a and b where
    var newY = (this.moveFrom.y - ((this.moveFrom.y - this.currentDestination.y) * progress)); // interpolate between a and b where
    var newFov = this.lerp(this.moveFrom.fov, this.currentDestination.fov, progress);
    this.setFov(newFov);
    this.object.position.set(newX, newY, newZ);
    this.object.quaternion.slerp(this.currentDestination.cameraQuaternion, progress);
    this.movingToArt = true;
  }

  moveToDestinationLoop(progress) {
    var newX = (this.moveFrom.x - ((this.moveFrom.x - this.currentDestination.x) * progress)); 
    var newZ = (this.moveFrom.z - ((this.moveFrom.z - this.currentDestination.z) * progress)); 
    this.object.position.set(newX, this.defaultObjectY, newZ);
  }

  doneMoveToArt = () => {
    this.moveToArtAni.end();
    this.currentDestination = null;
    this.onArt = true;
    console.log("doneMoveToArt this.onArt", this.onArt);
  };

  doneMoveToDestination = () => {
    this.moveToDestinationAni.end();
    this.builder.scene.remove(this.footstepsDestinationMesh);
    this.currentDestination = null;
  };

  checkForIntersecting() {
    // handle this in index ??
    this.object.updateMatrixWorld();
    this.raycaster.setFromCamera(this.mouse, this.object);
    const intersect = {};
    const intersectedAll = this.raycaster.intersectObjects(this.collidableObjects); //collidableObjects
    const intersected0 = intersectedAll[0];

    if (!intersected0) {
      return intersect;
    }
    switch (intersected0.object.name) {
      case "footHover":
        intersect.footstepsHover = intersectedAll[0];
        break;
      case "clickFloorPlane":
        intersect.clickFloorPlane = intersectedAll[0];
        break;

      case "artMesh":
        intersect.artMesh = intersectedAll[0];
        break;
      default:
        break;
    }
    return intersect;
  }

  checkForFloorHover() {
    const intersect = this.checkForIntersecting();
    if (this.footstepsHoverMesh && intersect.clickFloorPlane) {
      this.positionFootstepsHover(intersect.clickFloorPlane);
    }
  }

  checkForArtHover() {
    const intersect = this.checkForIntersecting();
    if (intersect.artMesh) {
      this.overArtHandler(intersect.artMesh);
    } else {
      this.artOver && this.leaveArtHandler()
    }
  }

  overArtHandler(artMesh) {
    if (!this.artOver || (this.artOver && artMesh.object.uuid !== this.artOver.uuid)) {
      // console.log("artMesh.object.uuid !== this.artOver.uuid", artMesh.object, this.artOver)
      console.log()
      this.artOver = artMesh.object;
      this.artOver.frameDisplayObject.artHoverHandler()
    }
  }

  leaveArtHandler() {
    this.artOver.frameDisplayObject.artLeaveHandler()
    this.artOver = null
  }

  positionFootstepsHover(intersect) {
    this.footstepsHoverMesh.position
      .copy(intersect.point)
      .add(intersect.face.normal)
      .divideScalar(20)
      .floor()
      .multiplyScalar(20)
      .add(this.footstepHoverOffset);
    this.getFootAngle(this.footstepsHoverMesh.position);
  }

  getFootAngle(destination) {
    this.footstepsAngle.subVectors(this.object.position, destination).normalize();
    const texture = this.footstepsHoverMesh.material.map;
    var angle = Math.atan2(
      this.object.position.x - destination.x,
      this.object.position.z - destination.z
    );
    texture.center.set(0.5, 0.5);
    texture.repeat.set(1.3, 1.3);
    texture.rotation = angle;
    texture.matrix.scale(0.5, 0.5);
  }

  getMouse() {
    return this.mouse;
  }

  setFov(e) {
    this.object.fov = e;
    this.object.updateProjectionMatrix();
  }

  restoreDefaultFov() {
    this.restoreDefaultFovAni.end();

    this.moveFromFov = this.object.fov;
    this.restoreDefaultFovAni.begin();
  }

  restoreDefaultFovLoop(progress) {
    const newFov = this.moveFromFov - ((this.moveFromFov - this.defaultFov) * progress);
    // console.log("restoreDefaultFovLoop",newFov)
    this.setFov(newFov);
  }

  doneDefaultFov() {
    this.restoreDefaultFovAni.end()
  }
}

export default FlaneurControls;
