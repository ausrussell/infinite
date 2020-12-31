import * as THREE from "three";
import Animate from "../../Helpers/animate";
import { isEqual } from "lodash";

const { Quaternion, Vector3, Vector2, Plane, Raycaster } = THREE;
export const Events = new THREE.EventDispatcher();

const degreesToRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

const defaultFov = 60;

const defaultCameraSpeed = 1;

class FlaneurControls {
  constructor(object, builder) {
    this.object = object;
    this.builder = builder;
    this.mode = this.builder.flaneurMode;
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
    this.cameraRotationQuarternion = new Quaternion();

    if (this.domElement !== document) {
      this.domElement.setAttribute("tabindex", -1);
      this.domElement.focus();
    }

    this.mouse = new Vector2();
    this.raycaster = new Raycaster();
    this.handleResize();
    this.createClickFloor();
    this.loadImagery();
    this.currentDestination = null;
    this.defaultObjectY = 40;
    this.collisionDistance = 5;
    this.setUpAnimations();
    this.collidableObjects = [];
    // this.setUpCollidableObjects();

    this.destinationVector = new THREE.Vector3();

    if (this.mode === "Gallery") this.setUpArtMovement();

    // this.onArt = this.builder.state.onArt;
    this.focusArt = false;
    this.cameraRotationSpeed = 1;

    this._plane = new Plane();
    this._worldPosition = new Vector3();
    this._intersections = [];
    this._hovered = null;
    this.scope = this;
  }

  setUpAnimations() {
    this.moveToDestinationAni = new Animate({
      duration: 5000,
      timing: "circ",
      draw: (progress) => this.moveToDestinationLoop(progress),
      done: this.doneMoveToDestination,
    });
    this.moveToArtAni = new Animate({
      duration: 1000,
      timing: "circ",
      draw: (progress) => this.moveToArtLoop(progress),
      done: this.doneMoveToArt,
    });
    this.restoreDefaultFovAni = new Animate({
      duration: 600,
      timing: "circ",
      draw: (progress) => this.restoreDefaultFovLoop(progress),
      done: this.doneRestoreDefaultFov,
    });
    this.easeOutCameraTurn = new Animate({
      duration: 200,
      timing: "easeOut",
      draw: (progress) => this.easeOutCameraTurnLoop(progress),
      done: this.doneEaseOutCameraTurn,
    });
  }

  easeCamera(dir) {
    this.easeOutCameraTurn.end();
    this.easeOutCameraTurn.begin();
  }

  easeOutCameraTurnLoop(progress) {
    this.cameraRotationSpeed = progress;
  }
  doneEaseOutCameraTurn = () => {
    this.moveCameraRight = false;
    this.moveCameraLeft = false;
    this.cameraRotationSpeed = defaultCameraSpeed;
  };

  setUpCollidableObjects() {
    this.collidableObjects = [
      this.clickFloorPlane,
      ...this.builder.state.wallMeshes,
    ];
    if (this.mode === "Gallery" && this.builder.state.artMeshes) {
      this.collidableObjects.push(...this.builder.state.artMeshes);
    }
    if (this.footstepsHoverMesh)
      this.collidableObjects.push(this.footstepsHoverMesh);
    console.log("setUpCollidableObjects", this.collidableObjects);
  }

  addCollidableObject(obj) {
    this.collidableObjects.push(obj);
    console.log("addCollidableObject", obj, this.collidableObjects);
  }

  loadImagery() {
    var loader = new THREE.TextureLoader();
    loader.load("../imagery/foot.png", (imagery) =>
      this.setUpFootsteps(imagery)
    );
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

  onMouseDown = (event) => {
    if (!this.enabled) return;

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
      this.moveToDestination(this.footstepsHoverMesh.position);
    }
    // if (
    //   this.builder.state.onArt &&
    //   hoverIntersect.artMesh &&
    //   hoverIntersect.artMesh.object.uuid === this.builder.state.onArt.artMesh.uuid
    // ) {
    //   console.log("clicked on selected art",this.selectedArt.artMesh.uuid)
    //   if(!this.builder.state.focusArt) this.setupFocusArt();
    //   this.originalOnArtDestination = this.currentDestination;
    //   this.moveInArt(hoverIntersect, event.shiftKey);
    // } else
    if (this.artOver) {
      this.moveToArt();
    }

    if (this.hoveredOn3d) {
      this.moveTo3d();
    }
  };

