/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

import * as THREE from "three";

// THREE.FirstPersonControls = function(object, domElement) {
class FirstPersonControls {
  constructor(object, domElement = document) {
    this.object = object;

    this.domElement = domElement !== undefined ? domElement : document;

    this.enabled = true;

    this.movementSpeed = 1.0;
    this.lookSpeed = 0.005;

    this.lookVertical = true;
    this.autoForward = false;

    this.activeLook = true;

    this.heightSpeed = false;
    this.heightCoef = 1.0;
    this.heightMin = 0.0;
    this.heightMax = 1.0;

    this.constrainVertical = false;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;

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
    this.bindEvents();
    this.handleResize();
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
    event.preventDefault();
    event.stopPropagation();

    if (this.activeLook) {
      switch (event.button) {
        case 0:
          this.moveForward = true;
          break;
        case 2:
          this.moveBackward = true;
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
      }
    }

    this.mouseDragOn = false;
  };
  //
  onMouseMove = event => {
    if (this.domElement === document) {
      this.mouseX = event.pageX - this.viewHalfX;
      this.mouseY = event.pageY - this.viewHalfY;
    } else {
      this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
      this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
    }
  };

  onKeyDown = event => {
    //event.preventDefault();

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

      case 18:
        debugger;
        /*Esc*/ this.enabled = !this.enabled;
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

    this.setOrientation(this);

    return this;
  }
  //
  // update() {
  //   var targetPosition = new THREE.Vector3();
  //
  //   return function

  update(delta) {
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

    let actualLookSpeed = delta * this.lookSpeed;

    if (!this.activeLook) {
      actualLookSpeed = 0;
    }

    let verticalLookRatio = 1;

    if (this.constrainVertical) {
      verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
    }

    this.lon += this.mouseX * actualLookSpeed;
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

    let targetPosition = this.target;
    let position = this.object.position;

    targetPosition.x =
      position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
    targetPosition.y = position.y + 100 * Math.cos(this.phi);
    targetPosition.z =
      position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);

    this.object.lookAt(targetPosition);
  }

  updateXXXXXX(delta) {
    // debugger;
    // var targetPosition = new THREE.Vector3();

    // return this.update (delta) {
    // var delta = 0;
    console.log("delta", delta);
    var targetPosition = new THREE.Vector3();

    if (this.enabled === false) return;

    if (this.heightSpeed) {
      var y = THREE.Math.clamp(
        this.object.position.y,
        this.heightMin,
        this.heightMax
      );
      var heightDelta = y - this.heightMin;

      this.autoSpeedFactor = delta * (heightDelta * this.heightCoef);
    } else {
      this.autoSpeedFactor = 0.0;
    }

    var actualMoveSpeed = delta * this.movementSpeed;

    if (this.moveForward || (this.autoForward && !this.moveBackward))
      this.object.translateZ(-(actualMoveSpeed + this.autoSpeedFactor));
    if (this.moveBackward) this.object.translateZ(actualMoveSpeed);

    if (this.moveLeft) this.object.translateX(-actualMoveSpeed);
    if (this.moveRight) {
      // debugger;
      this.object.translateX(actualMoveSpeed);
    }
    if (this.moveUp) this.object.translateY(actualMoveSpeed);
    if (this.moveDown) this.object.translateY(-actualMoveSpeed);

    var actualLookSpeed = delta * this.lookSpeed;

    if (!this.activeLook) {
      actualLookSpeed = 0;
    }

    var verticalLookRatio = 1;

    if (this.constrainVertical) {
      verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
    }

    this.lon -= this.mouseX * actualLookSpeed;
    if (this.lookVertical)
      this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

    this.lat = Math.max(-85, Math.min(85, this.lat));

    var phi = THREE.Math.degToRad(90 - this.lat);
    var theta = THREE.Math.degToRad(this.lon);

    if (this.constrainVertical) {
      phi = THREE.Math.mapLinear(
        phi,
        0,
        Math.PI,
        this.verticalMin,
        this.verticalMax
      );
    }

    var position = this.object.position;

    targetPosition.setFromSphericalCoords(1, phi, theta).add(position);
    // debugger;
    this.object.lookAt(targetPosition);
    // }
  }
  // })();
  //
  contextmenu(event) {
    event.preventDefault();
  }
  //
  dispose() {
    this.domElement.removeEventListener(
      "contextmenu",
      e => this.contextmenu(e),
      false
    );
    this.domElement.removeEventListener(
      "mousedown",
      e => this.onMouseDown(e),
      false
    );
    this.domElement.removeEventListener(
      "mousemove",
      e => this.onMouseMove(e),
      false
    );
    this.domElement.removeEventListener(
      "mouseup",
      e => this.onMouseUp(e),
      false
    );

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

  setOrientation(controls) {
    var quaternion = controls.object.quaternion;

    this.lookDirection.set(0, 0, -1).applyQuaternion(quaternion);
    this.spherical.setFromVector3(this.lookDirection);

    this.lat = 90 - THREE.Math.radToDeg(this.spherical.phi);
    this.lon = THREE.Math.radToDeg(this.spherical.theta);
  }

  // this.handleResize();

  // setOrientation(this);
}

export default FirstPersonControls;
