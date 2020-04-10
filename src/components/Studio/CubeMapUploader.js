import React, { useState, useEffect } from "react";
import { Input, Checkbox, Upload, Button, Form, Slider, Select, Row, Col, Divider } from "antd";
import { InboxOutlined } from '@ant-design/icons';


const CubeMapUploader = (props) => {
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
  
    const onFinish = ()=> {
      console.log("onFinish",uploadTitle);
      const dbSave = props.firebase.updateTitle("cubebox/" + uploadFileName.replace('.', '_'),uploadTitle);//obeying rules for path in cloud functions
      dbSave.then(()=> {
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

  export default CubeMapUploader;