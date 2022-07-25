import React from 'react';
import { Row, Col, Typography, Divider } from "antd";
import { CaretUpOutlined, CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
const { Title } = Typography;
const iconStyle = { fontSize: '36px', margin: 10 };
const colStyle = { textAlign: 'center' }
const colStyleTall = { height: 120 };
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

export const BuilderHelp = {
    title: 'Help with the builder',
    size: "full",
    content:
        (<>
                <Row>
                    <Col span={24}>
                        <Divider orientation="left">Adding art</Divider>
                        <p>You can drag image files from your desktop straight onto the walls of your gallery (they'll get added to your vault as well). If you don't drag a file onto a wall it will go straight into your vault.</p>
                        <p>You can also drag previously added images from the vault onto a wall.</p>
                        <p>Once on a wall, you can hover of an artwork and see handles to move a work (on the plane it's on) or to scale the image larger or smaller.</p>
                        <Divider orientation="left">Frames, Walls, Floors and Surrounds</Divider>
                        <p>On different floors in the vault you will find different materials to add to your gallery. There are provided collections of each and you can make your own in the Studio.</p>
                        <p>Click on a material for a frame or wall and then click on the work/s or wall/s you want it applied to. Click back on the tile to cancel.</p>
                        <p>Clicking on a material for the floor or surrounds makes an immediate change.</p>
                        <Divider orientation="left">Lights</Divider>
                        <p>Every time you drag an image onto a wall a spotlight is added to illuminate it. You can move, remove, or add spotlights and change their intensity and color. When on the lighting floor the spotlights will have a cone which you can use as a handle to move around - this might be necessary if you've moved an artwork.</p>
                    </Col>
                </Row>
                <Divider orientation="left">Movement</Divider>

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
                <Row style={{marginTop:15,marginBottom:15}}>
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
                <Row gutter={16} style={{marginTop:30}}>
                    <Col span={10} offset={7} style={colStyleTall}>
                        <div style={itemBox}>
                            <div style={footstepHolder}><img className="footstep-help" src="../imagery/foot.png" alt="footsteps" /></div>
                            <span>Click on the floor</span>
                        </div>
                    </Col>
                </Row>
                
            </>
        )
}
