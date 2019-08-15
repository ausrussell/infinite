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
  initListeners() {
    console.log("initListeners");
    window.addEventListener("dragenter", this.dragEnterHandler);
    document.body.addEventListener("dragleave", () => this.dragLeaveHandler());
    document.body.addEventListener("dragover", e => this.dragOverHandler(e));

    window.addEventListener("dragend", e => this.dragendHandler(e));
    window.addEventListener("drop", e => this.dropHandler(e));
  }
  dragOverHandler(e) {
    e.preventDefault();
    this.props.fileDragover(e);
  }
  dragendHandler(e) {
    e.preventDefault();

    debugger;
  }
  dropHandler(e) {
    e.preventDefault();

    var file = e.dataTransfer.files[0],
      reader = new FileReader();

    reader.onload = e => this.fileLoadedHandler(e, file);
    reader.readAsDataURL(file);

    return false;
  }
  dragLeaveHandler() {
    this.props.fileDragLeaveHandler();
  }

  fileLoadedHandler(e, file) {
    console.log(e.target);
    console.log(file);
    this.props.fileDrop(e.target.result);
    // Create a root reference

    //uncomment these to save image

    // this.props.firebase.storeArt(file);

    // const storageRef = this.props.firebase.storage().ref();
    // const imageRef = storageRef.child("art2/" + file.name);
    // imageRef.put(file).then(function(snapshot) {
    //   console.log("Uploaded a blob or file!");
    // });
  }

  dragEnterHandler() {
    console.log("dragEnterHandler");
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
