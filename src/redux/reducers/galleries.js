import {
  SELECT_GALLERY,
  ADD_IMAGE_LOADED,
  SET_GALLERIES_LIST,
} from "../actionTypes";

const initialState = {
  list: [],
  selectedGallery: null,
  loadedImages: [],
};

const galleries = function (state = initialState, action) {
  switch (action.type) {
    case SET_GALLERIES_LIST: {
      console.log("FETCH_GALLERIES payload state", action.payload, state);
      return {...state, list:action.payload};
    }
    case SELECT_GALLERY: {
      console.log("SELECT_GALLERY state", action.payload, state);

      return action.payload;
    }
    case ADD_IMAGE_LOADED: {
      console.log("SELECT_GALLERY state", action.payload, state);
      return action.payload;
    }

    default:
      return state;
  }
}

export default galleries;