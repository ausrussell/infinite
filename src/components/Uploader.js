import React, { Component, useState, useEffect } from "react";
// import { Form } from '@ant-design/compatible';
// import '@ant-design/compatible/assets/index.css';
import { Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { withFirebase } from "./Firebase";
import { Form, Upload, message } from "antd";
import moment from "moment";

const defaultArtValues = {
  uploadedTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
  license: 3,
  shareable: true,
};

export const UploadRapidButtonBase = ({ rapidBuild }) => {
  const onSuccess = (artItems) => {
    rapidBuild(artItems);
  };
  return (
    <UploaderTileBase onSuccess={onSuccess}>
      <Button>Auto Upload & Build</Button>
        <div><InboxOutlined style={{fontSize: '26px', marginTop: '8px'}} /></div>
        <div>Click or Drag</div>
    </UploaderTileBase>
  );
};

const UploaderTileBase = withFirebase((props) => {
  const [fileList, setFileList] = useState([]);
  const [artItems, setArtItems] = useState([]);
  const {onSuccess} = props
  useEffect(() => {
    if (
      fileList.length > 0 &&
      Object.values(fileList).filter((item) => item.status === "done")
        .length === fileList.length
    ) {
      if (onSuccess && artItems.length === fileList.length) {
        onSuccess(artItems);
        setFileList([]);
      }
    }
  }, [fileList, artItems, onSuccess]);

  const validateFile = (file, fileList) => {
    if (!props.validation) return true;
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG or PNG files!");
      return false;
    } else {
      return true;
    }
  };

  const customRequest = async ({ file, onProgress, onSuccess }) => {
    file.assetName = file.name;
    const assetRef = await props.firebase.getNewAssetRef("art");
    const path = "art/" + assetRef.key;
    const uploadTask = props.firebase.storeAsset(path, file);
    const next = (snapshot) => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes;
      onProgress({ percent: progress * 100 });
    };
    const complete = () => {
      uploadTask.then((snapshot) => {
        snapshot.ref.getDownloadURL().then((url) => {
          const pathAr = snapshot.ref.location.path.split("/");
          pathAr.pop();
          const dbPath = pathAr.join("/");
          const title = file.name.split(".");
          title.pop();
          title.join("");
          const options = {
            url: url,
            title: title,
            key: assetRef.key,
          };
          Object.assign(options, defaultArtValues);
          props.firebase.updateAsset(dbPath, options).then(() => {
            const newArtItems = artItems;
            newArtItems.push(options);
            setArtItems(newArtItems);
            onSuccess("Ok");
          });
        });
      });
    };
    uploadTask.on("state_changed", {
      next: next,
      complete: complete,
    });
  };
  const handleChange = (e) => {
    setFileList(e.fileList);
  };
  return (
    <Upload.Dragger
      multiple
      name="files"
      customRequest={customRequest}
      beforeUpload={validateFile}
      fileList={fileList}
      onChange={handleChange}
    >
      {props.children}
    </Upload.Dragger>
  );
});

const UploadButton = (props) => {
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFileName, setuploadFileName] = useState("");
  const [form] = Form.useForm();
  // debugger;
  const customRequest = ({ file, onProgress, onSuccess }) => {
    const uploadTask = props.changeHandler(file);
    const next = (snapshot) => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes;
      onProgress({ percent: progress * 100 });
    };

    const complete = () => {
      setuploadFileName(file.name);
      const uploadTitle = file.name.replace(".zip", "");
      form.setFieldsValue({
        UploadTitle: file.name.replace(".zip", ""),
      });
      onSuccess("Ok");
      setUploadTitle(uploadTitle);
    };

    uploadTask.on("state_changed", {
      next: next,
      complete: complete,
    });
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onFinish = () => {
    console.log("onFinish", uploadTitle);
    const dbSave = props.firebase.updateTitle(
      "cubebox/" + uploadFileName.replace(".", "_"),
      uploadTitle
    ); //obeying rules for path in cloud functions
    dbSave.then(() => {
      console.log("saved");
    });
  };
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
        <Form.Item
          name="dragger"
          valuePropName="files"
          getValueFromEvent={normFile}
        >
          <Upload.Dragger name="files" customRequest={customRequest} noStyle>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload.
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form.Item>
    </Form>
  );
};

