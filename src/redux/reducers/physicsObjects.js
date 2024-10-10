import {
    ADD_PHYSICS_OBJECT,
    REMOVE_PHYSICS_OBJECT,
  } from "../actionTypes";
  
  const initialState = {};
  
  const physicsObjects = (state = initialState, action) => {
    switch (action.type) {
      case ADD_PHYSICS_OBJECT: {
        console.log("ADD_PHYSICS_OBJECT", state, action.payload)
        
        // return [...state, action.payload];
        console.log(



          "ADD_PHYSICS_OBJECT redux",
          Object.assign({}, state, action.payload)
        );
        return Object.assign({}, state, action.payload);
      }
      case REMOVE_PHYSICS_OBJECT: {
        return action.payload.filter;//??
      }
      default: {
        return state;
      }
    }
  };
  
  export default physicsObjects;
  