import app from "firebase";
import "firebase/database";
import "firebase/auth";

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

class Firebase {
  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();
    this.storage = app.storage();
    this.database = app.database();
    this.functions = app.functions()

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

  doCreateUserWithEmailAndPassword = ({ email, password }) =>
    this.auth
      .createUserWithEmailAndPassword(email, password)
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
      title: title,
      timestamp: timestamp
    });
    return newPostRef;
  };

  updateTitle = (path, title) => {
    const ref = this.database
      .ref("users/" + this.currentUID + "/" + path)
    return ref.update({ title: title })
  }

  updateAsset = (path, object) => {
    console.log("updateAsset", path, object)
    delete object.ref;
    const ref = this.database
      .ref(path)
    return ref.update(object)
  }

  assetPath = (type) => "users/" + this.currentUID + "/" + type + "/";

  deleteFolderContents(path) {
    const ref = this.storage.ref(path);
    return ref.listAll()
      .then(dir => {
        dir.items.forEach(fileRef => {
          console.log("deleteFile", fileRef.name)
          this.deleteFile(ref.fullPath, fileRef.name);
        });
        dir.prefixes.forEach(folderRef => {
          console.log("deleteFolderContents recursive", folderRef.fullPath)
          this.deleteFolderContents(folderRef.fullPath);
        })
      })
      .catch(error => {
        console.log("delete folder", error);
      });
  }

  getNewAssetRef(type) {
    const newAssetRef = this.database
      .ref("users/" + this.currentUID + "/" + type)
      .push();
    return newAssetRef
  }

  storeAsset = (path, file) => {
    const storageRef = this.storage.ref();
    const name = file.assetName || file.name;
    const ref = storageRef.child(
      "users/" + this.currentUID + "/" + path + "/" + name
    );
    // imageRef.dbPath =  "users/" + this.currentUID + "/" + path;
    console.log("storeAsset", "users/" + this.currentUID + "/" + path + "/" + name)
    return ref.put(file);
  }

  deleteFile(pathToFile, fileName) {
    const ref = this.storage.ref(pathToFile);
    const childRef = ref.child(fileName);
    childRef.delete()
  }

  deleteValue(path, key) {
    const ref = this.database.ref(path)
    console.log("deleteValue path", path, key)
    return ref.update({ [key]: null })
  }

  deleteAsset = (path, item) => {
    console.log("deleteAsset", path, item);
    return this.deleteFolderContents(path)
      .then(() => {
        const dbRef = this.database
          .ref(path)
        return dbRef.remove();
      });


  }

  removeRef = (path) => {
    console.log("removeRef", path)
    let ref = this.database.ref(path);
    ref.remove()
  }

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

  pushAsset = path => {
    return this.database.ref(path).push();
  }



  getGalleryByName = async (name, callback) => {
    console.log("getGalleryByName", name);
    const galleryRef = this.database.ref("publicGalleries");
    const selected = galleryRef.orderByChild("title").equalTo(name.replace("_", " "));
    selected.on("child_added", snapshot => {
      console.log("getGalleryByName then ", snapshot.val())
      const returnedValues = snapshot.val();
      console.log("getGalleryByName returnedValues", returnedValues)
      const ref = app.database().ref(returnedValues.dataPath);
      ref.on("value", (snapshot) => {
        console.log("getGalleryByName snapshot data", snapshot.val());
        this.detachRefListener(selected);
        this.detachRefListener(ref);

        callback(Object.assign(returnedValues, snapshot.val()))
      });
    })
  }

  detachRefListener(ref) {
    ref.off();
  }

  getGalleryById = id => {
    console.log("getGalleryById", id);
    const galleryRef = this.database.ref("galleries/" + id);
    return galleryRef;
  };

  getGalleryList = callback => {
    const galleryRef = app.database.ref("publicGalleries");
    galleryRef.orderByChild("name").on("value", callback);
    return galleryRef;
  };

  getGalleryEditList = callback => {
    const galleryRef = this.database.ref("galleries");
    galleryRef.orderByChild("name").on("value", callback); //need to add query by user
    console.log("getGalleryEditList");
    const galleryDescs = this.database.ref(
      "users/" + this.currentUID + "galleryDescs"
    );
    return galleryDescs
  };

  getList = ({ refPath, callback, orderField }) => {
    // const ref = this.database.ref(refPath);
    const ref = app.database().ref(refPath);
    ref.orderByChild(orderField).on("value", callback);
    return ref;
  }

  getAsset = ({ refPath, callback, once }) => {
    const ref = app.database().ref(refPath);
    if (once) {
      ref.once("value", callback);
    } else {
      ref.on("value", callback);
    }
    return ref;
  }

  removePlan = key => {
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
    this.userFloorplansRef.off();
  }
  getTiles = (refPath, callback) => {
    console.log("getTiles", refPath);
    this.tilesRef = refPath;
    this.newArtRef = app.database().ref(refPath);
    this.newArtRef.on("value", callback);
    console.log("this.newArtRef", this.newArtRef)
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

  storeArt = file => {
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