class Uploader extends Component {
  state = {
    image: "",
    imageURL: "",
    progress: 0,
  };

  componentDidMount() {
    this.domElement = this.props.domElement || window;

    this.initListeners();
  }
  componentWillUnmount() {
    this.domElement.removeEventListener("dragenter", this.dragEnterHandler);
    this.domElement.removeEventListener("dragleave", this.dragLeaveHandler);
    this.domElement.removeEventListener("dragover", this.dragOverHandler);
    this.domElement.removeEventListener("dragend", this.dragendHandler);
    this.domElement.removeEventListener("drop", this.dropHandler);
  }
  initListeners() {
    this.domElement.addEventListener("dragenter", this.dragEnterHandler);
    this.domElement.addEventListener("dragleave", this.dragLeaveHandler);
    this.domElement.addEventListener("dragover", this.dragOverHandler);
    this.domElement.addEventListener("dragend", this.dragendHandler);
    this.domElement.addEventListener("drop", this.dropHandler);
  }

  dragEnterHandler() {
    // console.log("dragEnterHandler");
  }

  dragLeaveHandler = () => {
    this.props.fileDragLeaveHandler();
  };

  dragOverHandler = (e) => {
    e.preventDefault();
    this.props.fileDragover(e);
  };
  dragendHandler = (e) => {
    e.preventDefault();
  };

  validateFile(file) {
    if (!this.props.validation) return true;
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      this.props.fileDragLeaveHandler();
      message.error("You can only upload JPG or PNG files!");
      return false;
    } else {
      return true;
    }
  }

  dropHandler = (e) => {
    e.preventDefault();
    //TO DO: check for multiple uploads
    const file = e.dataTransfer.files[0];
    if (this.validateFile(file)) {
      const reader = new FileReader();
      // file.assetType = this.props.type;

      if (this.props.type === "cubebox") {
        this.fileUpload(file);
      } else {
        reader.onload = (e) => this.fileLoadedHandler(e, file);
        reader.readAsDataURL(file);
      }
    }
    return false;
  };

  fileUpload = (file) => {
    file.assetType = this.props.type;
    const uploadTask = this.props.firebase.storeArt(file);
    return uploadTask;
  };

  fileLoadedHandler = async (e, file) => {
    //uncomment these to save image
    const assetRef = await this.props.firebase.getNewAssetRef("art");
    const path = "art/" + assetRef.key;
    console.log("path to save", path);
    const uploadTask = this.props.firebase.storeAsset(path, file);
    this.props.fileDrop(e.target.result, uploadTask);
    uploadTask.then((snapshot) => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        const title = file.name.split(".");
        title.pop();
        const newTitle = title.join("");
        const options = {
          url: downloadURL,
          title: newTitle,
          key: assetRef.key,
        };
        Object.assign(options, defaultArtValues);
        this.props.firebase.updateAsset(
          "users/" + this.props.firebase.currentUID + "/" + path,
          options
        );
      });
    });
  };

  handleUploadStart = () => {
    this.setState({ progress: 0 });
  };
  handleUploadSuccess = (filename) => {
    this.setState({
      image: filename,
      progress: 100,
    });
  };

  uploadChangeHandler = (info) => {
    this.fileUpload(info.fileList[0]);
  };

  render() {
    const { button } = this.props;
    return (
      <div>
        {button && (
          <UploadButton
            changeHandler={this.fileUpload}
            firebase={this.props.firebase}
          />
        )}
      </div>
    );
  }
}
export default withFirebase(Uploader);
export const UploaderTile = withFirebase(UploaderTileBase);
export const UploadRapidButton = withFirebase(UploadRapidButtonBase);
