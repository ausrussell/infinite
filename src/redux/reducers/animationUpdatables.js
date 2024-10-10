import {
  ADD_ANIMATION_UPDATABLES,
  REMOVE_ANIMATION_UPDATABLES,
} from "../actionTypes";

const initialState = {  };

const animationUpdatables = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ANIMATION_UPDATABLES: {
      console.log(
        "animationUpdatables redux",
        Object.assign({}, state, action.payload)
      );
      return Object.assign({}, state, action.payload);
    }
    case REMOVE_ANIMATION_UPDATABLES: {
      return action.payload.filter;
    }
    default: {
      return state;
    }
  }
};

export default animationUpdatables;
