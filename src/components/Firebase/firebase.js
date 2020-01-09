import app from "firebase";
import "firebase/database";
import "firebase/auth";
// import * as admin from "firebase-admin";
// import * as defaultAppConfig from "./infinite-a474a-firebase-adminsdk-q1m69-6756434499.json";

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID
};

class Firebase {
  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();
    this.storage = app.storage();
    this.database = app.database();

    this.auth.onAuthStateChanged(user => {
      this.currentUID = user ? user.uid : null;
      this.currentUser = user;
      console.log("this.auth.onAuthStateChanged", this.currentUID);
    });
    this.floorplansRef = this.database.ref("floorplans");
  }

  setupNewUser = (user, { displayName }) => {
    user.user.updateProfile({
      displayName: displayName
    });
  };

  getCurrentUser = () => {
    return this.auth.user;
  };

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = ({ email, passwordOne }) =>
    this.auth
      .createUserWithEmailAndPassword(email, passwordOne)
      .catch(error => {
        console.error(error); //Handle error
      });

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);

  // *** User API ***

  user = uid => {
    this.database.ref(`users/${uid}`);
  };

  users = () => this.database.ref("users");

  storeFloorplan = ({ data, title, timestamp }) => {
    console.log("storeFloorplan", this.currentUID);
    const newPostRef = this.database
      .ref("users/" + this.currentUID + "/floorplans")
      .push();
    newPostRef.set({
      data: data,
      title: title
    });
    return newPostRef.getKey();
  };

  removePlan = key => {
    this.database
      .ref("users/" + this.currentUID + "/floorplans")
      .child(key)
      .remove();
  };

  getUsersFloorplans = callback => {
    console.log(
      "getUsersFloorplans",
      "users/" + this.currentUID + "/floorplans"
    );
    this.userFloorplansRef = this.database.ref(
      "users/" + this.currentUID + "/floorplans"
    );
    return this.userFloorplansRef.on("value", callback);
  };
  detachGetUsersFloorplans() {
    this.userFloorplansRef.off();
  }
  getTiles = (refPath, callback) => {
    this.newArtRef = this.database.ref(refPath);
    return this.newArtRef.on("value", callback);
  };

  detachGetTiles() {
    this.newArtRef.off();
  }

  addFloorTile(tile) {
    const floortilesRef = this.database.ref("master/floortiles").push();
    floortilesRef.set(tile);
  }

  addFrameTile(tile) {
    const floortilesRef = this.database.ref("master/frametiles").push();
    floortilesRef.set(tile);
  }

  getPlanByKey = (key, callback) => {
    console.log(
      "getPlanByKey",
      key,
      "users/" + this.currentUID + "floorplans/" + key
    );
    return this.database
      .ref("users/" + this.currentUID + "/floorplans/" + key)
      .on("value", callback);
  };

  storeArt = file => {
    const storageRef = this.storage.ref();
    const imageRef = storageRef.child(
      "users/" + this.currentUID + "/art/" + file.name
    );
    return imageRef.put(file);
  };

  storeArtRef = (url, ref) => {
    const artData = {
      url: url
    };
    console.log(
      "storeArtRef",
      ref,
      "users/" + this.currentUID + "/art",
      artData
    );
    const newArtRef = this.database
      .ref("users/" + this.currentUID + "/art")
      .push();
    return newArtRef.set(artData);
  };
}

export default Firebase;
