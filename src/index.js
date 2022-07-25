import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import Firebase, { FirebaseContext } from "./components/Firebase";
import CanvasPrimary from "./components/Scene/Canvas";
import { CanvasContext } from "./components/Scene/CanvasContext";

import { Provider } from "react-redux";
import store from "./redux/store";

import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";

import App from "./components/App";

import { ReactReduxFirebaseProvider } from "react-redux-firebase";
// import { fetchGalleries } from "./redux/reducers/galleries";

const rrfConfig = {
  userProfile: "users",
  // useFirestoreForProfile: true // Firestore for Profile instead of Realtime DB
  // enableClaims: true // Get custom claims along with the profile
};
const fbConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// Initialize firebase instance
firebase.initializeApp(fbConfig); //.auth().onAuthStateChanged(user => store.dispatch(fetchGalleries));;

const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
  // createFirestoreInstance // <- needed if using firestore
};
// store.dispatch(fetchGalleries); //should be in store setup

ReactDOM.render(
  <Provider store={store}>
    <ReactReduxFirebaseProvider {...rrfProps}>
      <FirebaseContext.Provider value={new Firebase()}>
        <CanvasContext.Provider value={new CanvasPrimary()}>
          <App />
        </CanvasContext.Provider>
      </FirebaseContext.Provider>
    </ReactReduxFirebaseProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
