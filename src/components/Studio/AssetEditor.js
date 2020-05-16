import React, { useState, useEffect } from "react";
import { withFirebase } from "../Firebase";
import { Card, Checkbox, Form, Input, Button, Select, Row, Col } from "antd";
import moment from 'moment';
import rightsMap from './RightsMap';

const { Option } = Select

const { Meta } = Card;
const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 20,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 8,
        span: 16,
    },
};


const RightsDropdown = ({ license = 3 }) => {
    const handleChange = (value) => {
        console.log("handle change", value)
    }

    return (
        <Row>
            <Col span={4} style={{ textAlign: "center" }}>{license && rightsMap[license].icon}</Col>
            <Col span={20}>
                <Form.Item name="license" label="License" >

                    <Select defaultValue={license || 3} onChange={handleChange} style={{ maxWidth: 400 }}>
                        {Object.keys(rightsMap).map((item, i) => (<Option key={i} value={i}>{rightsMap[item].text}</Option>))}
                    </Select>
                </Form.Item>
            </Col>
        </Row>
    )
}

const AssetPreview = ({ item }) => {
    // console.log("AssetPreview item", item)
    let url = "";
    const type = item.type
    const description = "Updated: " + item.updateTime;
    console.log("type");
    switch (type) {
        case "Surroundings":
            url = item.ny;
            break;
        case "Art":
            url = item.thumb || item.url;
            break;
        default:
            console.log("default", item)
            url = item.url || "";
    }

    return (
        <Row style={{ background: "#000", marginBottom: 16 }}>
            <Col span={24}>
                <Card style={{ margin: '16px auto', width: 250 }}
                    title={item.title}
                    cover={<img alt={type} src={url} />}
                >
                    <Meta description={description} />
                </Card>
            </Col>
        </Row>
    )
}

const AssetForm = ({ item, saveToDb, saving }) => {
    const [form] = Form.useForm();
    useEffect(() => {
        console.log("AssetForm useEffect", item);
        const updateFields = () => {
            form.resetFields();
            form.setFieldsValue(item);
            // setItem(item)
        }
        updateFields()
    }, [form, item, item.updateTime]);

    return (
        <Form
            {...layout}
            // name="uploadForm"
            name="asset-editor"
            form={form}
            onFinish={saveToDb}
        >
            <Form.Item
                label="Asset Title"
                name="title"
            >
                <Input placeholder="Title" />
            </Form.Item>
            <Form.Item name="shareable" valuePropName="checked">
                <Checkbox>Allow others to borrow this for their own Hangar gallery</Checkbox>
            </Form.Item>
            {item.type.toLowerCase() === "art" && (
                <RightsDropdown license={item.license} />
            )}

            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit" loading={saving}>
                    Update
                    </Button>
            </Form.Item>
        </Form>
    )
}

const AssetEditor = props => {
    console.log("props.props", props);
    const [item, setItem] = useState(props.item);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        const updateFields = () => {
            setItem(props.item)
        }
        updateFields()
    }, [props.item]);

    // const item = props.item;
    const firebase = props.firebase || props.firebaseModal;
    const type = item.type.toLowerCase();

    const deleteHandler = () => {
        const dbDelete = firebase.deleteAsset(path(), item);//obeying rules for path in cloud functions
        dbDelete.then(() => console.log("delete callback"))
    }
    const path = () => firebase.assetPath(type) + item.key


    const saveToDb = (values) => {
        console.log("onFinish", values);
        setSaving(true);
        values.updateTime = moment().format('MMMM Do YYYY, h:mm:ss a'); //new Date();
        console.log("values.updateTime", moment())
        Object.keys(values).forEach(key => { values[key] = values[key] || null });

        const dbSave = firebase.updateAsset(path(), values);//obeying rules for path in cloud functions

        dbSave.then(() => {
            const newItem = Object.assign(item, values)
            setItem(newItem);
            setSaving(false)
        })
    }
    return (
        <Card type="inner" title="Edit asset">
            <AssetPreview item={item} />
            <AssetForm item={item} saveToDb={saveToDb} saving={saving} />
            <AssetDeleteButton deleteHandler={deleteHandler} />
        </Card>)
}

const AssetDeleteButton = ({ deleteHandler }) => {

    return (<Form.Item>
        <Button htmlType="button" onClick={deleteHandler}>
            Delete this item
    </Button>
    </Form.Item>)
}
export default withFirebase(AssetEditor);