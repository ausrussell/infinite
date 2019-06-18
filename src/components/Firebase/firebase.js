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
      this.currentUID = user.uid;
    });
    this.floorplansRef = this.database.ref("floorplans");
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) => {
    this.auth.signInWithEmailAndPassword(email, password);
  };

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);

  // *** User API ***

  user = uid => {
    this.database.ref(`users/${uid}`);
  };

  users = () => this.database.ref("users");

  storeFloorplan = ({ data, title, timestamp }) => {
    const newPostRef = this.database.ref("floorplans").push();
    newPostRef.set({
      uid: this.currentUID,
      data: data,
      title: title
    });
    return newPostRef.getKey();
  };

  removePlan = key => {
    this.database
      .ref("floorplans")
      .child(key)
      .remove();
  };
  getPlanByKey = (key, callback) => {
    this.floorplansRef.child(key).on("value", snapshot => {
      callback(snapshot);
    });
  };

  getUsersFloorplans = callback => {
    // debugger;
    this.currentUID = this.currentUID || "Smj8Dswyd7eJTZ2gigjJhXtfDDZ2";
    if (this.currentUID) {
      return this.floorplansRef
        .orderByChild("uid")
        .equalTo(this.currentUID)
        .on("value", snapshot => callback(snapshot));
      // .then(data => {
      //   // debugger;
      //   // console.log("floorplan promised", data.val().data);
      //   const list = [];
      //   if (data) {
      //     data.forEach(function(childSnapshot) {
      //       // key will be "ada" the first time and "alan" the second time
      //       var key = childSnapshot.key;
      //       // childData will be the actual contents of the child
      //       var childData = childSnapshot.val();
      //       list.push(childSnapshot);
      //       console.log("childData", key, childData);
      //     });
      //   }
      //
      //   return list;
      // });
    }

    // return new Promise(function(resolve, reject) {
    //   throw "User not logged in";
    // });
    // }
  };

  storeArt = file => {
    const storageRef = this.storage.ref();
    const imageRef = storageRef.child("art2/" + file.name);
    imageRef.put(file).then(function(snapshot) {
      console.log("Uploaded a blob or file!:" + file.name);
    });
    const data = {
      url: "imageRef"
    };
    // debugger;
    this.database.ref("vault").set(data);
  };

  listArt = () => {
    const storageRef = this.storage.ref("art");
    debugger;
    storageRef
      .listAll()
      .then(result => {
        result.items.forEach(function(imageRef) {
          // And finally display them
          displayImage(imageRef);
        });
      })
      .catch(function(error) {
        // Handle any errors
      });
    function displayImage(imageRef) {
      imageRef
        .getDownloadURL()
        .then(function(url) {
          console.log("url of image", url);
          // TODO: Display the image on the UI
        })
        .catch(function(error) {
          // Handle any errors
        });
    }
    // var storageRef = firebase.storage().ref("art");
    //
    // // Now we get the references of these images
    // storageRef
    //   .listAll()
    //   .then(function(result) {
    //     result.items.forEach(function(imageRef) {
    //       // And finally display them
    //       displayImage(imageRef);
    //     });
    //   })
    //   .catch(function(error) {
    //     // Handle any errors
    //   });
    //
    // function displayImage(imageRef) {
    //   imageRef
    //     .getDownloadURL()
    //     .then(function(url) {
    //       console.log("url of image", url);
    //       // TODO: Display the image on the UI
    //     })
    //     .catch(function(error) {
    //       // Handle any errors
    //     });
    // }
  };
}

export default Firebase;
