import React, { useState, useEffect } from "react";

import { CompactPicker } from "react-color";

import { Input, Checkbox, Upload, Button, Form, Slider, Select, Row, Col, Divider } from "antd";
import { InboxOutlined } from '@ant-design/icons';
import HelpModal from '../Navigation/HelpModal'

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

const ThreeAssetPreviewControls = props => {
    console.log("ThreeAssetPreviewControls", props)
    const { type } = props;
    const [color, setColor] = useState(props.selectedItem ? props.selectedItem.color : "#666666");
    const [textureType, setTextureType] = useState("map")

    const [densityDisabled, setDensityDisabled] = useState(true);
    const [densityMax, setDensityMax] = useState(2);
    const [bumpScaleDisabled, setBumpScaleDisabled] = useState(true);
    const [normalScaleDisabled, setNormalScaleDisabled] = useState(true);
    const [form] = Form.useForm();

    const assetRef = props.assetRef || props.selectedItem.ref;


    useEffect(() => {
        const { selectedItem } = props;
        const updateTitle = () => {
            console.log("updateTitle", props)
            form.resetFields();
            initDensity(selectedItem.density)
            form.setFieldsValue(
                selectedItem
                , [props]);
            setColor(selectedItem.color);
            form.setFieldsValue({ color: selectedItem.color })
            setDensityDisabled(!selectedItem.map);
            setNormalScaleDisabled(!selectedItem.normalMap)
            setBumpScaleDisabled(!selectedItem.bumpMap)
        }
        console.log("useEffect", props)

        selectedItem && updateTitle(props)
    }, [props]);


    const updateColor = (colorInput) => {
        console.log("updateColor", colorInput);
        const newHexColor = colorInput.hex
        setColor(newHexColor);
        console.log("updateColor", color);
        form.setFieldsValue({ color: newHexColor })
        props.frameObject.setDataToMaterial({ color: newHexColor });
    }


    const fileUpload = (file) => {

        console.log("ThreeAssetPreviewControls fileUpload", file);

        const path = props.type + "/" + assetRef.key;
        const uploadTask = props.firebase.storeAsset(path, file);
        return uploadTask;
    }

    const customRequest = ({ file, onProgress, onSuccess }) => {
        // console.log("type",type)
        console.log("form::", textureType)
        // debugger;
        file.assetName = (props.type === "surrounds") ? file.name : textureType;
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
                    if (props.type === "surrounds") {
                        onSuccess("Ok");
                        const uploadTitle = file.name.replace(".zip", "")
                        form.setFieldsValue({ title: uploadTitle })
                        // debugger;
                    } else {
                        const dbPath = pathAr.join("/");
                        const options = { [type]: url };
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
                            default: break;
                        }
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
        props.frameObject.setDataToMaterial(data);
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

    const initDensity = (value) => {
        const maxValue = (value * 2 < 20) ? value * 2 : 20
        setDensityMax(maxValue || 2);
        form.setFieldsValue({ densityMax: maxValue })

    }
    const densityHandler = (value) => {
        console.log("densityHandler", value);
        // form.setFieldsValue({density: value});
        console.log("densityHandler", props.meshRatio);
        if (props.meshRatio) {
            const reatioAr = [value, value * props.meshRatio]
            props.frameObject.setDataToMaterial({ density: reatioAr });
            // form.setFieldsValue({ density: reatioAr })
        } else { props.frameObject.setDataToMaterial({ density: value }); }

    }
    const densityLimitHandler = (value) => {
        setDensityMax(value)
    }

    const marks = {
        0: '0',
        [densityMax]: `${densityMax}`,

    };

    const roughnessHandler = (value) => {
        props.frameObject.setDataToMaterial({ roughness: value });
    }

    const metalnessHandler = value => {
        props.frameObject.setDataToMaterial({ metalness: value });
    }

    const opacityHandler = value => {
        console.log("opacityHandler props.frameObject", props.frameObject)
        props.frameObject.setDataToMaterial({ opacity: value });
    }

    const normalScaleHandler = value => {
        props.frameObject.setDataToMaterial({ normalScale: value });
    }
    const bumpScaleHandler = value => {
        props.frameObject.setDataToMaterial({ bumpScale: value });
    }
    const path = () => assetRef.path.pieces_.join("/");

    const onFinish = (values) => {
        console.log("values", values);
        delete values["dragger-texture"];
        if (props.meshRatio) {
            values.density = values.density ? [values.density, values.density * props.meshRatio] : null;
        }
        Object.keys(values).forEach(key => { values[key] = values[key] || null });
        values.updateTime = new Date();
        const dbSave = props.firebase.updateAsset(path(), values);//obeying rules for path in cloud functions
        dbSave.then(() => {
            console.log("onFinish saved", path, values);
        });
        props.finishedCallback();
    };


    return type === "surrounds" ? (
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
                </Col>
                <Col span={(props.help) ? 5 : 8}>
                        <Form.Item name="shareable" valuePropName="checked">
                            <Checkbox>Allow others to borrow this</Checkbox>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                    {props.help && <HelpModal content={props.help}/>}
                    </Col>
            </Row>
            <Form.Item name="dragger-texture" valuePropName="files" getValueFromEvent={normFile}>
                <Upload.Dragger name="files" customRequest={customRequest} >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                </Upload.Dragger>
            </Form.Item>
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
    ) : (
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
                    </Col>
                    <Col span={(props.help) ? 5 : 8}>
                        <Form.Item name="shareable" valuePropName="checked">
                            <Checkbox>Allow others to borrow this</Checkbox>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                    {props.help && <HelpModal content={props.help}/>}
                    </Col>
                </Row>
                <Row>
                    <Col flex="0 1 370px">
                        <Form.Item
                            label="Color"
                            name="color"

                        >

                            <CompactPicker color={color} onChangeComplete={updateColor} />

                        </Form.Item>
                    </Col>
                    <Col flex="1 1 310px">
                        <Form.Item label="Roughness" name="roughness" >
                            <Slider onChange={roughnessHandler} min={0} max={1} step={0.05} />
                        </Form.Item>
                        <Form.Item label="Metalness" name="metalness" >
                            <Slider onChange={metalnessHandler} min={0} max={1} step={0.05} />
                        </Form.Item>
                        <Form.Item label="Opacity" name="opacity" >
                            <Slider onChange={opacityHandler} min={0} max={1} step={0.05} />
                        </Form.Item>
                    </Col>

                </Row>

                <Divider orientation="left" style={{ color: '#333', fontWeight: 'normal' }}>
                    Optional image upload for texture
            </Divider>
                <Row gutter={16}>
                    <Col span={8} >
                        <Form.Item
                            name="texture-type"
                            label="Texture type"
                        >
                            <Select defaultValue="map" onChange={setTextureType}>
                                <Option value="map">Texture map</Option>
                                <Option value="normalMap">Normal</Option>
                                <Option value="bumpMap">Bump Map</Option>
                                <Option value="roughnessMap">Roughness Map</Option>
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
                    <Col span={16} >
                        <Form.Item label="Texture density" name="density" >
                            <Slider marks={marks} onChange={densityHandler} disabled={densityDisabled} min={0} max={densityMax} step={0.05} />

                        </Form.Item>
                        <Form.Item label="Texture density max" name="densityMax" >
                            <Slider onChange={densityLimitHandler} disabled={densityDisabled} min={0.1} max={20} step={0.05} />
                        </Form.Item>
                        <Form.Item label="Bump Scale" name="bumpScale">
                            <Slider onChange={bumpScaleHandler} disabled={bumpScaleDisabled} min={0} max={1} step={0.05} />
                        </Form.Item>
                        <Form.Item label="Normal Scale" name="normalScale">
                            <Slider onChange={normalScaleHandler} disabled={normalScaleDisabled} min={0} max={1} step={0.05} />
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
            </Form>)
}


export default ThreeAssetPreviewControls;