  onTouchStart = (event) => {
    console.log("onDocumentTouchStart", event);
    if (event.touches.length === 1) {
      event.preventDefault();
      this.mouse.x = event.touches[0].pageX - window.innerWidth / 2;
      this.mouse.y = event.touches[0].pageY - window.innerHeight / 2;
    }
    console.log("this.mouse", this.mouse);
    this.moveLeft = true;
    this.domElement.addEventListener("touchend", this.onTouchEnd, false);
  };

  onTouchEnd = () => {
    this.moveLeft = false;
    this.domElement.removeEventListener("touchend", this.onTouchEnd);
  };

  onDocumentTouchMove = () => {};

  onMouseUp = (event) => {
    if (!this.enabled) return;
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

  onMouseMove = (event) => {
    event.preventDefault();

    var rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.object);

    this._intersections.length = 0;

    this.raycaster.intersectObjects(
      this.collidableObjects,
      true,
      this._intersections
    );
    if (this.enabled) {
      this.checkForFloorHover(this.getIntersectType(this._intersections[0]));
    }
    if (this.mode === "Gallery")
      this.checkForArtHover(this.getIntersectType(this._intersections[0]));

    if (this._intersections.length > 0) {
      var object = this._intersections[0].object;
      // console.log("intersected", object);

      this._plane.setFromNormalAndCoplanarPoint(
        this.object.getWorldDirection(this._plane.normal),
        this._worldPosition.setFromMatrixPosition(object.matrixWorld)
      );

      if (this._hovered !== object) {
        // this.scope.dispatchEvent( { type: 'hoveron', object: object } );
        // this.domElement.style.cursor = "pointer";
        this._hovered = object;
        // Events.dispatchEvent({ type: "hoveron", object: this.hoveredOn3d || this._hovered });
      }
    } else {
      if (this._hovered !== null) {
        // this.hoveredOn3d
        // this.scope.dispatchEvent( { type: 'hoveroff', object: this._hovered } );

        this._hovered = null;
      }
      // this.domElement.style.cursor = "auto";
    }
    this.mode === "Gallery" && this.sculptureTraverser();
  };
  sculptureTraverser() {
    let hoveredOn3d = null;

    this._hovered &&
      this._hovered.traverseAncestors((item) => {
        if (item.name === "OSG_Scene" && !hoveredOn3d) hoveredOn3d = item;
      });
    if (hoveredOn3d && !this.hoveredOn3d) {
      // console.log("hoveredOn3d",hoveredOn3d)
      this.hoveredOn3d = hoveredOn3d;
      Events.dispatchEvent({ type: "hoveron", object: this.hoveredOn3d });
    } else if (this.hoveredOn3d) {
      // console.log("hoveredOff 3d",this.hoveredOn3d)
      Events.dispatchEvent({ type: "hoveroff", object: this.hoveredOn3d });
      this.hoveredOn3d = null;
    }
  }

