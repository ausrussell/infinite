import React, { useState, useEffect } from "react";
import { Input, Button, Form, Row, Col, Checkbox, Card, Collapse, Modal, message } from "antd";
import GalleryEditDropdown from "../Gallery/GalleryEditDropdown";
import { withFirebase } from "../Firebase";
import GoogleApiWrapper from "../Landing/GoogleMap";
import PageTitle from '../Navigation/PageTitle';
import { Route } from "react-router-dom";
import { ArrowRightOutlined } from '@ant-design/icons';
import { BuilderHelp } from './BuilderHelp'
import FloorplanDropdown from '../Planner/FloorplanDropdown';

const { TextArea } = Input;
const { Meta } = Card;
const { Panel } = Collapse;

const MapModal = ({ setCenter, locationSet }) => {
    // const [center, setCenter] = useState({ location: props.setCenter });
    const [visible, setVisible] = useState();
    const [latLng, setLatLng] = useState()

    const hideModal = () => {
        setVisible(false)
    }

    const showMapModal = () => {
        setVisible(true)
    }

    const draggedCallback = (draggedLatLng) => {
        setLatLng(draggedLatLng);
    }

    const handleOk = () => {
        locationSet(latLng)
        hideModal()
    };

    return (<div><Button type="primary" onClick={showMapModal}>
        Position on Map
        </Button><Modal
            title="Position your gallery"
            visible={visible}
            width={"75vw"}
            bodyStyle={{ height: 530 }}
            onOk={handleOk}
            onCancel={hideModal}
        >
            <GoogleApiWrapper modal={true} latLngCallBack={draggedCallback} setCenter={setCenter} />
        </Modal>
    </div>)
}

