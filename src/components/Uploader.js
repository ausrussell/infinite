import React, { Component, useState } from "react";
// import { Form } from '@ant-design/compatible';
// import '@ant-design/compatible/assets/index.css';
// import { Upload, message, Button, Input, Select } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { withFirebase } from "./Firebase";
import { Form, Upload, message } from 'antd';

const UploaderTileBase = (props) => {

  const customRequest = async ({ file, onProgress, onSuccess }) => {
    file.assetName = file.name;
    const assetRef = await props.firebase.getNewAssetRef("art");
    const path = "art/" + assetRef.key;
    const uploadTask = props.firebase.storeAsset(path, file)
    console.log("customRequest uploadTask", uploadTask)
    const next = snapshot => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes;
      onProgress({ percent: progress * 100 });
    };
    const complete = () => {
      uploadTask.then((snapshot) => {
        snapshot.ref.getDownloadURL().then(url => {
          const pathAr = snapshot.ref.location.path.split("/");
          pathAr.pop();
          const dbPath = pathAr.join("/");
          const title = file.name.split(".");
          title.pop()
          title.join("");
          const options = {
            url: url,
            title: title
          };
          props.firebase.updateAsset(dbPath, options)
            .then(() => {
              console.log("db saved uploaded", dbPath, options);
              onSuccess("Ok");
            })
        })
      })
    }
    uploadTask.on("state_changed", {
      next: next,
      complete: complete
    });
  };
  return (<Upload.Dragger multiple name="files" customRequest={customRequest} >
    <InboxOutlined style={{ fontSize: 26 }} />
    <p className="ant-upload-text">Upload art</p>
  </Upload.Dragger>)
}

const UploadButton = (props) => {
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFileName, setuploadFileName] = useState("");
  const [form] = Form.useForm();
  // debugger;
  const customRequest = ({ file, onProgress, onSuccess }) => {
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

  const onFinish = () => {
    console.log("onFinish", uploadTitle);
    const dbSave = props.firebase.updateTitle("cubebox/" + uploadFileName.replace('.', '_'), uploadTitle);//obeying rules for path in cloud functions
    dbSave.then(() => {
      console.log("saved")
    })
  }
  //disabled={!uploadFileName}

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
    progress: 0
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

  validateFile(file) {
    debugger;
    if (!this.props.validation) return true;
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      this.props.fileDragLeaveHandler();
      message.error('You can only upload JPG or PNG files!');
      return false
    } else {
      return true;
    }
  }

  dropHandler = e => {
    e.preventDefault();
    //TO DO: check for multiple uploads
    const file = e.dataTransfer.files[0];
    if (this.validateFile(file)) {
      const reader = new FileReader();
      // file.assetType = this.props.type;

      if (this.props.type === "cubebox") {
        this.fileUpload(file);
      }
      else {
        reader.onload = e => this.fileLoadedHandler(e, file);
        reader.readAsDataURL(file);
      }
    }

    return false;
  };

  fileUpload = (file) => {
    file.assetType = this.props.type;
    const uploadTask = this.props.firebase.storeArt(file);
    return uploadTask;
  }

  fileLoadedHandler = async (e, file) => {
    //uncomment these to save image
    const assetRef = await this.props.firebase.getNewAssetRef("art");
    const path = "art/" + assetRef.key;
    console.log("path to save", path)
    const uploadTask = this.props.firebase.storeAsset(path, file)
    this.props.fileDrop(e.target.result, uploadTask);
    uploadTask.then(snapshot => {
      console.log("uploaded file", snapshot);
      uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
        const object = { url: downloadURL }
        this.props.firebase.updateAsset("users/" + this.props.firebase.currentUID + "/" + path, object)
      })
    })
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
    console.log("uploader button", button)
    return (<div>
      {button && (
        <UploadButton changeHandler={this.fileUpload} firebase={this.props.firebase} />)
      }
    </div>
    );
  }
}
export default withFirebase(Uploader);
export const UploaderTile = withFirebase(UploaderTileBase)
