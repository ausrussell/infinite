import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Form,
  Row,
  Col,
  Checkbox,
  Card,
  Modal,
  Menu,
  Alert,
} from "antd";
import { ArrowRightOutlined, EnvironmentOutlined } from "@ant-design/icons";
import GoogleApiWrapper from "../Landing/GoogleMap";
import { Route } from "react-router-dom";

import ImageSelector from "./ImageSelector";

const { TextArea } = Input;
const { Meta } = Card;
const galleryPlaceholder =
  "https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Fhanger_placeholder.png?alt=media&token=4f847f15-48d6-43d9-92df-80eea32394f5";

const DetailsDropdown = ({ id, galleryDesc, floorplan }) => {
  const [visitable, setVisitable] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [imgTitle, setImgTitle] = useState("");
  const [galleryImg, setGalleryImg] = useState({});
  const [location, setLocation] = useState(null);
  const [nameEncoded, setNameEncoded] = useState(null);
  const [locationAlert, setLocationAlert] = useState(false);
  const [fields, setFields] = useState([]);

  const [form] = Form.useForm();
  useEffect(() => {
    const updateFields = () => {
      form.resetFields();
      form.setFieldsValue(galleryDesc, [galleryDesc]);
      setGalleryImg(form.getFieldValue("galleryImg"));
      setLocation(form.getFieldValue("location"));
    };
    console.log("galleryDesc", galleryDesc);
    updateFields();
  }, [id]);

  useEffect(() => {
    console.log("set new galleryImg", galleryImg);
    setImgUrl(galleryImg?.thumb || galleryImg?.url || galleryPlaceholder);
    setImgTitle(galleryImg?.title || "Featured Gallery Image");
    form.setFieldsValue({ galleryImg });
  }, [galleryImg?.url]);

  useEffect(() => {
    console.log("location effect", location);
    setLocationAlert(
      location === null && form.getFieldValue("public") === true
    );
  }, [location]);

  const handleMenuClick = (e) => {
    if (e.key === "3") {
      //   setVisible(true);
    }
  };

  const publicChange = ({ target }) => {
    setLocationAlert(target.checked && !location);
    setVisitable(target.checked && location && nameEncoded);
  };

  const setLocationCallback = (data) => {
    setLocation(data);
    setLocationAlert(false);
  };

  const getPublicUrl = () => {
    if (nameEncoded || galleryDesc.nameEncoded) {
      return `${process.env.REACT_APP_GALLERY_URL}
         ${nameEncoded || galleryDesc.nameEncoded}`;
    }
  };
  const alertProps = {
    message: "You need to set a location for public galleries",
    type: "warning",
    showIcon: true,
    closable: true,
  };

  return (
    <Menu
      onClick={handleMenuClick}
      mode="horizontal"
      style={{ paddingTop: "16px" }}
    >
      <Menu.Item key="1">
        <Form name="galleryEditor" form={form}>
          <Row gutter={16} style={{ width: "50vw" }}>
            <Col xs={24} sm={16}>
              <Form.Item label="Name" name="title" rules={[{ required: true }]}>
                <Input placeholder="Title" />
              </Form.Item>
              <Form.Item name="public" valuePropName="checked">
                <Checkbox checked={true} onChange={publicChange}>
                  Public
                </Checkbox>
              </Form.Item>

              <Form.Item name="location" onChange={setLocationCallback}>
                <MapModal />
              </Form.Item>
              {location && location.toString()}xx
              {!location && <p>Location not set</p>}
              {locationAlert && <Alert {...alertProps} />}
              <Form.Item label="Gallery description" name="description">
                <TextArea rows={4} />
              </Form.Item>
              <p>
                {`Building on floorplan: `}
                <span style={{ color: "#333" }}>{floorplan.title}</span>
              </p>
              {visitable && (
                <div>
                  <p>Public url: {getPublicUrl()}</p>
                  <VisitButton
                    disabled={!(id && visitable)}
                    pathname={
                      "/Gallery/" + nameEncoded || galleryDesc.nameEncoded
                    }
                  />
                </div>
              )}
            </Col>
            <Col xs={24} sm={8} style={{ textAlign: "center" }}>
              <div>
                <Card
                  title="Featured image"
                  bodyStyle={{ background: "#fafafa" }}
                  headStyle={{ background: "#fafafa" }}
                  cover={
                    <img
                      alt="featured"
                      src={imgUrl}
                      style={{ padding: 8, background: "#fafafa" }}
                    />
                  }
                  actions={[
                    <Form.Item name="galleryImg">
                      <ImageSelector setGalleryImg={setGalleryImg} />
                    </Form.Item>,
                  ]}
                >
                  <Meta description={imgTitle} />
                </Card>
              </div>
            </Col>
          </Row>
        </Form>
      </Menu.Item>
    </Menu>
  );
};

const MapModal = ({ value = null, onChange }) => {
  const [visible, setVisible] = useState();

  const draggedCallback = (draggedLatLng) => {
    onChange(draggedLatLng);
  };

  const handleOk = () => {
    if (!value) {
      Modal.warning({
        title: "You need to move the marker to set location ",
        zIndex: 1200,
      });
    } else {
      onChange(value);
      setVisible(false);
    }
  };

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        <EnvironmentOutlined />
        Set location on Map
      </Button>
      <Modal
        title="Position your gallery"
        visible={visible}
        width={"75vw"}
        bodyStyle={{ height: 530 }}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        zIndex={1100}
      >
        <GoogleApiWrapper
          modal={true}
          latLngCallBack={draggedCallback}
          setCenter={value}
        />
      </Modal>
    </>
  );
};

const VisitButton = ({ disabled, pathname }) => {
  const onVisitHandler = (routeProps) => {
    const { history } = routeProps;
    history.push({ pathname: pathname });
  };
  return (
    <Route
      path="/"
      render={(routeProps) => {
        return (
          <Button
            disabled={disabled}
            onClick={() => onVisitHandler(routeProps)}
          >
            Visit
            <ArrowRightOutlined key="list-vertical-star-o" />
          </Button>
        );
      }}
    />
  );
};

export default DetailsDropdown;
