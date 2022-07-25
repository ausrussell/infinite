import {
  EventDispatcher,
  MOUSE,
  Quaternion,
  Spherical,
  // TOUCH,
  Vector2,
  Vector3,
  Raycaster,
} from "three";

const _changeEvent = { type: 'change' };
// const _startEvent = { type: 'start' };
// const _endEvent = { type: 'end' };

const ObjControls = function (object, domElement, camera) {
  this.object = object;
  this.domElement = domElement;
  this.camera = camera;

  console.log("object is", object);

  this.raycaster = new Raycaster();
  // Set to false to disable this control
  this.enabled = true;
  // "target" sets the location of focus, where the object orbits around
  this.target = new Vector3();

  this.minPolarAngle = 0; // radians
  this.maxPolarAngle = Math.PI; // radians
  // Set to true to enable damping (inertia)
  // If damping is enabled, you must call controls.update() in your animation loop
  this.enableDamping = false;
  this.dampingFactor = 0.6;

  // Set to false to disable rotating
  this.enableRotate = true;
  this.rotateSpeed = 1.0;

  // Mouse buttons
  this.mouseButtons = {
    LEFT: MOUSE.ROTATE,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.PAN,
  };

  //internals
  const scope = this;
  // var changeEvent = { type: "change" };
  var startEvent = { type: "start" };
  var endEvent = { type: "end" };

  var STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6,
  };

  var state = STATE.NONE;

  const EPS = 0.000001;
  // current position in spherical coordinates
  var spherical = new Spherical();
  var sphericalDelta = new Spherical();
  let scale = 1;
  const panOffset = new Vector3();
  let zoomChanged = false;

  var rotateStart = new Vector2();
  var rotateEnd = new Vector2();
  var rotateDelta = new Vector2();
  function getAutoRotationAngle() {
    return ((2 * Math.PI) / 60 / 60) * scope.autoRotateSpeed;
  }
  function rotateLeft(angle) {
    sphericalDelta.theta -= angle;
  }

  function rotateUp(angle) {
    sphericalDelta.phi -= angle;
  }
  // function getMouse (){
  //   mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  //   mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  // }
  // this method is exposed, but perhaps it would be better if we can make it private...
  this.update = (function () {
    const offset = new Vector3();

    // so camera.up is the orbit axis
    const quat = new Quaternion().setFromUnitVectors(
      object.up,
      new Vector3(0, 1, 0)
    );
    const quatInverse = quat.clone().invert();

    const lastPosition = new Vector3();
    const lastQuaternion = new Quaternion();

    const twoPI = 2 * Math.PI;

    return function update() {
      const position = scope.object.position;
      // console.log("offset", offset);
      offset.copy(position).sub(scope.target); //scope.target
      // console.log("offset", offset);

      // offset.copy( position ).sub( scope.camera.position );
      // console.log("scope.camera.position", scope.camera.position);

      // rotate offset to "y-axis-is-up" space
      offset.applyQuaternion(quat);

      // angle from z-axis around y-axis
      spherical.setFromVector3(offset);
      if (scope.autoRotate && state === STATE.NONE) {
        rotateLeft(getAutoRotationAngle());
      }

      if (scope.enableDamping) {
        spherical.theta += sphericalDelta.theta * scope.dampingFactor;
        spherical.phi += sphericalDelta.phi * scope.dampingFactor;
      } else {
        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;
      }

      // restrict theta to be between desired limits

      let min = scope.minAzimuthAngle;
      let max = scope.maxAzimuthAngle;

      if (isFinite(min) && isFinite(max)) {
        if (min < -Math.PI) min += twoPI;
        else if (min > Math.PI) min -= twoPI;

        if (max < -Math.PI) max += twoPI;
        else if (max > Math.PI) max -= twoPI;

        if (min <= max) {
          spherical.theta = Math.max(min, Math.min(max, spherical.theta));
        } else {
          spherical.theta =
            spherical.theta > (min + max) / 2
              ? Math.max(min, spherical.theta)
              : Math.min(max, spherical.theta);
        }
      }

      // restrict phi to be between desired limits
      spherical.phi = Math.max(
        scope.minPolarAngle,
        Math.min(scope.maxPolarAngle, spherical.phi)
      );
      spherical.makeSafe();

      spherical.radius *= scale;

      // restrict radius to be between desired limits
      spherical.radius = Math.max(
        scope.minDistance,
        Math.min(scope.maxDistance, spherical.radius)
      );

      // move target to panned location

      if (scope.enableDamping === true) {
        scope.target.addScaledVector(panOffset, scope.dampingFactor);
      } else {
        scope.target.add(panOffset);
      }

      offset.setFromSpherical(spherical);

      // rotate offset back to "camera-up-vector-is-up" space
      offset.applyQuaternion(quatInverse);


      // scope.object.applyQuaternion(offset);

      sphericalDelta.theta *= 1 - scope.dampingFactor;
      sphericalDelta.phi *= 1 - scope.dampingFactor;
      scope.object.rotation.x -= sphericalDelta.phi;
      scope.object.rotation.y -= sphericalDelta.theta;

      if (scope.enableDamping === true) {
        sphericalDelta.theta *= 1 - scope.dampingFactor;
        sphericalDelta.phi *= 1 - scope.dampingFactor;

        panOffset.multiplyScalar(1 - scope.dampingFactor);
      } else {
        sphericalDelta.set(0, 0, 0);

        panOffset.set(0, 0, 0);
      }

      scale = 1;

      // update condition is:
      // min(camera displacement, camera rotation in radians)^2 > EPS
      // using small-angle approximation cos(x/2) = 1 - x^2 / 8

      if (
        zoomChanged ||
        lastPosition.distanceToSquared(scope.object.position) > EPS ||
        8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS
      ) {
        _changeEvent.rotation = scope.object.rotation
        scope.dispatchEvent(_changeEvent );

        lastPosition.copy(scope.object.position);
        lastQuaternion.copy(scope.object.quaternion);
        zoomChanged = false;

        return true;
      }

      return false;
    };
  })();

  function handleMouseDownRotate(event) {
    rotateStart.set(event.clientX, event.clientY);
  }

  function onMouseDown(event) {
    // Prevent the browser from scrolling.
    event.preventDefault();
    scope.domElement.focus ? scope.domElement.focus() : window.focus();

    var mouseAction;

    switch (event.button) {
      case 0:
        mouseAction = scope.mouseButtons.LEFT;
        break;

      case 1:
        mouseAction = scope.mouseButtons.MIDDLE;
        break;

      case 2:
        mouseAction = scope.mouseButtons.RIGHT;
        break;

      default:
        mouseAction = -1;
    }
    switch (mouseAction) {
      case MOUSE.ROTATE:
        if (scope.enableRotate === false) return;

        handleMouseDownRotate(event);

        state = STATE.ROTATE;

        break;

      default:
        state = STATE.NONE;
    }

    if (state !== STATE.NONE) {
      document.addEventListener("mousemove", onMouseMove, false);
      document.addEventListener("mouseup", onMouseUp, false);

      scope.dispatchEvent(startEvent);
    }
  }

  function handleMouseMoveRotate(event) {
    // console.log("handleMouseMoveRotate")
    rotateEnd.set(event.clientX, event.clientY);
    // rotateEnd.set(904, 519);

    // console.log("event.clientX, event.clientY",event.clientX, event.clientY)

    rotateDelta
      .subVectors(rotateEnd, rotateStart)
      .multiplyScalar(scope.rotateSpeed);

    var element = scope.domElement;
    // console.log("rotateDelta", rotateDelta);
    rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight); // yes, height

    rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight);

    rotateStart.copy(rotateEnd);

    scope.update();
  }
  function handleMouseUp(/*event*/) {
    // no-op
  }
  function onMouseUp(event) {
    if (scope.enabled === false) return;

    handleMouseUp(event);

    document.removeEventListener("mousemove", onMouseMove, false);
    document.removeEventListener("mouseup", onMouseUp, false);

    scope.dispatchEvent(endEvent);

    state = STATE.NONE;
  }

  function onMouseMove(event) {
    if (scope.enabled === false) return;

    event.preventDefault();

    switch (state) {
      case STATE.ROTATE:
        if (scope.enableRotate === false) return;

        handleMouseMoveRotate(event);

        break;

      default:
        state = STATE.NONE;
    }
  }

  // function onMouseMove(event) {
  // console.log("onMouseMove")
  // if (scope.enabled === false) return;
  // scope.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  // scope.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // }

  scope.domElement.addEventListener("mousedown", onMouseDown, false);
  // scope.domElement.addEventListener("mousemove", onMouseMove, false);

  this.update();
};

