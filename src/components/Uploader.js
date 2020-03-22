import React, { Component, useState } from "react";
import { Form, Upload, message, Button, Input, Select } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';

// import FileUploader from "react-firebase-file-uploader";
// import firebase from "./Firebase";
// import config from "../api/firebase-config";
// firebase.initializeApp(config);
import { withFirebase } from "./Firebase";




// import { Form, Input, Button, Select } from 'antd';

const { Option } = Select;
const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};



const UploadButton = (props) => {
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFileName, setuploadFileName] = useState("");
  const [form] = Form.useForm();
  // debugger;
  const customRequest = ({ file, onSuccess }) => {
    console.log("dummyRequest file", file);
    const uploadTask = props.changeHandler(file);
    console.log("uploadTask", uploadTask);
    const next = snapshot => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = snapshot.bytesTransferred / snapshot.totalBytes;
      // if (this.artMesh) this.show(progress);
      console.log("Upload is " + progress * 100 + "% done");
      // console.log("snapshot", snapshot.ref);
    };

    const complete = () => completeHandler(file, onSuccess)
    uploadTask.on("state_changed", {
      next: next,
      complete: complete
    });

  };

  const completeHandler = (file, onSuccess) => {
    setuploadFileName(file.name);
    // form.setFieldsValue({
    //   uploadTitle: file.name
    // });
    onSuccess("ok");
  }

  const onTitleChangeHandler = ({ target }) => {
    setUploadTitle(target.value);
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  return (
    <Form
      {...layout}
      // name="uploadForm"
      name="control-hooks"
      form={form}
    >
      <Form.Item label="Dragger">
        <Form.Item name="dragger">
          <Upload.Dragger name="files" customRequest={customRequest}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">Support for a single or bulk upload.</p>
          </Upload.Dragger>
        </Form.Item>
      </Form.Item>

      <Form.Item
        label="Upload Title"
        name="UploadTitle"
      >
        <Input placeholder="Cube Box Title" name="uploadTitle" onChange={onTitleChangeHandler} disabled={!uploadFileName} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}

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
    const file = e.dataTransfer.files[0],
      reader = new FileReader();
    // file.assetType = this.props.type;

    if (this.props.type === "cubebox") {
      this.fileUpload(file);
    }
    else {
      reader.onload = e => this.fileLoadedHandler(e, file);
      reader.readAsDataURL(file);
    }

    return false;
  };

  fileUpload = (file) => {
    file.assetType = this.props.type;
    const uploadTask = this.props.firebase.storeArt(file);
    return uploadTask;
  }

  uploadCubeBox(file) {
    console.log("uploadCubeBox file", file);
    const uploadTask = this.props.firebase.storeArt(file);
  }

  fileLoadedHandler(e, file) {
    //uncomment these to save image
    // debugger;
    console.log("fileLoadedHandler type", this.props.type)
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
  };

  uploadChangeHandler = (info) => {
    console.log("uploadClickHandler", info);
    // const file = e.target.files[0];
    this.fileUpload(info.fileList[0]);
  }

  render() {
    console.log(this.state);

    const { button } = this.props;
    return (
      <UploadButton changeHandler={this.fileUpload} />
    );
  }
}

export default withFirebase(Uploader);