  onKeyDown = (event) => {
    // console.log("onKeyDown", event.keyCode)

    if (!this.moveToArtAni.stop) {
      this.moveToArtAni.end();
      if (this.object.fov !== this.defaultFov) {
        this.restoreDefaultFov();
      }
    }
    if (this.focusArt && event.key === "Escape") {
      this.offArtHandler();
    }
    switch (event.keyCode) {
      case 38: /*up*/
      case 87:
        if (event.shiftKey) {
          this.moveUp = true;
        } else {
          /*W*/ this.moveForward = true;
        }
        break;

      case 37: /*left*/
      case 65:
        if (event.shiftKey) {
          this.moveLeft = true;
        } else {
          if (!this.easeOutCameraTurn.stop) this.easeOutCameraTurn.end();
          this.moveCameraLeft = true;
        }
        // /*A*/ this.moveLeft = true;
        break;

      case 40: /*down*/
      case 83:
        if (event.shiftKey) {
          this.moveDown = true;
        } else {
          /*S*/ this.moveBackward = true;
        }
        break;

      case 39: /*right*/
      case 68:
        // /*D*/ this.moveRight = true;
        if (event.shiftKey) {
          this.moveRight = true;
        } else {
          if (!this.easeOutCameraTurn.stop) this.easeOutCameraTurn.end();

          this.moveCameraRight = true;
        }
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
  onKeyUp = (event) => {
    switch (event.keyCode) {
      case 38: /*up*/
      case 87:
        /*W*/ this.moveForward = false;
        this.moveUp = false;
        this.zoomIn = false;

        break;

      case 37: /*left*/
      case 65:
        // /*A*/ this.moveLeft = false;
        // this.moveCameraLeft = false;
        if (this.moveCameraLeft) {
          this.easeCamera();
        }
        this.moveLeft = false;
        break;

      case 40: /*down*/
      case 83:
        /*S*/ this.moveBackward = false;
        this.moveDown = false;
        this.zoomOut = false;
        break;

      case 39: /*right*/
      case 68:
        // /*D*/ this.moveRight = false;
        if (this.moveCameraRight) {
          this.easeCamera();
          // this.easeCamera("right")
        }
        this.moveRight = false;
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

  disable() {
    this.enabled = false;
  }
  enable() {
    this.enabled = true;
  }
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
    // console.log("delta",delta)
    return this.builder.state.focusEye
      ? this.updateFocus(delta)
      : this.updateWalking(delta);
  }

  updateFocus(delta) {
    let actualFocusSpeed = delta * this.movementSpeed;
    if (this.moveForward) {
      const newFov = Math.max(this.object.fov - 2, 3);
      this.setFov(newFov);
    }
    if (this.moveBackward) {
      const timing = (timeFraction) =>
        Math.max(1 - (1 - Math.pow(timeFraction, 3)), 0.02);
      const progress = timing(this.object.fov / this.currentDestination.fov);
      this.moveFrom.fov = this.object.fov;
      this.moveToArtLoop(progress);
    }
    if (this.moveLeft) {
      this.object.translateX(-actualFocusSpeed);
    }
    if (this.moveRight) {
      this.object.translateX(actualFocusSpeed);
    }

    if (this.moveUp) {
      this.object.translateY(actualFocusSpeed);
    }
    if (this.moveDown) {
      this.object.translateY(-actualFocusSpeed);
    }

    if (this.moveCameraRight) {
      this.rotateCamera("right");
      this.checkForArtHover();
    }

    if (this.moveCameraLeft) {
      this.rotateCamera("left");
      this.checkForArtHover();
    }
  }

  updateWalking(delta) {
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
    let actualMoveSpeed = delta * this.movementSpeed;

    if (this.detectPlayerCollision()) {
      // return;

      this.moveForward = false;
      this.moveRight = true;
      this.collideCoast = true;
      actualMoveSpeed *= 0.1;
    }

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
      this.rotateCamera("right");
      this.checkForArtHover();
    }

    if (this.moveCameraLeft) {
      this.rotateCamera("left");
      this.checkForArtHover();
    }

    if (!isEqual(oldPosition, Object.assign({}, this.object.position))) {
      !this.moveToDestinationAni.stop && this.doneMoveToDestination();
      this.checkForArtHover();
      this.offArtHandler();
    }

    if (this.collideCoast) {
      this.moveRight = false;
      this.collideCoast = false;
    }
  }

  offArtHandler() {
    console.log("offArtHandler");
    this.builder.offArtHandler();
    // this.currentDestination = null;
    // this.builder.setArtDetails(null);
    this.restoreDefaultFov();
    // this.onArt = false;
    this.builder.setState({ onArt: false });
    this.selectedArt = null;
    this.domElement.style.cursor = "crosshair";
  }

  cameraRotation(dir) {
    let rot;
    switch (dir) {
      case "left":
        rot = this.cameraRotationQuarternion.setFromAxisAngle(
          new Vector3(0, 1, 0),
          degreesToRadians(this.cameraRotationSpeed)
        );
        break;
      case "right":
        rot = this.cameraRotationQuarternion.setFromAxisAngle(
          new Vector3(0, 1, 0),
          degreesToRadians(-this.cameraRotationSpeed)
        );
        break;
      default:
        break;
    }
    // console.log("rot",rot)
    return rot;
  }

  rotateCamera(dir) {
    const cur = this.object.quaternion;
    const rot = this.cameraRotation(dir);
    cur.multiplyQuaternions(rot, cur);
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

    if (this.mode === "Gallery") {
      window.removeEventListener("keydown", this.onKeyDown, false);
    } else {
      this.domElement.removeEventListener("keydown", this.onKeyDown, false);
    }
    // this.domElement.removeEventListener("keydown", this.onKeyDown, false);
    window.removeEventListener("keyup", this.onKeyUp, false);
    // this.builder.scene.remove()
  }

  bindEvents() {
    this.domElement.addEventListener("contextmenu", this.contextmenu, false);
    this.domElement.addEventListener("mousemove", this.onMouseMove, false);
    this.domElement.addEventListener("mousedown", this.onMouseDown, false);
    this.domElement.addEventListener("mouseup", this.onMouseUp, false);

    // window
    this.domElement.addEventListener("keydown", this.onKeyDown, false);
    if (this.mode === "Gallery") {
      window.addEventListener("keydown", this.onKeyDown, false);
    } else {
      this.domElement.addEventListener("keydown", this.onKeyDown, false);
    }
    window.addEventListener("keyup", this.onKeyUp, false);

    //mobile
    // this.domElement.addEventListener('touchstart', this.onTouchStart, false );

    // this.domElement.addEventListener('touchend', this.onTouchEnd, false );

    // this.domElement.addEventListener('touchmove', this.onTouchMove, false );
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
      draw: (progress) => this.cameraFlight(progress),
    });
    cameraAni.animate();
  }

