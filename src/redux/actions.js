import { CREATE_SCENE, CREATE_CAMERA, CREATE_RENDERER, ADD_SCULPTURES, ADD_SCULPTURE, CREATE_SCENE_DATA, RESET_SCENE_DATA, SELECT_GALLERY, ADD_IMAGE_LOADED,ADD_ANIMATION_UPDATABLES,REMOVE_ANIMATION_UPDATABLES, ADD_PHYSICS_OBJECT, REMOVE_PHYSICS_OBJECT} from "./actionTypes";

export const createScene = (scene) => {
  return { type: CREATE_SCENE, payload: scene };
};

export const createSceneData = (sceneData) => {
  return { type: CREATE_SCENE_DATA, payload: sceneData };
};

export const createCamera = (camera) => {
  return { type: CREATE_CAMERA, payload: camera };
};

export const createRenderer = (renderer) => {
  return { type: CREATE_RENDERER, payload: renderer };
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


export const addAnimationUpdatables = (updatables) => {
  return { type: ADD_ANIMATION_UPDATABLES, payload: updatables };
};

export const removeAnimationUpdatables = (updatables) => {
  return { type: REMOVE_ANIMATION_UPDATABLES, payload: updatables }
};

export const addPhysicsObject = (physicsObject) => {
  return { type: ADD_PHYSICS_OBJECT, payload: physicsObject };
};

export const removePhysicsObject = (physicsObject) => {
  return { type: REMOVE_PHYSICS_OBJECT, payload: physicsObject }
};