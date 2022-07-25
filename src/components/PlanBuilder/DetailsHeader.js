import React, { useState } from "react";

import { Button, Row, Col, Modal, Form, message, Dropdown } from "antd";
import { ExclamationCircleOutlined, DownOutlined } from "@ant-design/icons";

// import DetailsDropdown from "./DetailsDropdown";
import { withFirebase } from "../Firebase";
import { compose } from "recompose";
import DetailsDropdown from "./DetailsDropdown";

// import ListSortDemo from "./ListSortDemo";
const { confirm } = Modal;

const DetailsDropdownForm = (props) => {
  // console.log("DetailsDropdownForm props", props);
  const { id, galleryDesc, firebase, saveGallery, closeGallery } = props;
  // const [form] = Form.useForm();
  const [visible, setVisible] = useState(true);

  const onFinish = (values) => {
    console.log("Finish:", values);
  };

  const checkForChanges = (data, callback) => {
    // const values = form.getFieldsValue();
    // //console.log("Values", values)
    // const { desc, galleryData } = processValues(values);
    // const galleryDataToTest = galleryData;
    // if (galleryDataToTest.art) delete galleryDataToTest.art; //??
    // const dataIsChanged =
    //   currentExportData &&
    //   JSON.stringify(galleryDataToTest) !== JSON.stringify(currentExportData);
    // let desctest = desc;
    // let currentGalleryDescTest = currentGalleryDesc;
    // if (!currentGalleryDesc.location) delete desctest.location;
    // desctest = removeEmptyObjects(desctest); //??
    // currentGalleryDescTest = removeEmptyObjects(currentGalleryDescTest); //??
    // // if (desctest.art) delete desctest.art; //don;t test for art because mightn't have been added in initial galleries
    // if (currentGalleryDescTest.art) delete currentGalleryDescTest.art;
    // const descIsChanged = desc && !isEqual(currentGalleryDescTest, desctest);
    // //console.log("descIsChanged, currentGalleryDesc, desctest", descIsChanged, currentGalleryDescTest, desctest);
    // if (dataIsChanged || descIsChanged) {
    //   Modal.confirm({
    //     title: "Do you want to save changes to this gallery?",
    //     content: "Some descriptions",
    //     okText: "Yes",
    //     cancelType: "danger",
    //     cancelText: "Discard changes",
    //     onOk() {
    //       //console.log('OK');
    //       form
    //         .validateFields()
    //         .then((values) => {
    //           saveProcessedValues(desc, galleryData);
    //           callback(data);
    //         })
    //         .catch((errorInfo) => {
    //           setDetailsOpen(true);
    //         });
    //     },
    //     onCancel() {
    //       callback(data);
    //     },
    //   });
    // } else {
    //   callback(data);
    // }
  };

  const onFinishFailed = () => {
    // setDetailsOpen(true);
  };

  // const closeGallery = () => {
  //   onEditDropdownChangeHandler({ id: null });
  // };

  const deleteGallery = () => {
    confirm({
      title: "Are you sure want to delete this gallery?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        doDelete();
      },
      onCancel() {
        //console.log('Cancel');
      },
    });
  };
  const doDelete = async () => {
    // const uidToSaveTo =
    //   firebase.isCurator && curatorsUID ? curatorsUID : firebase.currentUID;
    // const dataPath = "users/" + uidToSaveTo + "/galleryData/" + id;
    // const dataRemove = firebase.removeRef(dataPath);
    // await dataRemove;
    // const descPath = "users/" + uidToSaveTo + "/galleryDesc/" + id;
    // const descRemove = firebase.removeRef(descPath);
    // await descRemove;
    // if (currentGalleryDesc.public) {
    //   const galleriesPath = "publicGalleries/" + id;
    //   const descRemove = firebase.removeRef(galleriesPath);
    //   await descRemove;
    // }
    // onEditDropdownChangeHandler({ id: null });
    // message.success(
    //   "Successfully deleted Gallery: " + currentGalleryDesc.title
    // );
  };

  const saveProcessedValues = async (descValues) => {
    console.log("saveProcessedValues values", descValues);

    // const uidToSaveTo = firebase.isCurator && curatorsUID ? curatorsUID : firebase.currentUID;
    const uidToSaveTo = firebase.currentUID;
    const galleryData = saveGallery();
    if (galleryData.art) {
      descValues.art = galleryData.art;
    } //puts art keys in description and data
    if (galleryData.borrowedArt) {
      descValues.borrowedArt = galleryData.borrowedArt;
    }

    const dataPath = "users/" + uidToSaveTo + "/galleryData/" + id;
    descValues.dataPath = dataPath;
    const dataSave = firebase.updateAsset(dataPath, galleryData);
    await dataSave;
    const descPath = "users/" + uidToSaveTo + "/galleryDesc/" + id;
    const dbSave = firebase.updateAsset(descPath, descValues);
    await dbSave;

    const galleriesPath = "publicGalleries/" + id;

    if (descValues.public) {
      firebase.updateAsset(galleriesPath, descValues);
    } else {
      firebase.removeRef(galleriesPath);
    }
    message.success("Successfully saved Gallery: " + descValues.title);
  };

  const processValues = (values) => {
    Object.keys(values).forEach((key) => {
      values[key] = values[key] || null;
    });
    values.nameEncoded = encodeURIComponent(values.title.replace(/\s/g, "_"));
    return values;
  };

  const onFormFinish = (name, { values, forms }) => {
    console.log("forms", forms);
    const galleryEditorValues = forms.galleryEditor.getFieldsValue();
    console.log("galleryEditorValues", galleryEditorValues);
    const processedVaules = processValues(galleryEditorValues);
    saveProcessedValues(processedVaules);
  };

  // const closeGalleryHandler = () => {};
  console.log("details id", id);
  return (
    id && (
      <Form.Provider onFormFinish={onFormFinish}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Dropdown
              overlay={<DetailsDropdown {...props} />}
              onVisibleChange={(flag) => setVisible(flag)}
              visible={visible}
              trigger={["click"]}
            >
              <Button
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                Gallery Details <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
          <Col span={12} style={{}}>
            <Form
              name="basicForm"
              onFinish={onFinish}
              className="right-justified-button-tail"
            >
              <Form.Item>
                <Button onClick={deleteGallery}>Delete</Button>
              </Form.Item>
              <Form.Item>
                <Button onClick={closeGallery}>Close</Button>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Form.Provider>
    )
  );
};

// export {DetailsDropdownForm};
export default compose(withFirebase)(DetailsDropdownForm);
