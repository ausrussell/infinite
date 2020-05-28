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
import {isEqual, omit, omitBy, isNil, isEmpty, mapValues, removeEmptyObjects} from 'lodash';
import _ from 'lodash';

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

const BuilderHeader = ({ firebase, galleryDesc, galleryId, onEditDropdownChangeHandler, plannerGallery, saveGallery, selectingArt, setSelectingArt, floorplan, floorplanSelectedHandler, exportData }) => {
    // console.log("BuilderHeader props", props)
    const [title, setTitle] = useState(galleryDesc.title || "");
    const [id, setId] = useState("");
    const [visitable, setVisitable] = useState(false);
    const [imgUrl, setImgUrl] = useState("");
    const [imgTitle, setImgTitle] = useState("");
    const [galleryImg, setGalleryImg] = useState({});
    const [location, setLocation] = useState(null)
    const [nameEncoded, setNameEncoded] = useState(null);
    const [currentGalleryDesc, setCurrentGalleryDesc] = useState(null);
    const [currentExportData, setCurrentExportData] = useState(null);


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
            console.log("galleryDesc, exportData",galleryDesc, exportData)
            form.resetFields();
            setCurrentGalleryDesc(galleryDesc);
            setCurrentExportData(exportData);
            setTitle(galleryDesc.title);
            setId(galleryId);
            console.log("updating id to",id)
            console.log("after galleryDesc, exportData",galleryDesc, exportData)

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
    }, [galleryDesc, galleryId, id, form, galleryDesc.galleryImg, exportData]);

    const selectArt = () => {
        setSelectingArt()
    }

    const checkForChanges = (data, callback) => {
        const values = form.getFieldsValue()
        const { desc, galleryData } = processValues(values)
        const dataIsChanged = (currentExportData && JSON.stringify(galleryData) !== JSON.stringify(currentExportData));
        console.log("dataIsChanged, currentExportData, galleryData", dataIsChanged, currentExportData, galleryData);
        let desctest = desc;
        if (!currentGalleryDesc.location) delete desctest.location;
        desctest = removeEmptyObjects(desctest);//.pickBy(_.isObject).mapValues(removeEmptyObjects).value();
        const descIsChanged = (desc && !isEqual(currentGalleryDesc, desctest));
        console.log("descIsChanged, currentGalleryDesc, desc",descIsChanged, currentGalleryDesc, desctest);
        if (dataIsChanged || descIsChanged) {
            Modal.confirm({
                title: 'Do you want to save changes to this gallery?',
                content: 'Some descriptions',
                okText: 'Yes',
                cancelType: 'danger',
                cancelText: 'Discard changes',
                onOk() {
                    console.log('OK');
                    saveProcessedValues(desc, galleryData);
                    callback(data)
                },
                onCancel() {
                    callback(data)
                }
            })
        } else {
            callback(data)

        }
    }

    const removeEmptyObjects = (obj) => {
        return _(obj)
        .pickBy(_.isObject) // pick objects only
        .mapValues(removeEmptyObjects) // call only for object values
        .omitBy(_.isEmpty) // remove all empty objects
        .assign(_.omitBy(obj, _.isObject)) // assign back primitive values
        .omitBy(isNil)
        .value();
    }

    const processValues = (values) => {
        setGalleryImg.updateTime = new Date();
        delete galleryImg.ref;
        values.galleryImg = galleryImg;
        values.location = location || { lat: 36.80885384408701 + Math.random() * 2, lng: -123.27939428681641 + Math.random() * 2 };
        Object.keys(values).forEach(key => { values[key] = values[key] || null });
        if (values.title) values.nameEncoded = encodeURIComponent(values.title.replace(" ", "_"));
        const data = {
            desc: values,
            galleryData: saveGallery()
        }
        return data;
    }

    const saveProcessedValues = async (desc, galleryData) => {
        const dataPath = "users/" + firebase.currentUID + "/galleryData/" + id;
        const dataSave = firebase.updateAsset(dataPath, galleryData);
        await dataSave;
        const descPath = "users/" + firebase.currentUID + "/galleryDesc/" + id;
        const dbSave = firebase.updateAsset(descPath, desc);
        await dbSave;
        const galleriesPath = "publicGalleries/" + id;
        const publicGalleryData = {
            dataPath: dataPath
        }
        Object.assign(publicGalleryData, desc);
        if (form.getFieldValue("public")) {
            firebase.updateAsset(galleriesPath, publicGalleryData)
        } else {
            firebase.removeRef(galleriesPath)
        }
        message.success("Successfully saved Gallery: " + desc.title)
    }

    const onFinish = (values) => {
        const { desc, galleryData } = processValues(values);
        saveProcessedValues(desc, galleryData);
        setNameEncoded(desc.nameEncode);
        setVisitable(form.getFieldValue("public"));
        setTitle(desc.title);
    }

    const editCallback = (data) => {
        if (galleryId) {
            checkForChanges(data, () => {onEditDropdownChangeHandler(data)});
        } else {
            onEditDropdownChangeHandler(data)
        }
    }

    const floorplanCallback = data => {
        console.log("floorplanCallback", data)
        if (galleryId) {
            checkForChanges(data, () => {floorplanSelectedHandler(data)});
        } else {
            floorplanSelectedHandler(data)
        }
    }

    return (
        <div className="page-header-area">
            <PageTitle title={title ? 'Building gallery: ' + title : "Builder"} help={BuilderHelp} />
            <div>id:{id}</div>
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
                            callback={editCallback}
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