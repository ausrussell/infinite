import React, { Component, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { withFirebase } from "../Firebase";

import { CompactPicker } from "react-color";
import * as THREE from "three";
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import OrbitControls from 'orbit-controls-es6';
import { Input, Checkbox, Upload, Button, Form, Slider, Select, Row, Col, Divider } from "antd";
import { InboxOutlined } from '@ant-design/icons';

import Frame from '../PlanBuilder/Frame';
const { Option } = Select;

const layout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 16,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 8,
        span: 16,
    },
};

const FrameControls = props => {
    console.log("FrameControls", props)
    const [color, setColor] = useState(props.selectedItem ? props.selectedItem.color : "#666666");
    const [textureType, setTextureType] = useState("map")

    const [densityDisabled, setDensityDisabled] = useState(true);
    const [bumpScaleDisabled, setBumpScaleDisabled] = useState(true);
    const [normalScaleDisabled, setNormalScaleDisabled] = useState(true);
    const [form] = Form.useForm();

    const assetRef = props.assetRef || props.selectedItem.ref;

    useEffect(() => {
        const {selectedItem} = props;
        const updateTitle = () => {
            console.log("updateTitle", props)
            form.resetFields();
            form.setFieldsValue(
                selectedItem
            , [props]);
            setColor(selectedItem.color);
            form.setFieldsValue({color:selectedItem.color})

            setDensityDisabled(!selectedItem.map);
            setNormalScaleDisabled(!selectedItem.normalMap)
            setBumpScaleDisabled(!selectedItem.bumpMap)

        }
        console.log("useEffect", props)

        props.selectedItem && updateTitle()
    }, [props]);


    const updateColor = (colorInput) => {
        console.log("updateColor", colorInput);
        const newHexColor = colorInput.hex
        setColor(newHexColor);
        console.log("updateColor", color);
        form.setFieldsValue({color:newHexColor})
        props.frameObject.setFrameFromStudio({ color: newHexColor });
    }


    const fileUpload = (file) => {

        console.log("FrameMaker fileUpload", file);
        const path = "frame/" + assetRef.key;
        const uploadTask = props.firebase.storeAsset(path, file);
        return uploadTask;
    }

    const customRequest = ({ file, onProgress, onSuccess }) => {
        // console.log("type",type)
        console.log("form::", textureType)
        // debugger;
        file.assetName = textureType;
        const uploadTask = fileUpload(file);
        const next = snapshot => {
            const progress = snapshot.bytesTransferred / snapshot.totalBytes;
            onProgress({ percent: progress * 100 });
        };
        const complete = () => {
            uploadTask.then((snapshot) => {
                snapshot.ref.getDownloadURL().then(url => {
                    const pathAr = snapshot.ref.location.path.split("/");
                    const type = pathAr.pop()
                    const dbPath = pathAr.join("/");
                    const options = { [type]: url };
                    // debugger;
                    props.firebase.updateAsset(dbPath, options)
                        .then(() => {
                            console.log("db saved uploaded", dbPath, options);
                            setPreviewTexture(textureType, url)
                            onSuccess("Ok");
                        })
                    switch (textureType) {
                        case "map": setDensityDisabled(false);
                            break;
                        case "normalMap": setNormalScaleDisabled(false);
                            break;
                        case "bumpMap": setBumpScaleDisabled(false);
                            break;
                    }


                })
            })
        }

        uploadTask.on("state_changed", {
            next: next,
            complete: complete
        });
    };

    const setPreviewTexture = (textureType, url) => {
        console.log("url", url)
        const data = { [textureType]: url };
        props.frameObject.setFrameFromStudio(data);
    }

    const normFile = e => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const deleteHandler = () => { 
        props.firebase.deleteAsset(path());
        props.finishedCallback();

    };

    const removeTextureHandler = () => {
        console.log("removeTextureHandler");
        props.firebase.deleteFolderContents(path());
        if (!densityDisabled) {
            props.firebase.deleteValue(path(), "map");
            props.frameObject.fmaterial.map = null;
        }
        if (!bumpScaleDisabled) {
            props.firebase.deleteValue(path(), "bumpMap");
            props.frameObject.fmaterial.bumpMap = null;
        }
        if (!normalScaleDisabled) {
            props.firebase.deleteValue(path(), "normalMap");
            props.frameObject.fmaterial.normalMap = null;
        }
        props.frameObject.fmaterial.needsUpdate = true;

    };
    const densityHandler = (value) => {
        console.log("densityHandler", value);
        props.frameObject.setFrameFromStudio({ density: value  });

    }

    const roughnessHandler = (value) => {
        props.frameObject.setFrameFromStudio({ roughness: value });
    }

    const metalnessHandler = value => {
        props.frameObject.setFrameFromStudio({ metalness: value });
    }
    const normalScaleHandler = value => {
        props.frameObject.setFrameFromStudio({ normalScale: value  });
    }
    const bumpScaleHandler = value => {
        props.frameObject.setFrameFromStudio({ bumpScale: value  });
    }
    const path = () => assetRef.path.pieces_.join("/");

    const onFinish = (values) => {
        console.log("values", values);
        // debugger;
        // if (values.color) values.color = values.color;
        delete values["dragger-texture"];
        Object.keys(values).forEach(key => { values[key] = values[key] || null });
        values.updateTime = new Date();
        const dbSave = props.firebase.updateAsset(path(), values);//obeying rules for path in cloud functions
        dbSave.then(() => {
            console.log("onFinish saved", path, values);
        });
        props.finishedCallback();
    }

    return (
        <Form
            {...layout}
            // name="uploadForm"
            name="frame-editor"
            form={form}
            onFinish={onFinish}
        >
            <Row gutter={16}>
                <Col span={16} >
                    <Form.Item
                        label="Asset Title"
                        name="title"
                        valuePropName="value"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Title" />
                    </Form.Item>
                </Col><Col span={8}>
                    <Form.Item name="shareable" valuePropName="checked">
                        <Checkbox>Allow others to borrow this</Checkbox>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12} >
                    <Form.Item
                        label="Color"
                        name="color"
                        // valuePropName="color"
                    >
                        <CompactPicker color={color} onChangeComplete={updateColor} />
                    </Form.Item>
                </Col>
                <Col span={12} >
                    <Form.Item label="Roughness" name="roughness" >
                        <Slider onChange={roughnessHandler} min={0} max={1} step={0.05}/>
                    </Form.Item>
                    <Form.Item label="Metalness" name="metalness" >
                        <Slider onChange={metalnessHandler} min={0} max={1} step={0.05}/>
                    </Form.Item>
                </Col>
            </Row>
            <Divider orientation="left" style={{ color: '#333', fontWeight: 'normal' }}>
                Optional image upload for texture
            </Divider>
            <Row gutter={16}>
                <Col span={12} >
                    <Form.Item
                        name="texture-type"
                        label="Texture type"
                    >
                        <Select defaultValue="map" onChange={setTextureType}>
                            <Option value="map">Texture map</Option>
                            <Option value="normalMap">Normal</Option>
                            <Option value="bumpMap">Bump Map</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="dragger-texture" valuePropName="files" getValueFromEvent={normFile}>
                        <Upload.Dragger name="files" customRequest={customRequest} >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        </Upload.Dragger>
                    </Form.Item>
                </Col>
                <Col span={12} >
                    <Form.Item label="Texture density" name="density" >
                        <Slider onChange={densityHandler} disabled={densityDisabled}  min={0} max={2} step={0.05}/>
                    </Form.Item>

                    <Form.Item label="Bump Scale" name="bumpScale">
                        <Slider onChange={bumpScaleHandler} disabled={bumpScaleDisabled}  min={0} max={1} step={0.05}/>
                    </Form.Item>
                    <Form.Item label="Normal Scale" name="normalScale">
                        <Slider onChange={normalScaleHandler} disabled={normalScaleDisabled}  min={0} max={1} step={0.05}/>
                    </Form.Item>
                </Col>
            </Row>
            {(!densityDisabled || !bumpScaleDisabled || !normalScaleDisabled) &&
                (<Form.Item>
                    <Button htmlType="button" onClick={removeTextureHandler}>
                        Remove texture
                    </Button>
                </Form.Item>)}
            <Form.Item>
                <Button htmlType="button" onClick={deleteHandler}>
                    Delete this item
            </Button>
            </Form.Item>
            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    Save
            </Button>
            </Form.Item>
        </Form>
    );
}