  cameraFlight = (progress) => {
    //45, 300
    const x = Math.sin(Math.PI * progress) * this.cameraFlightHyp;
    const cameraPosition = [
      x,
      this.builder.initialCameraHeight - 200 * progress,
      this.builder.cameraZAfterInitialAnimation * progress,
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
        visible: false,
        // color: 0xf10000
      })
    );
    this.clickFloorPlane.translateY(0.1);
    this.clickFloorPlane.name = "clickFloorPlane";
    this.builder.scene.add(this.clickFloorPlane);
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
      map: imagery,
      // repeat: 1
    });
    const footDestinationMaterial = new THREE.MeshBasicMaterial({
      // color: 0xfefaf1,
      map: imagery,
      opacity: 1,
      transparent: true,
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
    this.footstepsHoverMesh.translateY(-1); //initial hide
    this.builder.scene.add(this.footstepsHoverMesh);
    this.footstepHoverOffset = new THREE.Vector3(10, 0.2, 10);
    this.bindEvents();
    this.collidableObjects.push(this.footstepsHoverMesh);
    // console.log("setUpFootsteps collidableObjects", this.collidableObjects)
  }

  moveToInitial() {
    this.offArtHandler();
    this.currentDestination = new THREE.Vector3(0, 45, 245);
    this.currentDestination.cameraQuaternion = new THREE.Quaternion();
    this.currentDestination.fov = 60;
    this.moveFrom = this.object.position;
    this.moveFrom.fov = this.object.fov;
    this.moveToArtAni.begin();
  }

  moveToDestination(pos) {
    this.moveToDestinationAni.end();
    if (!this.builder.scene.getObjectByName("footDestination")) {
      this.builder.scene.add(this.footstepsDestinationMesh);
    }
    this.footstepsDestinationMesh.position.copy(
      this.footstepsHoverMesh.position
    );
    this.destinationVector.copy(pos);
    this.currentDestination = this.destinationVector;
    this.moveFrom = this.object.position;
    this.moveToDestinationAni.begin();
  }

  moveToArt(artMesh) {
    this.selectedArt = artMesh
      ? artMesh.frameDisplayObject
      : this.artOver.frameDisplayObject;

    const type = this.selectedArt.borrowed ? "borrowed-art" : "art";

    this.selectedArt.data.art &&
      this.builder.getArtDetail(this.selectedArt.data.art.key, type);

    const destinationVector = new THREE.Vector3(0, 1, 0);
    destinationVector.copy(this.selectedArt.viewingPosition.getWorldPosition());
    var quaternion = new THREE.Quaternion();
    let r;
    r = this.selectedArt.wall.pos === 0 ? Math.PI / 2 : 0;
    if (this.selectedArt.side === "back" && this.selectedArt.wall.pos === 0)
      r = -Math.PI / 2;
    if (this.selectedArt.side === "back" && this.selectedArt.wall.pos === 1)
      r = Math.PI;

    quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r);
    this.currentDestination = destinationVector;
    this.currentDestination.cameraQuaternion = quaternion;
    const opp =
      this.selectedArt.ratio <= 1
        ? this.selectedArt.imageHeight / 2
        : this.selectedArt.imageWidth / 2;
    const adj = 25;
    this.currentDestination.fov = ((Math.atan(opp / adj) * 180) / Math.PI) * 2;
    console.log("this.currentDestination.fov", this.currentDestination.fov);

    this.moveFrom = this.object.position;
    this.moveFrom.fov = this.object.fov;
    this.originalOnArtDestination = this.currentDestination;
    this.moveToArtAni.begin();
  }

  moveInArt(hoverIntersect, shift) {
    const destinationVector = new THREE.Vector3(0, 1, 0);
    if (this.selectedArt.wall.pos === 0) {
      destinationVector.x = this.object.position.x;
      destinationVector.y = hoverIntersect.point.y;
      destinationVector.z = hoverIntersect.point.z; //.point.y
    } else {
      destinationVector.x = hoverIntersect.point.x;
      destinationVector.y = hoverIntersect.point.y;
      destinationVector.z = this.object.position.z; //.point.y
    }
    var quaternion = new THREE.Quaternion();
    let r;
    r = this.selectedArt.wall.pos === 0 ? Math.PI / 2 : 0;
    if (this.selectedArt.side === "back" && this.selectedArt.wall.pos === 0)
      r = -Math.PI / 2;
    if (this.selectedArt.side === "back" && this.selectedArt.wall.pos === 1)
      r = Math.PI;
    quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r);
    this.currentDestination = destinationVector;
    this.currentDestination.cameraQuaternion = quaternion;
    const fovDelta = shift ? 10 : -10;
    this.currentDestination.fov = this.object.fov + fovDelta;
    this.moveFrom = this.object.position;
    this.moveFrom.fov = this.object.fov;
    this.moveToArtAni.begin();
  }

  moveTo3d(obj) {
    console.log("moveToSculpture", this.hoveredOn3d);
    this.selectedArt = obj ? obj.scope : this.hoveredOn3d.scope;
    this.selectedArt.key &&
      this.builder.getArtDetail(this.selectedArt.key, "3d object");
    const destinationVector = new THREE.Vector3(0, 1, 0);
    destinationVector.copy(this.selectedArt.viewingPosition.getWorldPosition());
    var quaternion = this.selectedArt.rotationGroup.quaternion;
    this.currentDestination = destinationVector;
    this.currentDestination.cameraQuaternion = quaternion;
    const opp =
      this.selectedArt.ratio <= 1
        ? this.selectedArt.imageHeight / 2
        : this.selectedArt.imageWidth / 2;
    const adj = 25;
    this.currentDestination.fov = ((Math.atan(opp / adj) * 180) / Math.PI) * 2;
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
    !this.moveToDestinationAni.stop && this.moveToDestinationAni.end();
    var newX =
      this.moveFrom.x -
      (this.moveFrom.x - this.currentDestination.x) * progress; // interpolate between a and b where
    var newZ =
      this.moveFrom.z -
      (this.moveFrom.z - this.currentDestination.z) * progress; // interpolate between a and b where
    var newY =
      this.moveFrom.y -
      (this.moveFrom.y - this.currentDestination.y) * progress; // interpolate between a and b where
    var newFov = this.lerp(
      this.moveFrom.fov,
      this.currentDestination.fov,
      progress
    );
    this.setFov(newFov);
    this.object.position.set(newX, newY, newZ);
    this.object.quaternion.slerp(
      this.currentDestination.cameraQuaternion,
      progress
    );
  }

  moveToDestinationLoop(progress) {
    var newX =
      this.moveFrom.x -
      (this.moveFrom.x - this.currentDestination.x) * progress;
    var newZ =
      this.moveFrom.z -
      (this.moveFrom.z - this.currentDestination.z) * progress;
    var newY =
      this.moveFrom.y - (this.moveFrom.y - this.defaultObjectY) * progress;
    this.object.position.set(newX, newY, newZ);
  }

  doneMoveToArt = () => {
    console.log("moveToArtAni.end", this.moveToArtAni);
    this.moveToArtAni.end();
    console.log("this.currentDestination", this.currentDestination);
    console.log("this.selectedArt", this.selectedArt);
    if (this.originalOnArtDestination) {
      this.currentDestination = this.originalOnArtDestination;
      this.originalOnArtDestination = null;
    }
    // this.builder.setState({ onArt: this.selectedArt });
    // this.onArtHandler();
  };

  setupFocusArt() {
    if (!this.selectedArt) return;
    this.selectedArt.endArtHoverAni();
    this.builder.onArtHandler && this.builder.onArtHandler(this.selectedArt);
    this.domElement.style.cursor = "none";
  }

  // focusArt() {
  //   this.builder.onArtHandler && this.builder.onArtHandler(this.selectedArt);
  //   this.domElement.style.cursor = "none";
  //   this.focussedArt = this.builderonArt;
  // }

  doneMoveToDestination = () => {
    this.moveToDestinationAni.end();
    this.builder.scene.remove(this.footstepsDestinationMesh);
    this.currentDestination = null;
  };

  checkForIntersecting() {
    this.object.updateMatrixWorld();
    this.raycaster.setFromCamera(this.mouse, this.object);
    const intersectedCollidable = this.raycaster.intersectObjects(
      this.collidableObjects
    );
    const intersected0 = intersectedCollidable[0];
    return this.getIntersectType(intersected0);
  }

  getIntersectType(intersected0) {
    const intersect = {};

    if (!intersected0) {
      return intersect;
    }

    switch (intersected0.object.name) {
      case "footHover":
        intersect.footstepsHover = intersected0;
        break;
      case "clickFloorPlane":
        intersect.clickFloorPlane = intersected0;
        break;

      case "artMesh":
        intersect.artMesh = intersected0;
        intersect.point = intersected0.point;
        break;
      // case "3d object":
      //   debugger;
      //   intersect["3d object"] = intersectedAll[0];
      //   break;
      default:
        break;
    }

    return intersect;
  }

  checkForFloorHover(intersectType) {
    const intersect = intersectType || this.checkForIntersecting();
    if (intersect.clickFloorPlane || intersect.footstepsHover) {
      //this.footstepsHoverMesh &&
      intersect.clickFloorPlane &&
        this.positionFootstepsHover(intersect.clickFloorPlane);
    } else {
      this.footstepsHoverMesh.translateY(-1); //hide under floor
    }
  }

  checkForArtHover(intersectType) {
    const intersect = intersectType || this.checkForIntersecting();
    if (intersect.artMesh) {
      // console.log("intersect.artMesh");
      this.overArtHandler(intersect.artMesh);
    } else {
      this.artOver && this.leaveArtHandler();
    }
  }

  overArtHandler(artMesh) {
    if (
      !this.artOver ||
      (this.artOver && artMesh.object.uuid !== this.artOver.uuid)
    ) {
      // console.log("artMesh.object.uuid !== this.artOver.uuid", artMesh.object, this.artOver);
      this.artOver && this.artOver.frameDisplayObject.endArtHoverAni();
      this.artOver = artMesh.object;
      this.artOver.frameDisplayObject.artHoverHandler();
    }
  }

  leaveArtHandler() {
    this.artOver.frameDisplayObject.endArtHoverAni();
    this.artOver = null;
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
    this.footstepsAngle
      .subVectors(this.object.position, destination)
      .normalize();
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
    if (this.object.fov !== defaultFov) {
      this.moveFromFov = this.object.fov;
      console.log("begin restore fov", this.moveFromFov);
      this.restoreDefaultFovAni.begin();
    }
  }

  restoreDefaultFovLoop(progress) {
    const newFov =
      this.moveFromFov - (this.moveFromFov - defaultFov) * progress;
    this.setFov(newFov);
  }

  doneDefaultFov() {
    this.restoreDefaultFovAni.end();
  }
}

export default FlaneurControls;
