
import React, { useState, useEffect } from "react";
import { Checkbox, Form, Input, Button, Select, Row, Col, DatePicker } from "antd";
import rightsMap from './RightsMap';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
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
const yearFormat = 'YYYY';

const AssetForm = (props) => {
    console.log("AssetForm props", props)
    const [item,setItem] = useState(props.item)
    const { saveToDb, saving, firebase } = props;
    const [form] = Form.useForm();
    useEffect(() => {
        console.log("AssetForm useEffect", props.item);
        const updateFields = () => {
            let newYear = moment(props.item.year || moment().format('YYYY'), 'YYYY')
            const fieldsValues = Object.assign(props.item, {year: newYear})
            form.resetFields();
            form.setFieldsValue(fieldsValues);
            setItem(props.item)
        }
        updateFields()
    }, [form, props.item, props.item.updateTime]);

    const onFinish = fieldsValues => {
        // fieldsValues.year = fieldsValues['year'] && "1999";//fieldsValues['year'].format('YYYY');
        debugger;

        fieldsValues.year = fieldsValues.year.format('YYYY')
        // console.log("values.updateTime", moment())
        Object.keys(fieldsValues).forEach(key => { fieldsValues[key] = fieldsValues[key] || null });
        // const values = {
        //     ...fieldsValues,
        //     updateTime: moment().format('MMMM Do YYYY, h:mm:ss a')
        // }
        saveToDb(fieldsValues);
    }

    return (
        <Form
            {...layout}
            // name="uploadForm"
            name="asset-editor"
            form={form}
            onFinish={onFinish}
            initialValues={{
                artist: item.artist || firebase.currentUser.displayName,
            }}
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
            <Form.Item name="artist" label="Artist">
                <Input type="text" />
            </Form.Item>
            <Form.Item name="media" label="Medium/Media">
                <Input type="text" />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <TextArea rows={4} />
            </Form.Item>
            <Form.Item label="Year" name="year">
                <DatePicker picker="year" format={yearFormat}  defaultValue={moment(item.year || moment().format('YYYY'), 'YYYY')} />
            </Form.Item>

            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit" loading={saving}>
                    Update
                    </Button>
            </Form.Item>
        </Form>
    )
}

export default AssetForm;