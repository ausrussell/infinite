// import { ADD_SCULPTURES } from "../actionTypes";

const defaultValues = {
    color: [1,1,1],
    intensity: 0.1
}

export default function (state = defaultValues, action) {
  console.log("scene.js ", state, action)
  switch (action.type) {
    // case ADD_SCULPTURES: {
    //   return action.payload;
    // }
    // case ADD_SCULPTURE: {
    //     return [...state,action.payload];
    //   }
  
    default:
      return state;
  }
}
