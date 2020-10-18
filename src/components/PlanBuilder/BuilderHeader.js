import React, { Component, useState, useEffect } from "react";
import { Input, Button, Form, Row, Col, Checkbox, Card, Modal, message, Menu, Dropdown, Alert } from "antd";
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import GalleryEditDropdown from "../Gallery/GalleryEditDropdown";
import { withFirebase } from "../Firebase";
import GoogleApiWrapper from "../Landing/GoogleMap";
import PageTitle from '../Navigation/PageTitle';
import { Route } from "react-router-dom";
import { ArrowRightOutlined } from '@ant-design/icons';
import { BuilderHelp } from './BuilderHelp'
import FloorplanDropdown from '../Planner/FloorplanDropdown';
import { isEqual, isNil } from 'lodash';
import _ from 'lodash';
import * as ROUTES from "../../constants/routes";
import { compose } from 'recompose';
import { withRouter } from "react-router-dom";


const { confirm } = Modal;

const { TextArea } = Input;
const { Meta } = Card;

const galleryPlaceholder = 'https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Fhanger_placeholder.png?alt=media&token=4f847f15-48d6-43d9-92df-80eea32394f5';


class DetailsDropdown extends Component {
    state = {
        visible: true
    };

    componentDidUpdate(oldProps, oldState) {
        // console.log("oldState, this.state", oldState, this.state)
        if (this.props.detailsOpen !== oldProps.detailsOpen) {
            //console.log("set to show");
            this.setState({ visible: this.props.detailsOpen })
        }
    }

    handleMenuClick = e => {
        if (e.key === '3') {
            this.setState({ visible: false });
        }
    };

    handleVisibleChange = flag => {
        console.log("handleVisibleChange", flag);
        this.setState({ visible: flag });
    };

    render() {
        const menu = (
            <Menu onClick={this.handleMenuClick}>
                <Menu.Item key="1"><Row >
                    <Col span={24} style={{ width: "75vw" }}>
                        {this.props.children}
                    </Col>
                </Row>
                </Menu.Item>

            </Menu>
        );
        return (

            <Dropdown
                overlay={menu}
                onVisibleChange={this.handleVisibleChange}
                visible={this.state.visible}
                trigger={['click']}
            >
                <Button className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                    Gallery Details <DownOutlined />
                </Button>
            </Dropdown>
        );
    }
}

const MapModal = ({ setCenter, locationSet }) => {
    // //console.log("MapModal", setCenter)
    const [visible, setVisible] = useState();
    const [latLng, setLatLng] = useState(setCenter || null);
    useEffect(() => {
        const updateLatLng = () => {
            setLatLng(setCenter)
        }
        updateLatLng();
    }, [setCenter])

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
        if (!latLng) {
            Modal.warning({
                title: "You need to move the marker to set location ",
                zIndex: 1200,
            })
        } else {
            //console.log("onOK latLng, setCenter", latLng, setCenter)
            locationSet(latLng)
            hideModal()
        }
    };

    return (<div><Button type="primary" onClick={showMapModal}>
        Set location on Map
        </Button>
        <Modal
            title="Position your gallery"
            visible={visible}
            width={"75vw"}
            bodyStyle={{ height: 530 }}
            onOk={handleOk}
            onCancel={hideModal}
            zIndex={1100}
        >
            <GoogleApiWrapper modal={true} latLngCallBack={draggedCallback} setCenter={setCenter} />
        </Modal>
    </div>)
}

