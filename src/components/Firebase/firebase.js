import app from "firebase";
import "firebase/database";
import "firebase/auth";
import moment from "moment";

// const config = {
//   apiKey: process.env.REACT_APP_API_KEY,
//   authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//   databaseURL: process.env.REACT_APP_DATABASE_URL,
//   projectId: process.env.REACT_APP_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_ID,
//   measurementId: process.env.REACT_APP_MEASUREMENT_ID,
// };

class Firebase {
  constructor() {
    console.log("Firebase constructor");
    // app.initializeApp(config);
    this.auth = app.auth();
    this.storage = app.storage();
    this.database = app.database();
    this.functions = app.functions();
    this.isCurator = false;
    // this.auth.onAuthStateChanged((user) => {
    //   this.currentUID = user ? user.uid : null;
    //   this.currentUser = user;
    //   console.log("call updateAccount", this.currentUID);

    //   this.updateAccount();
    //   this.isCurator =
    //     this.currentUID === "0XHMilIweAghhLcophtPU4Ekv7D3" ||
    //     this.currentUID === "bGXdibczHIWMfdbHCgAiCsjGEPx2";
    //   console.log(
    //     "this.auth.onAuthStateChanged",
    //     this.currentUID,
    //     "is curator",
    //     this.isCurator
    //   );
    // });
  }

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.user(authUser.uid)
          .once("value")
          .then((snapshot) => {
            const dbUser = snapshot.val();

            // default empty roles
            if (!dbUser.roles) {
              dbUser.roles = {};
            }

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              ...dbUser,
            };

            next(authUser);
          });
      } else {
        fallback();
      }
    });

  setupNewUser = (user, { displayName, email, username }) => {
    user.user.updateProfile({
      displayName: displayName,
    });
    return this.user(user.user.uid).set({
      displayName,
      username,
      email,
      createdAt: app.database.ServerValue.TIMESTAMP,
    });
  };

  updateAccount = () => {
    if (this.currentUID) {
      this.user(this.currentUID).once("value", (snapshot) => {
        // const snap = snapshot.val();
        let updateOptions = {
          lastLogin: app.database.ServerValue.TIMESTAMP,
          displayName: this.currentUser.displayName, //these three values from
          // username: this.currentUser.username,
          email: this.currentUser.email,
        };
        // console.log("updateOptions",updateOptions)
        this.user(this.currentUID).set(updateOptions);
      });
    }
  };

  getCurrentUser = () => {
    return this.auth.user;
  };

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = ({ email, password }) =>
    this.auth.createUserWithEmailAndPassword(email, password).catch((error) => {
      console.error(error); //Handle error
    });

  doSignInWithEmailAndPassword = (email, password) => {
    console.log("doSignInWithEmailAndPassword", this.auth);
    this.auth.signInWithEmailAndPassword(email, password);
  };
  doSignOut = () => this.auth.signOut();

  doPasswordReset = (email) => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = (password) =>
    this.auth.currentUser.updatePassword(password);

  // *** User API ***

  user = (uid) => this.database.ref(`users/${uid}/account`);

  users = () => this.database.ref("users");

  getList = ({ refPath, callback, orderField }) => {
    // const ref = this.database.ref(refPath);
    const ref = app.database().ref(refPath);
    ref.orderByChild(orderField).on("value", callback);
    return ref;
  };

  getAsset = ({ refPath, callback, once }) => {
    console.log("getAsset refPath", refPath);
    const ref = app.database().ref(refPath);
    if (once) {
      ref.once("value").then((snap) => {
        callback(snap);
      });
    } else {
      ref.on("value", callback);
    }
    return ref;
  };

  getUsersBorrowed;

  getAssetOnce = ({ refPath }) => {
    // console.log("getAsset refPath",refPath)
    const ref = app.database().ref(refPath);

    return ref.once("value");
  };

  updateAssets = (updates) => {
    return app.database().ref().update(updates);
  };

  updateAsset = (path, object) => {
    console.log("updateAsset", path, object);
    delete object.ref;
    object.updateTime = moment().format("MMMM Do YYYY, h:mm:ss a"); //new Date().getTime(); //app.database.ServerValue.TIMESTAMP;//new Date();
    const ref = this.database.ref(path);
    return ref.update(object);
  };

  storeFloorplan = ({ data, title, timestamp }) => {
    console.log("storeFloorplan", this.currentUID);
    const newPostRef = this.database
      .ref("users/" + this.currentUID + "/floorplans")
      .push();
    newPostRef.set({
      data: data,
      title: title,
      timestamp: timestamp,
    });
    return newPostRef;
  };

  updateTitle = (path, title) => {
    const ref = this.database.ref("users/" + this.currentUID + "/" + path);
    return ref.update({ title: title });
  };

  assetPath = (type) => "users/" + this.currentUID + "/" + type + "/";

  getAssetRef = (type, key) => {
    return this.database.ref(
      "users/" + this.currentUID + "/" + type + "/" + key
    );
  };

  deleteFolderContents(path) {
    const ref = this.storage.ref(path);
    return ref
      .listAll()
      .then((dir) => {
        dir.items.forEach((fileRef) => {
          console.log("deleteFile", fileRef.name);
          this.deleteFile(ref.fullPath, fileRef.name);
        });
        dir.prefixes.forEach((folderRef) => {
          console.log("deleteFolderContents recursive", folderRef.fullPath);
          this.deleteFolderContents(folderRef.fullPath);
        });
      })
      .catch((error) => {
        console.log("delete folder", error);
      });
  }

  getNewAssetRef(type) {
    const newAssetRef = this.database
      .ref("users/" + this.currentUID + "/" + type)
      .push();
    return newAssetRef;
  }

  storeAsset = (path, file) => {
    const storageRef = this.storage.ref();
    const name = file.assetName || file.name;
    const ref = storageRef.child(
      "users/" + this.currentUID + "/" + path + "/" + name
    );
    // imageRef.dbPath =  "users/" + this.currentUID + "/" + path;
    console.log(
      "storeAsset",
      "users/" + this.currentUID + "/" + path + "/" + name
    );
    return ref.put(file);
  };

  deleteFile(pathToFile, fileName) {
    const ref = this.storage.ref(pathToFile);
    const childRef = ref.child(fileName);
    childRef.delete();
  }

  deleteValue(path, key) {
    const ref = this.database.ref(path);
    console.log("deleteValue path", path, key);
    return ref.update({ [key]: null });
  }

  deleteAsset = (path, item) => {
    console.log("deleteAsset", path, item);
    return this.deleteFolderContents(path).then(() => {
      const dbRef = this.database.ref(path);
      return dbRef.remove();
    });
  };

  removeRef = (path) => {
    console.log("removeRef", path);
    let ref = this.database.ref(path);
    ref.remove();
  };

  storeGallery = (galleryData, id) => {
    let galleryRef;
    if (id) {
      galleryRef = this.database.ref("galleries/" + id);
      galleryRef.update(galleryData);
    } else {
      galleryRef = this.database.ref("galleries").push();
      galleryRef.set(galleryData);
    }
    return galleryRef;
  };

  pushAsset = (path) => {
    return this.database.ref(path).push();
  };

  getGalleryByName = async (name, callback) => {
    console.log("getGalleryByName", name);
    const galleryRef = this.database.ref("publicGalleries");
    const selected = galleryRef.orderByChild("nameEncoded").equalTo(name);
    selected.on("child_added", (snapshot) => {
      const returnedValues = snapshot.val();
      console.log("getGalleryByName returnedValues", returnedValues);
      const ref = app.database().ref(returnedValues.dataPath);
      ref.on("value", (snapshot) => {
        console.log("getGalleryByName snapshot data", snapshot.val());
        this.detachRefListener(selected);
        this.detachRefListener(ref);
        const refParts = returnedValues.dataPath.split("/");
        const owner = refParts[1];
        returnedValues.owner = owner;
        returnedValues.galleryKey = snapshot.key;
        callback(Object.assign(returnedValues, snapshot.val()));
      });
    });
  };

  detachRefListener(ref) {
    ref.off();
  }

  getPublicGalleryById = (id, callback) => {
    console.log("getPublicGalleryById", id);
    const galleryRef = this.database.ref("publicGalleries/" + id);
    galleryRef.on("value", (snapshot) => {
      const returnedValues = snapshot.val();
      const ref = app.database().ref(returnedValues.dataPath);

      ref.once("value", (snapshot) => {
        const refParts = returnedValues.dataPath.split("/");
        const owner = refParts[1];
        returnedValues.owner = owner;
        returnedValues.galleryKey = snapshot.key;
        callback(Object.assign(returnedValues, snapshot.val()));
      });
    });
  };

  getGalleryList = (callback) => {
    const galleryRef = app.database.ref("publicGalleries");
    galleryRef.orderByChild("name").on("value", callback);
    return galleryRef;
  };

  getGalleryEditList = (callback) => {
    const galleryRef = this.database.ref("galleries");
    galleryRef.orderByChild("name").on("value", callback); //need to add query by user
    console.log("getGalleryEditList");
    const galleryDescs = this.database.ref(
      "users/" + this.currentUID + "galleryDescs"
    );
    return galleryDescs;
  };

  removePlan = (key) => {
    this.database
      .ref("users/" + this.currentUID + "/floorplans")
      .child(key)
      .remove();
  };

  getUsersFloorplans = (callback) => {
    this.userFloorplansRef = this.database.ref(
      "users/" + this.currentUID + "/floorplans"
    );
    return this.userFloorplansRef.on("value", callback);
  };

  detachGetUsersFloorplans() {
    this.userFloorplansRef && this.userFloorplansRef.off();
  }
  getTiles = (refPath, callback) => {
    this.tilesRef = refPath;
    this.newArtRef = app.database().ref(refPath);
    this.newArtRef.on("value", callback);
    return this.newArtRef;
  };

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

  storeArt = (file) => {
    const storageRef = this.storage.ref();
    const path = file.assetType || "art";
    const imageRef = storageRef.child(
      "users/" + this.currentUID + "/" + path + "/" + file.name
    );
    file.uid = this.currentUID;

    return imageRef.put(file);
  };

  storeArtRef = (url, ref) => {
    const artData = {
      url: url,
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

  setLandingLoaded = () => {
    this.landingLoaded = true;
  };
  verifyPasswordResetCode = (actionCode) =>
    this.auth.verifyPasswordResetCode(actionCode);

  confirmPasswordReset = (actionCode, newPassword) =>
    this.auth.confirmPasswordReset(actionCode, newPassword);
}

export default Firebase;
