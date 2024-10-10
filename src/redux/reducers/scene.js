import { CREATE_SCENE } from "../actionTypes";

import * as THREE from "three";
const initialState = new THREE.Scene();

const scene = function (state = initialState, action) {
  console.log("scene.js ", state, action);
  switch (action.type) {
    case CREATE_SCENE: {
      console.log("CREATE_SCENE scene reducer",action.payload)
      return action.payload;
    }

    default:
      return state;
  }
}

export default scene;