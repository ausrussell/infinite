import React, { useState, useEffect } from "react";
import { Input, Button, Form, Slider, Select, Row, Col, Divider, Checkbox, Card, Collapse, Modal } from "antd";
import GalleryEditDropdown from "../Gallery/GalleryEditDropdown";
import { withFirebase } from "../Firebase";
import GoogleApiWrapper from "../Landing/GoogleMap";


const { TextArea } = Input;
const { Meta } = Card;
const { Panel } = Collapse;

const MapModal = (props) => {
    const [center, setCenter] = useState({location:props.setCenter});
    useEffect(() => {
        const updateFields = () => {
            setCenter(props.setCenter)
        }
        updateFields(props)
    }, [props]);
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
        <GoogleApiWrapper modal={true} latLngCallBack={latLngCallBack} setCenter={center} />
    </Modal>)
}

const BuilderHeader = props => {
    console.log("BuilderHeader props", props)
    const [title, setTitle] = useState(props.title || "");
    const [id, setId] = useState("");
    const [imgUrl, setImgUrl] = useState("");
    const [imgTitle, setImgTitle] = useState("");
    const [galleryImg, setGalleryImg] = useState({});
    const [activeKey, setActiveKey] = useState(1)
    const [mapVisible, setMapVisible] = useState(null)
    const [location, setLocation] = useState(null)

    const [form] = Form.useForm();


    useEffect(() => {
        console.log("useEffect", props)
        const updateFields = () => {
            if (props.plannerGallery && id !== "") {
                let returnVal = props.firebase.pushAsset("users/" + props.firebase.currentUID + "/galleryDesc/")
                returnVal.then(snapshot => {
                    console.log("snapshot key", snapshot.key, id)
                    console.log("returnVal.key", returnVal.key);
                    setId(returnVal.key)
                })
            } else {
                form.resetFields();
                const { galleryDesc } = props;
                setTitle(galleryDesc.title);
                console.log("rops.galleryId", props.galleryId)
                setId(props.galleryId);
                setLocation(galleryDesc.location);
                console.log("reset location to ",galleryDesc.location)
                if (galleryDesc.galleryImg) {
                    setImgUrl(galleryDesc.galleryImg.url);
                    setImgTitle(galleryDesc.galleryImg.title);
                    setGalleryImg(galleryDesc.galleryImg)
                } else {
                    setImgUrl("");
                    setImgTitle("");
                    setGalleryImg({})
                }
                form.setFieldsValue(
                    galleryDesc
                    , [galleryDesc]);
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
    const onEditDropdownChangeHandler = (returnData) => {
        console.log("BuilderHeader onEditDropdownChangeHandler", returnData)//galleryDesc, galleryData, id

        props.onEditDropdownChangeHandler(returnData);
    }
    const selectArt = () => {
        props.setSelectingArt()
    }
    const processValuesAndSave = async (values) => {
        setGalleryImg.updateTime = new Date();
        delete galleryImg.ref;
        values.galleryImg = galleryImg;
        values.location = location || { lat: 36.80885384408701 + Math.random() * 2, lng: -123.27939428681641 + Math.random() * 2 };
        Object.keys(values).forEach(key => { values[key] = values[key] || null });

        const galleryData = props.saveGallery()
        values.nameEncoded = encodeURIComponent(
            values.title.replace(" ", "_")
        );
        const descPath = "users/" + props.firebase.currentUID + "/galleryDesc/" + id;
        const dbSave = props.firebase.updateAsset(descPath, values);
        await dbSave;
        const dataPath = "users/" + props.firebase.currentUID + "/galleryData/" + id;
        const dataSave = props.firebase.updateAsset(dataPath, galleryData);
        await dataSave;

        if (form.getFieldValue("public")) {
            const galleriesPath = "publicGalleries/" + id;
            const galleryData = {
                dataPath: dataPath
            }
            Object.assign(galleryData, values)
            props.firebase.updateAsset(galleriesPath, galleryData)
        }
        setTitle(values.title);
        setActiveKey(null);
    }
    const onFinish = async (values) => {
        processValuesAndSave(values)


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
                {(title || props.plannerGallery) && (<Collapse defaultActiveKey={['1']} style={{ marginBottom: 16 }}>
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
                            <Button type="primary" htmlType="submit">
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