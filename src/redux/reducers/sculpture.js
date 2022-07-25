import { ADD_SCULPTURES } from "../actionTypes";
import { ADD_SCULPTURE } from "../actionTypes";

export default function (state = [], action) {
  console.log("scene.js ", state, action)
  switch (action.type) {
    case ADD_SCULPTURES: {
      return action.payload;
    }
    case ADD_SCULPTURE: {
        return [...state,action.payload];
      }
  
    default:
      return state;
  }
}
