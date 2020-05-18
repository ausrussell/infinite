import React, { useState, useEffect } from "react";
import { withFirebase } from "../Firebase";
import AssetForm from './AssetForm'
import { Card, Form, Button, Row, Col } from "antd";
import moment from 'moment';


const { Meta } = Card;

const AssetPreview = ({ item }) => {
    // console.log("AssetPreview item", item)
    let url = "";
    const type = item.type
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
                    bordered={false}
                    cover={<img alt={type} src={url}
                    meta={{display:"none"}} />}
                >
                    <Meta title={item.title} />
                </Card>
            </Col>
        </Row>
    )
}

const AssetEditor = props => {
    console.log("props.props", props);
    const [item, setItem] = useState(props.item);
    const [saving, setSaving] = useState(false);
    const firebase = props.firebase || props.firebaseModal;
    const type = item.type.toLowerCase();
    useEffect(() => {
        const updateFields = () => {
            setItem(props.item)
        }
        updateFields()
    }, [props.item]);



    const deleteHandler = () => {
        const dbDelete = firebase.deleteAsset(path(), item);//obeying rules for path in cloud functions
        dbDelete.then(() => console.log("delete callback"))
    }

    const path = () => firebase.assetPath(type) + item.key

    const saveToDb = (values) => {
        console.log("saveToDb", values);
        values.updateTime = moment().format('MMMM Do YYYY, h:mm:ss a')
        setSaving(true);
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
            <AssetForm item={item} saveToDb={saveToDb} saving={saving} firebase={firebase} />
            <AssetMeta item={item} />
            {!props.firebaseModal && <AssetDeleteButton deleteHandler={deleteHandler} />}
        </Card>)
}

const AssetMeta = ({item}) => {
    const {updateTime, uploadedTime} = item;
    console.log("AssetMeta", updateTime, uploadedTime)
    return (<div>
       {updateTime && <p>Last update: {updateTime}</p>}
       {uploadedTime && <p>Uploaded: {uploadedTime}</p>}

    </div>)
}

const AssetDeleteButton = ({ deleteHandler }) => {

    return (<Form.Item>
        <Button htmlType="button" onClick={deleteHandler}>
            Delete this item
    </Button>
    </Form.Item>)
}
export default withFirebase(AssetEditor);