class FrameMaker extends Component {
    frameWidth = 2;
    state = {
        assetRef: null,
        selectedItem: null
    }

    constructor(props) {
        super(props);
        console.log("FramePreview", props)
    }

    componentDidMount() {
        this.sceneSetup();
        this.addCustomSceneObjects();
        this.startAnimationLoop();
        this.addFrame();
    }
    componentDidUpdate(newProps) {
        console.log("newProps", newProps, this.props, newProps.selectedItem !== this.props.selectedItem)
        if (newProps.item !== this.props.item) {
            // debugger;
            this.props.item && this.handleTileSelected();//!this.props.item && 
        }
    }

    componentWillUnmount() {
        // window.removeEventListener('resize', this.handleWindowResize);
        window.cancelAnimationFrame(this.requestID);
        // this.controls.dispose();
    }

    handleTileSelected() {
        this.setState({ selectedItem: this.props.item });
        this.resetFrame();
        console.log("set new frame with", this.props.item)
        this.frameObject.setFrameFromStudio(this.props.item);
        if (this.props.item.roughness)this.frameObject.setFrameFromStudio({roughness: this.props.item.roughness});
        this.frameObject.fmaterial.needsUpdate = true;

    }

    sceneSetup = () => {
        const width = this.el.clientWidth;
        const height = this.el.clientHeight;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, // fov = field of view
            width / height, // aspect ratio
            0.1, // near plane
            1000 // far plane
        );

