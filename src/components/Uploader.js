import React, { Component } from "react";
// import FileUploader from "react-firebase-file-uploader";
// import firebase from "./Firebase";
// import config from "../api/firebase-config";
// firebase.initializeApp(config);
import { withFirebase } from "./Firebase";

class Uploader extends Component {
  state = {
    image: "",
    imageURL: "",
    progress: 0,
    wallDroppedOn: {}
  };
  constructor(props) {
    super(props);
    console.log("uploader props", props);
  }

  componentDidMount() {
    this.initListeners();
  }
  componentWillUnmount() {
    window.removeEventListener("dragenter", this.dragEnterHandler);
    document.body.removeEventListener("dragleave", this.dragLeaveHandler);
    document.body.removeEventListener("dragover", this.dragOverHandler);
    window.removeEventListener("dragend", this.dragendHandler);
    window.removeEventListener("drop", this.dropHandler);
  }
  initListeners() {
    window.addEventListener("dragenter", this.dragEnterHandler);
    document.body.addEventListener("dragleave", this.dragLeaveHandler);
    document.body.addEventListener("dragover", this.dragOverHandler);
    window.addEventListener("dragend", this.dragendHandler);
    window.addEventListener("drop", this.dropHandler);
  }

  dragEnterHandler() {
    console.log("dragEnterHandler");
  }

  dragLeaveHandler = () => {
    this.props.fileDragLeaveHandler();
  };

  dragOverHandler = e => {
    e.preventDefault();
    this.props.fileDragover(e);
  };
  dragendHandler = e => {
    e.preventDefault();
  };
  dropHandler = e => {
    e.preventDefault();
    //TO DO: check for multiple uploads
    var file = e.dataTransfer.files[0],
      reader = new FileReader();
    reader.onload = e => this.fileLoadedHandler(e, file);
    reader.readAsDataURL(file);
    return false;
  };

  fileLoadedHandler(e, file) {
    //uncomment these to save image
    const uploadTask = this.props.firebase.storeArt(file);

    console.log("uploader fileLoadedHandler uploadTask", uploadTask);
    this.props.fileDrop(e.target.result, uploadTask);
    uploadTask.then(snapshot => {
      console.log("uploaded file", snapshot);
      uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
        console.log("File available at", downloadURL);
        this.props.firebase
          .storeArtRef(downloadURL, uploadTask.snapshot.ref)
          .then(snapshot => {
            console.log("done pushing art", snapshot);
          });
      });
    });
    // const storageRef = this.props.firebase.storage().ref();
    // const imageRef = storageRef.child("art2/" + file.name);
    // imageRef.put(file).then(function(snapshot) {
    //   console.log("Uploaded a blob or file!");
    // });
  }

  handleUploadStart = () => {
    this.setState({ progress: 0 });
  };
  handleUploadSuccess = filename => {
    this.setState({
      image: filename,
      progress: 100
    });
    console.log("uploaded", filename);
    // firebase
    //   .storage()
    //   .ref("art")
    //   .child(filename)
    //   .getDownloadURL()
    //   .then(url => this.setState({ imageURL: url }));
  };

  render() {
    console.log(this.state);
    return <div />;
  }
}

export default withFirebase(Uploader);