// const _changeEvent = { type: "change" };
// const ObjControlsXXXX = function (object, domElement) {

//   var mouseDown = false,
//     mouseX = 0,
//     mouseY = 0;

//   function onMouseMove(evt) {
//     if (!mouseDown) {
//       return;
//     }

//     evt.preventDefault();

//     var deltaX = evt.clientX - mouseX,
//       deltaY = evt.clientY - mouseY;
//     mouseX = evt.clientX;
//     mouseY = evt.clientY;
//     rotateScene(deltaX, deltaY);
//   }

//   function onMouseDown(evt) {
//     console.log("onMouseDown", evt, scope.domElement);
//     evt.preventDefault();

//     mouseDown = true;
//     mouseX = evt.clientX;
//     mouseY = evt.clientY;
//   }

//   function onMouseUp(evt) {
//     evt.preventDefault();

//     mouseDown = false;
//   }

//   function addMouseHandler(canvas) {
//     domElement.addEventListener(
//       "mousemove",
//       function (e) {
//         onMouseMove(e);
//       },
//       false
//     );
//     domElement.addEventListener(
//       "mousedown",
//       function (e) {
//         onMouseDown(e);
//       },
//       false
//     );
//     domElement.addEventListener(
//       "mouseup",
//       function (e) {
//         onMouseUp(e);
//       },
//       false
//     );
//   }

//   function rotateScene(deltaX, deltaY) {
//     console.log("deltaX, deltaY", deltaX, deltaY);
//     //   object.rotation.y += deltaX / 100;
//     //   object.rotation.x += deltaY / 100;
//     //   object.rotation.y += deltaX / 200;
//     object.rotation.z -= deltaY / 400;
//     // object.rotation.y += deltaX / 400;
//     console.log("object.rotation", object.rotation);
//   }
//   // domElement.addEventListener( 'mousedown', onMouseDown, false );
//   addMouseHandler();
// };
ObjControls.prototype = Object.create(EventDispatcher.prototype);
ObjControls.prototype.constructor = ObjControls;
export { ObjControls };
