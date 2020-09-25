import React from "react";
import rightsMap from './RightsMap';
import { Form, Select, Row, Col } from "antd";

const { Option } = Select;

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

export default RightsDropdown;