import React, { useState, useEffect } from "react";
import { Input, Button, Form, Slider, Select, Row, Col, Divider, Checkbox, Card, Collapse, Modal } from "antd";
import GalleryEditDropdown from "../Gallery/GalleryEditDropdown";
import { withFirebase } from "../Firebase";
import GoogleApiWrapper from "../Landing/GoogleMap";


const { TextArea } = Input;
const { Meta } = Card;
const { Panel } = Collapse;

const MapModal = (props) => {
    const latLngCallBack = (latLng) => {
        console.log("latLngCallBack", latLng);
        props.locationSet(latLng)
    }
    const handleOk = props.closeModal;
    return (<Modal
        title="Title"
        visible={props.mapVisible}
        width={"75vw"}
        bodyStyle={{ height: 500 }}
        onOk={handleOk}
    >

        <GoogleApiWrapper modal={true} latLngCallBack={latLngCallBack} setCenter={props.setCenter} />
    </Modal>)
}

const BuilderHeader = props => {
    console.log("BuilderHeader props", props)
    const [title, setTitle] = useState(props.title || "");
    const [id, setId] = useState(props.id || "");
    const [imgUrl, setImgUrl] = useState("");
    const [imgTitle, setImgTitle] = useState("");
    const [galleryImg, setGalleryImg] = useState({});
    const [activeKey, setActiveKey] = useState(1)
    const [mapVisible, setMapVisible] = useState(null)
    const [location, setLocation] = useState(null)

    const [form] = Form.useForm();


    useEffect(() => {
        const updateFields = () => {
            // setTitle(props.title);
            // setLocation(props.galleryDesc.location);
            if (props.galleryDesc.galleryImg) {
                setImgUrl(props.galleryDesc.galleryImg.url);
                setImgTitle(props.galleryDesc.galleryImg.title);
                setGalleryImg(props.galleryDesc.galleryImg)
            }
        }

        updateFields(props)
    }, [props]);


    const descCallback = (snapshot) => {
        console.log("descCallback values", snapshot.val())
        const values = snapshot.val();
        form.setFieldsValue(
            values
        );

    }
    const onEditDropdownChangeHandler = ({ galleryDesc, galleryData }) => {
        // console.log("BuilderHeader onEditDropdownChangeHandler", val, id)
        console.log("galleryDesc, galleryData", galleryDesc, galleryData)
        setLocation(galleryDesc.location);
        const id = Object.keys(galleryData)[0];
        setTitle(galleryDesc.title);
        setId(id);
        if (galleryDesc.galleryImg) {
            setImgUrl(galleryDesc.galleryImg.url);
            setImgTitle(galleryDesc.galleryImg.title);
            setGalleryImg(galleryDesc.galleryImg)
        }
        form.setFieldsValue(
            galleryDesc
            , [galleryDesc]);
        props.onEditDropdownChangeHandler(Object.values(galleryData)[0], Object.keys(galleryData)[0]);
    }
    const selectArt = () => {
        props.setSelectingArt()
    }
    const onFinish = async (values) => {
        Object.keys(values).forEach(key => { values[key] = values[key] || null });
        setGalleryImg.updateTime = new Date();
        console.log("props.galleryDesc.galleryImg", props.galleryDesc.galleryImg);
        delete galleryImg.ref;
        values.galleryImg = galleryImg;
        values.location = location;
        const galleryData = props.saveGallery()
        values.nameEncoded= encodeURIComponent(
            values.title.replace(" ", "_")
          );

        const path = "users/" + props.firebase.currentUID + "/galleryDesc/" + id;
        const dbSave = props.firebase.updateAsset(path, values);

        await dbSave;
        const descPath = "users/" + props.firebase.currentUID + "/galleryData/" + id;
        const descPathSave = props.firebase.updateAsset(descPath, galleryData);
        await descPathSave;

        if (form.getFieldValue("public")) {
            const galleriesPath = "publicGalleries/" + id;
            const galleryData = {
                dataPath: path
            }
            Object.assign(galleryData, values)
            props.firebase.updateAsset(galleriesPath, galleryData)
        }
        setTitle(values.title);
        setActiveKey(null);

    }
    const showMapModal = () => {
        setMapVisible(true)
    }

    const closeModal = () => {
        console.log("closeModal")
        setMapVisible(null)
    }

    return (
        <div className="page-header-area">
            <h2>{title}</h2>
            <Form
                layout="vertical"
                // name="uploadForm"
                name="gallery-editor"
                form={form}
                onFinish={onFinish}
            >
                {title && (<Collapse defaultActiveKey={['1']} style={{ marginBottom: 16 }}>
                    <Panel header="Add/Edit Gallery details" key="1">
                        <Row gutter={8}>
                            <Col span={8}>
                                <Form.Item
                                    label="Gallery Title"
                                    name="title"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="Title" />
                                </Form.Item>
                                <Form.Item
                                    name="public"

                                    valuePropName="checked"
                                >
                                    <Checkbox checked={true}>Public</Checkbox>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" onClick={showMapModal}>
                                        Position on Map
                                    </Button>
                                    <MapModal mapVisible={mapVisible} locationSet={setLocation} closeModal={closeModal} setCenter={location} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Gallery description"
                                    name="description"
                                >
                                    <TextArea rows={4} />
                                </Form.Item>

                            </Col>
                            <Col span={8}>
                                {imgUrl && (<Card style={{ margin: 'auto', marginBottom: 16, width: 200 }}
                                    title="Gallery image"
                                    cover={<img alt="gallery image" src={imgUrl} />}
                                >
                                    <Meta description={imgTitle} />
                                </Card>)}

                                <Button style={{ margin: 'auto' }} onClick={selectArt} loading={props.selectingArt} >{props.selectingArt ? "Cancel" : "Select Image"}</Button>
                                <div>by clicking art in vault</div>
                            </Col>
                        </Row>
                    </Panel>
                </Collapse>)}
                <Row>
                    <Col span={8}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" disabled={!title}>
                                Save
                            </Button>
                        </Form.Item>
                    </Col>
                    <Col span={8}>


                    </Col>

                    <Col span={8}>
                        <GalleryEditDropdown
                            callback={onEditDropdownChangeHandler}
                        />

                    </Col>
                </Row>

            </Form>
        </div>

    )
}

export default withFirebase(BuilderHeader);