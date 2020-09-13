import React from 'react';
import { isMobile } from 'react-device-detect';

import { Row, Col, Typography } from "antd";
import { CaretUpOutlined, CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
const { Title } = Typography;
const iconStyle = { fontSize: '36px', margin: 10 };
const colStyle = { textAlign: 'center' }
const colStyleTall = { height: 120 }

const frameHoverStyle = {
    borderColor: "#4527a0",
    borderWidth: 5,
    borderStyle: "solid",

    width: "90px",
    height: "60px",
    margin: 10,
    opacity: .7
}
const itemBox = {
    borderColor: "#4527a0",
    borderWidth: 1,
    borderStyle: "solid",
    display: "flex", alignItems: "center",
    maxWidth: 300,
    margin: "auto"

}

const itemBoxIcon = {
    paddingTop: 10,
    borderColor: "#4527a0",
    borderWidth: 1,
    borderStyle: "solid",
    display: "flex", alignItems: "center",
    maxWidth: 300,
    margin: "auto"
}
const footstepHolder = {
    width: 90,
    height: 60,
    margin: 10,
    opacity: 0.7
}

export const GalleryHelp = (props) => {

    return {
        title: 'Moving round the gallery',
        width: isMobile ? "95vw" : "75vw",
        callback: props.callback,
        showOnce: true,
        content:
            (<>
                {isMobile ? <div>
                    <Row>
                        <Col span={20} offset={2} style={colStyleTall}><h3>One finger to move</h3></Col>
                    </Row>
                    <Row>
                        <Col span={20} offset={2} style={colStyleTall}><h3>Two fingers to rotate and move in or out</h3></Col>
                    </Row>

                </div>
                    :
                    <div>
                        <Row>
                            <Col span={10} offset={7} style={colStyleTall}><div style={itemBox}><div style={frameHoverStyle} /><span>Click on an artwork</span></div></Col>
                        </Row>
                        <Row>
                            <Col span={10} offset={7} style={colStyle}><Title level={2}>Arrow keys</Title></Col>
                        </Row>
                        <Row>
                            <Col span={10} offset={7}>
                                <div style={itemBoxIcon}>
                                    <CaretUpOutlined style={iconStyle} />

                                    <div>
                                        <Title level={4}>Move Forward</Title>
                                        <p>+ SHIFT to Move UP in space</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <Row style={{ marginTop: 15, marginBottom: 15 }}>
                            <Col span={10}>
                                <div style={itemBoxIcon}>
                                    <CaretLeftOutlined style={iconStyle} />
                                    <div>
                                        <Title level={4}>Turn Left</Title>
                                        <p>+ SHIFT to Move Left in space</p>
                                    </div>
                                </div>
                            </Col>

                            <Col span={10} offset={4}>
                                <div style={itemBoxIcon}>
                                    <CaretRightOutlined style={iconStyle} />
                                    <div>
                                        <Title level={4}>Turn Right</Title>
                                        <p>+ SHIFT to Move Right in space</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={10} offset={7}>
                                <div style={itemBoxIcon}>
                                    <CaretDownOutlined style={iconStyle} />
                                    <div>
                                        <Title level={4}>Move Back</Title>
                                        <p>+ SHIFT to Move Down in space</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 30 }}>
                            <Col span={10} offset={7} style={colStyleTall}>
                                <div style={itemBox}>
                                    <div style={footstepHolder}><img className="footstep-help" src="../imagery/foot.png" alt="footsteps" /></div>
                                    <span>Click on the floor</span>
                                </div>
                            </Col>
                        </Row>
                    </div>
                }

            </>
            )
    }
}