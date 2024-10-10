// import { ADD_SCULPTURES } from "../actionTypes";

const defaultValues = {
    color: [1,1,1],
    intensity: .5
}

const generalLight = function (state = defaultValues, action) {
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

export default generalLight;