        this.camera.position.z = 35;
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setSize(width, height);
        this.el.appendChild(this.renderer.domElement); // mount using React ref};
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
    }
    addFrame() {
        this.frameObject = new Frame();
        console.log("addFrame this.frameObject", this.frameObject)
        this.frameObject.setPreviewFrame();
        this.scene.add(this.frameObject.group);
    }

    resetFrame(){
        this.scene.remove(this.frameObject.group);
        this.addFrame();

    }

    addCustomSceneObjects = () => {
        this.addLights();
    };

    addLights() {
        const lights = [];
        lights[0] = new THREE.PointLight(0xffffff, 1, 0);
        lights[1] = new THREE.PointLight(0xffffff, 1, 0);
        lights[2] = new THREE.PointLight(0xffffff, 1, 0);
        lights[3] = new THREE.AmbientLight(0xa0a0a0);
        lights[4] = new THREE.DirectionalLight(0x002288);

        lights[0].position.set(0, 200, 0);
        lights[1].position.set(0, 60, 60);
        lights[2].position.set(0, 0, 100);
        lights[4].position.set(- 100, - 200, - 100);

        // this.scene.add(lights[0]);
        this.scene.add(lights[1]);
        // this.scene.add(lights[2]);
        this.scene.add(lights[3]);
        // this.scene.add(lights[4]);

    }
    startAnimationLoop = () => {
        this.renderer.render(this.scene, this.camera);
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    };

    createNewHandler = () => {
        this.setState({ assetRef: this.props.firebase.getNewAssetRef("frame") })
    }

    finishedCallback = () => {
        console.log("finishedCallback");
        this.resetFrame();
        this.setState({ assetRef: null, selectedItem: null });}

    render() {
        const { assetRef, selectedItem } = this.state;
        return (<div>
            <div style={{ height: 400, marginBottom: 16 }} ref={ref => (this.el = ref)} />


            {(this.frameObject && (selectedItem || assetRef)) ?
                (<FrameControls
                    frameObject={this.frameObject} finishedCallback={this.finishedCallback}
                    assetRef={assetRef} selectedItem={selectedItem} firebase={this.props.firebase} />)
                :
                (<div>Select from Vault below to edit a frame or...
                    <div> <Button onClick={this.createNewHandler}>Create New Frame</Button></div></div>)}
        </div>)
            ;
    }
}

// class FrameMaker extends Component {
//     constructor(props) {
//         super(props);
//     }

//     render() {
//         return (<div>
//             <FramePreview firebase={this.props.firebase} />
//         </div>)
//     }
// }

export default withFirebase(FrameMaker);