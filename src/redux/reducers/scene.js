import { CREATE_SCENE } from "../actionTypes";

import * as THREE from "three";
const initialState = new THREE.Scene();

export default function (state = initialState, action) {
  console.log("scene.js ", state, action);
  switch (action.type) {
    case CREATE_SCENE: {
      return action.payload;
    }

    default:
      return state;
  }
}
