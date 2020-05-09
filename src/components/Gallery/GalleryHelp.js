import React from 'react';
import { Row, Col, Typography } from "antd";
import { CaretUpOutlined, CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
const { Title } = Typography;
const iconStyle= { fontSize: '26px' };
const colStyle= { textAlign: 'center' }

export const GalleryHelp = (props) => {return {
    title: 'Moving round the gallery',
    id:"galleryHelp",
    width:"60vw",
    callback:props.callback,
    showOnce: true,
    content:
        (<Row>
            <Col span={18}>
                <Row gutter={16}>
                    <Col span={6} offset={3}>
                    </Col>
                    <Col span={6} style={colStyle}>
                        Move Forward
                        <Title level={3}>W</Title>
                        <CaretUpOutlined style={iconStyle}/>
                    </Col>
                    <Col span={6}>

                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={6} offset={3} style={colStyle}>
                        Turn Left
<Title level={3}>A</Title>
                        <CaretLeftOutlined style={iconStyle} />
                    </Col>
                    <Col span={6}>

                    </Col>
                    <Col span={6} style={colStyle}>
                        Turn Right
<Title level={3}>D</Title>
                        <CaretRightOutlined style={iconStyle} />
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6} offset={3}>

                    </Col>
                    <Col span={6} style={colStyle}>
                        Move Backward
<Title level={3}>S</Title>
                        <CaretDownOutlined style={iconStyle} />
                    </Col>
                    <Col span={6}>

                    </Col>
                </Row>
                <Row>
                    <Col span={6} offset={3} style={colStyle}>
                        You can also click on the floor
                    </Col>
                </Row>
            </Col>
            <Col span={6}>
                <Row gutter={[0,16]}>
                    <Col span={24} style={colStyle}>
                        Move Up
<Title level={3}>R</Title>

                    </Col>
                </Row>
                <Row gutter={[0,16]}>
                    <Col span={24} style={colStyle}>
                        Move Down
<Title level={3}>F</Title>

                    </Col>
                </Row>
            </Col>
        </Row>
        )
    }
}