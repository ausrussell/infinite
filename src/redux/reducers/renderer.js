import { CREATE_RENDERER } from "../actionTypes";

import {WebGLRenderer} from "three";
const initialState = new WebGLRenderer({ antialias: true })

const renderer = function (state = initialState, action) {
  console.log("redux renderer ", state, action);
  switch (action.type) {
    case CREATE_RENDERER: {
      return action.payload;
    }

    default:
      return state;
  }
}

export default renderer;