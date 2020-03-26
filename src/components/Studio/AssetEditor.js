import React, { Component, useState, useEffect } from "react";
import { withFirebase } from "../Firebase";
import { Row, Col, Card, Checkbox, Tabs, Form, Input, Button } from "antd";
const {Meta} = Card;
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

const AssetPreview = (props) => {
    const [item, setItem] = useState({});
    useEffect(() => {
        setItem(props.item)

    }, [props]);
    console.log("AssetPreview item",item)
    let url = ""
    const originalTitle = item.title;
    const type = item.type;
    console.log("type");
    switch (type) {
        case "Surroundings":
        console.log("Surroundings", item)
            url = item.ny;
            break;
        default: 
        console.log("default", item)
        url = item.url || "";
    }

    return (
        <Card style={{ height: 300 }}
            cover={<img alt="example" src={url} />}
        >
            <Meta title={originalTitle} description={type} />
        </Card>
    )
}

const AssetEditor = props => {
    console.log("props.props", props)
    const [title, setTitle] = useState("");
    const item = props.item;

    useEffect(() => {
        const updateTitle = () => {
            console.log("updateTitle", props)
            form.setFieldsValue({
                title: item.title
            }, [item]);
        }
        updateTitle()
    }, [props]);
    const [form] = Form.useForm();
    const onFinish = (values) => {
        console.log("onFinish item ref path", item, item.ref.path);
        console.log("onFinish", values);
        const path = item.ref.path.pieces_.join("/")
        const dbSave = props.firebase.updateAsset(path, values);//obeying rules for path in cloud functions
        dbSave.then(() => {
            console.log("onFinish saved", path, values);
        })
    }
    return (
        <Card type="inner" title="Edit asset">
            <AssetPreview item={item} />
  
        <Form
          {...layout}
                // name="uploadForm"
                name="asset-editor"
                form={form}
                onFinish={onFinish}
            >
                <Form.Item
                    label="Asset Title"
                    name="title"
                    valuePropName="value"
                >
                    <Input placeholder="Title" />
                </Form.Item>
                <Form.Item name="shareable" valuePropName="checked">
                    <Checkbox>Allow others to borrow this for their own gallery</Checkbox>
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        Update
          </Button>
                </Form.Item>
        </Form>
        </Card>)
}

export default withFirebase(AssetEditor);