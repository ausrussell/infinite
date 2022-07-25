import { combineReducers } from "redux";
// import visibilityFilter from "./visibilityFilter";

import scene from "./scene";
import sceneData from "./sceneData";
import galleries from "./galleries";
import sessionReducer from './session';
import userReducer from './user';
import { firebaseReducer } from 'react-redux-firebase'

export default combineReducers({ scene, sceneData, firebase: firebaseReducer, galleries, sessionState: sessionReducer, userState: userReducer, });