const BuilderHeader = ({ firebase, galleryDesc, galleryId, onEditDropdownChangeHandler, plannerGallery, saveGallery, selectingArt, setSelectingArt, floorplan, floorplanSelectedHandler }) => {
    // console.log("BuilderHeader props", props)
    const [title, setTitle] = useState(galleryDesc.title || "");
    const [id, setId] = useState("");
    const [visitable, setVisitable] = useState(false);
    const [imgUrl, setImgUrl] = useState("");
    const [imgTitle, setImgTitle] = useState("");
    const [galleryImg, setGalleryImg] = useState({});
    const [location, setLocation] = useState(null)
    const [nameEncoded, setNameEncoded] = useState(null);
    const [form] = Form.useForm();


    useEffect(() => {
        console.log("BuilderHeader useEffect")
        const updateFields = () => {
            // if (plannerGallery && id !== "") {
            //     let returnVal = firebase.pushAsset("users/" + firebase.currentUID + "/galleryDesc/")
            //     returnVal.then(() => {
            //         setId(returnVal.key)
            //     })
            // } else {
            form.resetFields();
            setTitle(galleryDesc.title);
            setId(galleryId);
            setLocation(galleryDesc.location);
            setNameEncoded(galleryDesc.nameEncoded)
            setVisitable(galleryDesc.public);
            if (galleryDesc.galleryImg) {
                setImgUrl(galleryDesc.galleryImg.thumb || galleryDesc.galleryImg.url);
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
        // }

        updateFields()
    }, [galleryDesc, galleryId, id, form, firebase, galleryDesc.galleryImg]);

    // const onEditDropdownChangeHandler = (returnData) => {
    //     console.log("BuilderHeader onEditDropdownChangeHandler", returnData)//galleryDesc, galleryData, id
    //     props.onEditDropdownChangeHandler(returnData);
    // }
    const selectArt = () => {
        setSelectingArt()
    }
    const processValuesAndSave = async (values) => {
        setGalleryImg.updateTime = new Date();
        delete galleryImg.ref;
        values.galleryImg = galleryImg;
        values.location = location || { lat: 36.80885384408701 + Math.random() * 2, lng: -123.27939428681641 + Math.random() * 2 };
        Object.keys(values).forEach(key => { values[key] = values[key] || null });

        const galleryData = saveGallery();
        console.log("processValuesAndSave galleryData", galleryData);
        const nameEncode = encodeURIComponent(
            values.title.replace(" ", "_")
        );
        values.nameEncoded = nameEncode;
        setNameEncoded(nameEncode);
        setVisitable(form.getFieldValue("public"));

        const dataPath = "users/" + firebase.currentUID + "/galleryData/" + id;
        const dataSave = firebase.updateAsset(dataPath, galleryData);
        await dataSave;
        const descPath = "users/" + firebase.currentUID + "/galleryDesc/" + id;
        const dbSave = firebase.updateAsset(descPath, values);
        await dbSave;

        const galleriesPath = "publicGalleries/" + id;
        const publicGalleryData = {
            dataPath: dataPath
        }
        Object.assign(publicGalleryData, values);
        if (form.getFieldValue("public")) {
            firebase.updateAsset(galleriesPath, publicGalleryData)
        } else {
            firebase.removeRef(galleriesPath)
        }
        setTitle(values.title);
        message.success("Successfully saved Gallery: " + values.title)
    }
    const onFinish = async (values) => {
        processValuesAndSave(values)
    }

    const floorplanCallback = data => {
        console.log("floorplanDropdownChangeHandler", data)
        floorplanSelectedHandler(data)
    }



    return (
        <div className="page-header-area">
            <PageTitle title={title ? 'Building gallery: ' + title : "Builder"} help={BuilderHelp} />
            <Form
                layout="vertical"
                name="gallery-editor"
                form={form}
                onFinish={onFinish}
            >
                {(true || title || plannerGallery) && (<Collapse defaultActiveKey={['1']} style={{ marginBottom: 16 }}>
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
                                    <MapModal locationSet={setLocation} setCenter={location} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Gallery description"
                                    name="description"
                                >
                                    <TextArea rows={4} />
                                </Form.Item>
                                <p>Building on floorplan: <span style={{ color: "#333" }}>{(floorplan) && floorplan.title}</span></p>
                            </Col>
                            <Col span={8}>
                                {imgUrl && (<Card style={{ margin: 'auto', marginBottom: 16, width: 200 }}
                                    title="Gallery featured image"
                                    cover={<img alt="featured" src={imgUrl} />}
                                >
                                    <Meta description={imgTitle} />
                                </Card>)}

                                <Button style={{ margin: 'auto' }} onClick={selectArt} loading={selectingArt} >{selectingArt ? "Cancel" : "Select Image"}</Button>
                                {selectingArt ? <div>Select a work from Vault</div> : <div>Click button then click art in vault</div>}
                            </Col>
                        </Row>
                    </Panel>
                </Collapse>)}
                <Row>

                <Col span={8}>
                        <FloorplanDropdown
                            floorplanCallback={floorplanCallback}
                        />
                    </Col>
                    <Col span={5}>
                        <VisitButton disabled={!(id && visitable)} pathname={"/Gallery/" + nameEncoded || galleryDesc.nameEncoded} />
                    </Col>

                    <Col span={8}>
                        <GalleryEditDropdown
                            callback={onEditDropdownChangeHandler}
                        />
                    </Col>
                    <Col span={3}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" disabled={!id}>
                                Save
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>

            </Form>
        </div>

    )
}

const VisitButton = ({ disabled, pathname }) => {
    const onVisitHandler = (routeProps) => {
        const { history } = routeProps;
        history.push({ pathname: pathname })
    }
    return (
        <Route
            path="/"
            render={routeProps => {
                // Object.assign(routeProps, item);
                return <Button disabled={disabled} onClick={() => onVisitHandler(routeProps)}  >Visit<ArrowRightOutlined key="list-vertical-star-o" style={{}} /></Button>;
            }}
        />
    )
}

export default withFirebase(BuilderHeader);