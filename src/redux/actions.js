import { CREATE_SCENE, ADD_SCULPTURES, ADD_SCULPTURE, CREATE_SCENE_DATA, RESET_SCENE_DATA, SELECT_GALLERY, ADD_IMAGE_LOADED,FETCH_GALLERIES } from "./actionTypes";

export const createScene = (scene) => {
  return { type: CREATE_SCENE, payload: scene };
};

export const createSceneData = (sceneData) => {
  return { type: CREATE_SCENE_DATA, payload: sceneData };
};

export const resetSceneData = (initData) => {
  return {type: RESET_SCENE_DATA, payload: initData}
};

export const addSculptures = (sculptures) => {
  return { type: ADD_SCULPTURES, payload: sculptures };
};

export const addSculpture = (sculpture) => {
  //to do
  return { type: ADD_SCULPTURE, payload: sculpture };
};

export const selectGallery = (galleryId) => {
  //to do
  return { type: SELECT_GALLERY, payload: galleryId };
};



export const addImageLoaded = (img) => {
  //to do
  return { type: ADD_IMAGE_LOADED, payload: img };
};

// export const fetchGalleries = () => {
//   //to do
//   return { type: FETCH_GALLERIES, payload: {} };
// };

// export const removeSculpture = (id) => {
//   return { type: ADD_SCULPTURE, payload: sculpture };
// };
