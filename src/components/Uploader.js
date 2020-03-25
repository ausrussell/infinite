import React, { Component, useState } from "react";
// import { Form } from '@ant-design/compatible';
// import '@ant-design/compatible/assets/index.css';
// import { Upload, message, Button, Input, Select } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';

// import FileUploader from "react-firebase-file-uploader";
// import firebase from "./Firebase";
// import config from "../api/firebase-config";
// firebase.initializeApp(config);
import { withFirebase } from "./Firebase";




import { Form, Upload, Input, Button, Select } from 'antd';

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
  const customRequest = ({ file, onProgress, onSuccess }) => {
    console.log("dummyRequest file", file);
    const uploadTask = props.changeHandler(file);
    console.log("uploadTask", uploadTask);
    const next = snapshot => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes;
      onProgress({ percent: progress * 100 });
    };

    const complete = () => {
      console.log("complete");
      setuploadFileName(file.name)
      const uploadTitle = file.name.replace(".zip", "")
      form.setFieldsValue({
        UploadTitle: file.name.replace(".zip", "")
      });
      onSuccess("Ok");
      setUploadTitle(uploadTitle);
    }

    uploadTask.on("state_changed", {
      next: next,
      complete: complete
    });
  };

  const onTitleChangeHandler = ({ target }) => {
    setUploadTitle(target.value);
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const normFile = e => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onFinish = ()=> {
    console.log("onFinish",uploadTitle);
    const dbSave = props.firebase.updateTitle("cubebox/" + uploadFileName.replace('.', '_'),uploadTitle);//obeying rules for path in cloud functions
    dbSave.then(()=> {
      console.log("saved")
    })
  }
  //disabled={!uploadFileName}
//   <Form.Item
//   label="Upload Title"
//   name="UploadTitle"
// >
//   <Input placeholder="Cube Map Title" onChange={onTitleChangeHandler} disabled={!uploadTitle} />
// </Form.Item>
// <Form.Item>
//   <Button type="primary" htmlType="submit" disabled={!uploadTitle}>
//     Submit
//   </Button>
// </Form.Item>
  return (
    <Form
      {...layout}
      // name="uploadForm"
      name="upload-dragger"
      form={form}
      onFinish={onFinish}
    >
      <Form.Item label="Dragger">
        <Form.Item name="dragger" valuePropName="files" getValueFromEvent={normFile}>
          <Upload.Dragger name="files" customRequest={customRequest} noStyle>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">Support for a single or bulk upload.</p>
          </Upload.Dragger>
        </Form.Item>
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
    console.log("uploader button",button)
    return (<div>
      {button && (
        <UploadButton changeHandler={this.fileUpload} firebase={this.props.firebase}/>)
      }
      </div>
    );
  }
}

export default withFirebase(Uploader);
