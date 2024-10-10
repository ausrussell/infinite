import { combineReducers } from "redux";

import scene from "./scene";
import camera from "./camera";
import renderer from "./renderer";
import sceneData from "./sceneData";
import galleries from "./galleries";
import sessionReducer from './session';
import userReducer from './user';
import animationUpdatables from './animationUpdatables';
import physicsObjects from './physicsObjects'
import { firebaseReducer } from 'react-redux-firebase'


export default combineReducers({ scene,camera,renderer, sceneData, firebase: firebaseReducer, galleries, sessionState: sessionReducer, userState: userReducer,animationUpdatables, physicsObjects });
