import { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";

import { AmmoPhysics } from "./AmmoPhysics.js";
import { addAnimationUpdatables } from "../../redux/actions";

import * as THREE from "three";
const STATE = { DISABLE_DEACTIVATION: 4 };
const Physics = ({
  physicsObjects,
  animationUpdatables,
  addAnimationUpdatables,
  objectsCount,
}) => {
  const [physics, setPhysics] = useState();
  const moveObj = useRef();

  useEffect(() => {
    const start = async () => {
      const physics = await AmmoPhysics();

      setPhysics(physics);
      // addAnimationUpdatables({ artani: ammoAnimate3 });
    };
    start();
  }, []);

  const ammoAnimate3 = () => {
    if (physics?.AmmoLib) {
      let scalingFactor = 20;
      let resultantImpulse = new physics.AmmoLib.btVector3(1, 0, 1);
      resultantImpulse.op_mul(scalingFactor);
      moveObj?.current.setLinearVelocity(resultantImpulse);
    }
  };

  useEffect(() => {
    const position = new THREE.Vector3();
    const ammoAnimate2 = () => {
      // console.log("ammoAnimate2 fires", physicsObjects.boxes,physicsObjects.boxes.count)
      let index = Math.floor(Math.random() * physicsObjects.boxes.count);

      position.set(-0.4, Math.random() * 5, 0);

      physics.setMeshPosition(physicsObjects.boxes, position, index);
    };

    console.log("physicsObjects to animate", physicsObjects);
    if (objectsCount === 7) {
      console.log("objectsCount", objectsCount);
      Object.values(physicsObjects).forEach((i) => {
        console.log("objects loop i", i);
        let mesh = i.mesh || i;
        console.log("add object ", mesh, mesh.name);

        // console.log("")
        let body = physics.addMesh(mesh, i.mass);
        console.log("physics mesh", mesh, i.mass);
        if (mesh.userData?.artOptions?.push && !moveObj.current) {


          body.setActivationState(STATE.DISABLE_DEACTIVATION);
          // moveObj.current = body;
          console.log("body movemesh", body);

          // addAnimationUpdatables({ artani: ammoAnimate3 });

          let scalingFactor = 1.0;
          let resultantImpulse = new physics.AmmoLib.btVector3(...mesh.userData.artOptions.leanDirection);
          // resultantImpulse.setY(-mesh.position.y * 1.94)
          resultantImpulse.op_mul(scalingFactor);
          // moveObj.current.setLinearVelocity(resultantImpulse);
          console.log("resultantImpulse",resultantImpulse);
          
          let worldPoint = new physics.AmmoLib.btVector3();
          
          
          worldPoint.setValue(mesh.position.x, mesh.position.y * 1.94, mesh.position.z);
console.log("worldPoint",worldPoint )
          body.applyImpulse(resultantImpulse, worldPoint);

        }
      });
    }

    if (
      physics &&
      physicsObjects.boxes &&
      physicsObjects.floor &&
      !animationUpdatables.boxes
    ) {
      console.log(
        "physicsObjects to animate animate call",
        objectsCount,
        physicsObjects
      );

      physics.addMesh(physicsObjects.boxes, 1);
      addAnimationUpdatables({ boxes: ammoAnimate2 });
    }
  }, [physics, physicsObjects, animationUpdatables, objectsCount]);
  return null;
};

const mapStateToProps = (state) => {
  const { physicsObjects, animationUpdatables } = state;
  console.log("state in physics ", state);
  console.log(
    "physicsObjects in physics state",
    physicsObjects,
    animationUpdatables
  );
  const objectsCount = Object.keys(physicsObjects).length;
  return { physicsObjects, animationUpdatables, objectsCount };
};

export default connect(mapStateToProps, { addAnimationUpdatables })(Physics);

// import { useEffect, useState } from "react";
// import { connect } from "react-redux";

// import { AmmoPhysics } from "three/examples/jsm/physics/AmmoPhysics.js";
// import { addAnimationUpdatables } from "../../redux/actions";

// // @ts-ignore
// // import * as Ammo from "ammo.js";

// import * as THREE from "three";

// const Physics = ({
//   physicsObjects,
//   animationUpdatables,
//   addAnimationUpdatables,
//   objectsCount,
// }) => {
//   const [physics, setPhysics] = useState();
//   useEffect(() => {
//     console.log("Ammo first", window.Ammo);
//     let physicsWorld;
//     const  setupPhysicsWorld = async () => {

//       const AmmoLib = await Ammo(); // eslint-disable-line no-undef
// console.log("AmmoLib",AmmoLib)
// const frameRate = 60;

// const collisionConfiguration = new AmmoLib.btDefaultCollisionConfiguration();
// console.log("collisionConfiguration",collisionConfiguration)

//   }
//   console.log ("is ammo in window", 'Ammo' in window === true )
//   if ('Ammo' in window === true ) {
//     setupPhysicsWorld()
//   }
//     // window.Ammo().then((ammo) => {
//     //   console.log("ammojs loaded", ammo);
//     //   setupPhysicsWorld()
//     // });
//   }, []);
//   return null;
// };

// const mapStateToProps = (state) => {
//   const { physicsObjects, animationUpdatables } = state;
//   console.log("state in physics ", state);
//   console.log(
//     "physicsObjects in physics state",
//     physicsObjects,
//     animationUpdatables
//   );
//   const objectsCount = Object.keys(physicsObjects).length;
//   return { physicsObjects, animationUpdatables, objectsCount };
// };

// export default connect(mapStateToProps, { addAnimationUpdatables })(Physics);
