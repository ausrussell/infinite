import { useEffect, useState } from "react";
import { connect } from "react-redux";

import { AmmoPhysics } from "three/examples/jsm/physics/AmmoPhysics.js";
import { addAnimationUpdatables } from "../../redux/actions";

import * as THREE from "three";

const Physics = ({
  physicsObjects,
  animationUpdatables,
  addAnimationUpdatables,
  objectsCount,
}) => {
  const [physics, setPhysics] = useState();
  useEffect(() => {
    const start = async () => {
      const physics = await AmmoPhysics();

      setPhysics(physics);
    };
    start();
  }, []);
  useEffect(() => {
    const position = new THREE.Vector3();
    const ammoAnimate2 = () => {
      // console.log("ammoAnimate2 fires", physicsObjects.boxes,physicsObjects.boxes.count)
      let index = Math.floor(Math.random() * physicsObjects.boxes.count);

      position.set(0, Math.random() * 5, 0);

      physics.setMeshPosition(physicsObjects.boxes, position, index);
    };
    console.log("physicsObjects to animate", physicsObjects);
    if (physicsObjects.art) physics.addMesh(physicsObjects.art, 1);

    if (physics && physicsObjects.boxes && !animationUpdatables.boxes) {
      console.log(
        "physicsObjects to animate animate call",
        objectsCount,
        physicsObjects
      );
      physics.addMesh(physicsObjects.boxes, 1);
      physics.addMesh(physicsObjects.floor);
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
