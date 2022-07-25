import { createStore, compose, applyMiddleware } from "redux";
import rootReducer from "./reducers";
import { getFirebase } from 'react-redux-firebase'
import thunk from "redux-thunk";
const middlewares = [thunk.withExtraArgument(getFirebase)];
export default createStore(
  rootReducer,
  {},
  compose(applyMiddleware(...middlewares))
);