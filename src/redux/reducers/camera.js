import { CREATE_CAMERA } from "../actionTypes";

import * as THREE from "three";
const initialState = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

const camera = function (state = initialState, action) {
  console.log("camera ", state, action);
  switch (action.type) {
    case CREATE_CAMERA: {
      return action.payload;
    }

    default:
      return state;
  }
}

export default camera;