const BuilderHeader = ({ history, firebase, galleryDesc, galleryId, onEditDropdownChangeHandler, saveGallery, selectingArt, setSelectingArt, floorplan, floorplanSelectedHandler, exportData, userId }) => {
    // console.log("BuilderHeader props", props)
    const [title, setTitle] = useState(galleryDesc.title || "");
    const [id, setId] = useState("");
    const [visitable, setVisitable] = useState(false);
    const [imgUrl, setImgUrl] = useState("");
    const [imgTitle, setImgTitle] = useState("");
    const [galleryImg, setGalleryImg] = useState({});
    const [location, setLocation] = useState(null)
    const [nameEncoded, setNameEncoded] = useState(null);
    const [currentGalleryDesc, setCurrentGalleryDesc] = useState({});
    const [currentExportData, setCurrentExportData] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [locationAlert, setLocationAlert] = useState(false);
    const [curatorsUID, setCuratorsUID] = useState(false);


    const [form] = Form.useForm();


    useEffect(() => {
        // console.log("BuilderHeader useEffect")
        const updateFields = () => {
            console.log("updateFields galleryDesc, exportData, galleryId, id", galleryDesc, exportData, galleryId, id)
            form.resetFields();
            setCurrentGalleryDesc(galleryDesc);
            setCurrentExportData(exportData);
            setTitle(galleryDesc.title);
            setId(galleryId);
            setCuratorsUID(userId)
            //console.log("after galleryDesc, exportData", galleryDesc, exportData)

            setLocation(galleryDesc.location);
            // publicChange(galleryDesc.public);
            //console.log("setLocation to ", galleryDesc.location)
            setNameEncoded(galleryDesc.nameEncoded)
            setVisitable(galleryDesc.public && galleryDesc.location);
            if (galleryDesc.galleryImg) {
                setImgUrl(galleryDesc.galleryImg.thumb || galleryDesc.galleryImg.url);
                setImgTitle(galleryDesc.galleryImg.title);
                setGalleryImg(galleryDesc.galleryImg)
            } else {
                setImgUrl(galleryPlaceholder);
                setImgTitle("Featured Gallery Image");
                setGalleryImg({})
            }
            form.setFieldsValue(
                galleryDesc
                , [galleryDesc]);
            //console.log("useEffect Values", form.getFieldsValue())

        }
        // }

        updateFields()
    }, [galleryDesc, galleryId, userId, id, form, galleryDesc.galleryImg, exportData]);

    const selectArt = () => {
        debugger;
        setSelectingArt()
    }

    const checkForChanges = (data, callback) => {
        const values = form.getFieldsValue();
        //console.log("Values", values)
        const { desc, galleryData } = processValues(values)
        const galleryDataToTest = galleryData;
        if (galleryDataToTest.art) delete galleryDataToTest.art;//??
        const dataIsChanged = (currentExportData && JSON.stringify(galleryDataToTest) !== JSON.stringify(currentExportData));
        //console.log("dataIsChanged, currentExportData, galleryData", dataIsChanged, currentExportData, galleryData);
        //console.log("currentGalleryDesc, desc", currentGalleryDesc, desc);

        let desctest = desc;
        let currentGalleryDescTest = currentGalleryDesc;

        if (!currentGalleryDesc.location) delete desctest.location;

        desctest = removeEmptyObjects(desctest);//?? 
        currentGalleryDescTest = removeEmptyObjects(currentGalleryDescTest);//?? 
        // if (desctest.art) delete desctest.art; //don;t test for art because mightn't have been added in initial galleries
        if (currentGalleryDescTest.art) delete currentGalleryDescTest.art;
        const descIsChanged = (desc && !isEqual(currentGalleryDescTest, desctest));

        //console.log("descIsChanged, currentGalleryDesc, desctest", descIsChanged, currentGalleryDescTest, desctest);
        if (dataIsChanged || descIsChanged) {
            Modal.confirm({
                title: 'Do you want to save changes to this gallery?',
                content: 'Some descriptions',
                okText: 'Yes',
                cancelType: 'danger',
                cancelText: 'Discard changes',
                onOk() {
                    //console.log('OK');
                    form.validateFields().then(values => {
                        saveProcessedValues(desc, galleryData);
                        callback(data)
                    })
                        .catch(errorInfo => {
                            setDetailsOpen(true);
                        });

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
            .omitBy(isNil) // remove all empty objects
            .value();
    }

    const processValues = (values) => {
        setGalleryImg.updateTime = new Date();
        delete galleryImg.ref;
        values.galleryImg = galleryImg;
        if (!location && values.public) {
            // setDetailsOpen(true);
            Modal.error({
                title: "You need to set " + values.title + "'s location",
                zIndex: 1200,
                onOk: () => setDetailsOpen(true)
            })
            return false;
        }
        values.location = location;

        // console.log("firebase.currentUser", firebase.currentUser, firebase.currentUser.displayName);
        if (!firebase.isCurator || firebase.currentUser.displayName === "curator") values.userDisplayName = firebase.currentUser.displayName;
        Object.keys(values).forEach(key => { values[key] = values[key] || null });
        values.title = values.title.trim();
        if (values.title) values.nameEncoded = encodeURIComponent(values.title.replace(/\s/g, "_"));
        const galleryData = saveGallery();

        const data = {
            desc: values,
            galleryData: galleryData
        }
        return data;
    }

    const saveProcessedValues = async (desc, galleryData) => {
        //console.log("curators",firebase.currentUID)
        //console.log("curatorsUID save",curatorsUID)
        if (galleryData.art) desc.art = galleryData.art; //puts art keys in description and data

        const uidToSaveTo = (firebase.isCurator && curatorsUID) ? curatorsUID : firebase.currentUID;
        const dataPath = "users/" + uidToSaveTo + "/galleryData/" + id;
        const dataSave = firebase.updateAsset(dataPath, galleryData);
        await dataSave;
        const descPath = "users/" + uidToSaveTo + "/galleryDesc/" + id;
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
        message.success("Successfully saved Gallery: " + desc.title);
    }

    const onFinish = (values) => {
        const { desc, galleryData } = processValues(values);
        console.log("desc, galleryData", desc, galleryData)
    // return;
        if (!desc) {
            return;
        }
        saveProcessedValues(desc, galleryData);
        const uidToSaveTo = (firebase.isCurator && curatorsUID) ? curatorsUID : firebase.currentUID;
        console.log("save values to","users/" + uidToSaveTo + "/galleryData/" + id)
        const options = {
            refPath: "users/" + uidToSaveTo + "/galleryData/" + id,
            callback: (savedData) => {
                const refreshOptions = {
                    galleryDesc: desc, galleryData: savedData.val(), id: id
                }
                onEditDropdownChangeHandler(refreshOptions)
            },
            once: true
        }
        firebase.getAsset(options)
    }

    const onFinishFailed = () => {
        //console.log("onFinishFailed");
        setDetailsOpen(true);
    }


    const editCallback = (data) => {
        if (galleryId) {
            checkForChanges(data, () => { onEditDropdownChangeHandler(data) });
        } else {
            onEditDropdownChangeHandler(data)
        }
    }

    const floorplanCallback = data => {
        //console.log("floorplanCallback", data)
        if (galleryId) {
            checkForChanges(data, () => { floorplanSelectedHandler(data) });
        } else {
            floorplanSelectedHandler(data)
        }
    }


    const getPublicUrl = () => {
        if (nameEncoded || galleryDesc.nameEncoded) {
            return "https://hangar.social/gallery/" + nameEncoded || galleryDesc.nameEncoded;
        }
    }

    const deleteGallery = () => {
        confirm({
            title: 'Are you sure want to delete this gallery?',
            icon: <ExclamationCircleOutlined />,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                doDelete()
            },
            onCancel() {
                //console.log('Cancel');
            },
        });
    }
    const doDelete = async () => {
        const uidToSaveTo = (firebase.isCurator && curatorsUID) ? curatorsUID : firebase.currentUID;
        const dataPath = "users/" + uidToSaveTo + "/galleryData/" + id;

        const dataRemove = firebase.removeRef(dataPath);
        await dataRemove;
        const descPath = "users/" + uidToSaveTo + "/galleryDesc/" + id;
        const descRemove = firebase.removeRef(descPath);
        await descRemove;
        if (currentGalleryDesc.public) {
            const galleriesPath = "publicGalleries/" + id;
            const descRemove = firebase.removeRef(galleriesPath);
            await descRemove
        }
        onEditDropdownChangeHandler({ id: null })
        message.success("Successfully deleted Gallery: " + currentGalleryDesc.title);
    }

    const setLocationCallback = (data) => {
        setLocation(data);
        setLocationAlert(false);
    }

    const publicChange = ({ target }) => {
        //console.log("publicChange", target.checked, location)
        setLocationAlert(target.checked && !location)
        setVisitable(target.checked && location && nameEncoded);
    }

    const closeGallery = () => onEditDropdownChangeHandler({ id: null });

    const buildFloorplan = () => history.push(ROUTES.PLANNER);

    return (
        <div className="page-header-area">
            <PageTitle title={title ? 'Building gallery: ' + title : "Build a gallery"} help={BuilderHelp} />
            <Form
                name="gallery-editor"
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                {id &&
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <DetailsDropdown detailsOpen={detailsOpen} setCenter={location} >
                                <Row gutter={8}>
                                    <Col span={16}>
                                        <Form.Item
                                            label="Name"
                                            name="title"
                                            rules={[{ required: true }]}
                                        >
                                            <Input placeholder="Title" />
                                        </Form.Item>
                                        <Form.Item
                                            name="public"
                                            valuePropName="checked"
                                        >
                                            <Checkbox checked={true} onChange={publicChange}>Public</Checkbox>
                                        </Form.Item>

                                        <Form.Item>
                                            <MapModal locationSet={setLocationCallback} setCenter={location} />
                                            {!location && <p>Location not set</p>}
                                            {locationAlert && <Alert message="You need to set a location for public galleries" type="warning" showIcon closable />}
                                        </Form.Item>
                                        <Form.Item
                                            label="Gallery description"
                                            name="description"
                                        >
                                            <TextArea rows={4} />
                                        </Form.Item>
                                        <p>Building on floorplan: <span style={{ color: "#333" }}>{(floorplan) && floorplan.title}</span></p>
                                        {visitable && <div><p>Public url: {getPublicUrl()}</p>
                                            <VisitButton disabled={!(id && visitable)} pathname={"/Gallery/" + nameEncoded || galleryDesc.nameEncoded} /></div>}
                                    </Col>
                                    <Col span={8} style={{ textAlign: "center", padding: 10 }}>
                                        <div  onClick={selectArt}>
                                        {imgUrl && (<Card style={{ margin: 'auto', marginBottom: 16, width: 200 }}
                                            title="Gallery featured image"
                                            cover={<img alt="featured" src={imgUrl} />}
                                        >
                                            <Meta description={imgTitle} />
                                        </Card>)}

                                        <Button style={{ margin: 'auto' }} loading={selectingArt} >{selectingArt ? "Cancel" : "Select Featured Image"}</Button>
                                        {selectingArt ? <div>Select a work from Vault</div> : <div>Click button then click art in vault</div>}
                                        </div>
                                    </Col>
                                </Row>
                            </DetailsDropdown>
                        </Col>

                        <Col span={12} style={{ textAlign: 'right' }}>
                            {title &&
                                <Button onClick={deleteGallery} style={{ margin: '0 8px' }}>
                                    Delete
                                </Button>
                            }
                            <Button onClick={closeGallery} style={{ margin: '0 8px' }}>
                                Close
                                </Button>
                            <Button type="primary" htmlType="submit">
                                Save
                                </Button>
                        </Col>
                    </Row>}
            </Form>
            {!id && <Row gutter={16}>
                <Col flex="1">
                    <FloorplanDropdown
                        floorplanCallback={floorplanCallback}
                        galleryDesc={currentGalleryDesc}
                        id={id}
                        floorplan={floorplan}
                    />
                </Col>
                <Col className="header-button-col" flex="200px">
                <div className="header-tile-title">or...</div>
                    <div style={{ marginTop: 30 }}>
                        <Button onClick={buildFloorplan}>Create a Floorplan</Button>
                    </div>
                    <div style={{ marginTop: 30 }}>
                        <GalleryEditDropdown
                            callback={editCallback}
                            galleryDesc={currentGalleryDesc}
                            id={id}
                        />
                    </div>


                </Col>

            </Row>}


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
export default compose(
    withRouter,
    withFirebase
)(BuilderHeader)
// export default withFirebase(BuilderHeader);