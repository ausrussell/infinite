import React from 'react';
import { Row, Col, Typography, Divider } from "antd";
import { CaretUpOutlined, CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
const { Title } = Typography;
const iconStyle = { fontSize: '26px' };
const colStyle = { textAlign: 'center' }

export const BuilderHelp = {
    title: 'Help with the builder',
    size: "full",
    content:
        (

            <Row>
                <Row>
                    <Col span={24}>
                        <Divider orientation="left">Adding art</Divider>
                        <p>You can drag image files from your desktop straight onto the walls of your gallery (they'll get added to your vault as well). If you don't drag a file onto a wall it will go straight into your vault.</p>
                        <p>You can also drag previously added images from the vault onto a wall.</p>
                        <p>Once on a wall, you can hover of an artwork and see handles to move a work (on the plane it's on) or to scale the image larger or smaller.</p>
                        <Divider orientation="left">Frames, Walls, Floors and Surrounds</Divider>
                        <p>On different floors in the vault you will find different materials to add to your gallery. There are provided collections of each and you can make your own in the Studio.</p>
                        <p>Click on a material for a frame on wall and then click on the work/s or wall/s you want it applied to. Click back on the tile to cancel.</p>
                        <p>Clicking on a material for the floor or surrounds makes an immediate change.</p>
                        <Divider orientation="left">Lights</Divider>
                        <p>Every time you drag an image onto a wall a spotlight is added to illuminate it. You can move, remove, or add spotlights and change their intensity and color. When on the lighting floor the spotlights will have a cone which you can use as a handle to move around - this might be necessary if you've moved an artwork.</p>
                        <Divider orientation="left">Movement</Divider>
                    </Col>
                </Row>
                <Col span={18}>
                    <Row gutter={16}>
                        <Col span={6} offset={3}>
                        </Col>
                        <Col span={6} style={colStyle}>
                            Move Forward
                        <Title level={3}>W</Title>
                            <CaretUpOutlined style={iconStyle} />
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
                    <Row gutter={[0, 16]}>
                        <Col span={24} style={colStyle}>
                            Move Up
<Title level={3}>R</Title>

                        </Col>
                    </Row>
                    <Row gutter={[0, 16]}>
                        <Col span={24} style={colStyle}>
                            Move Down
<Title level={3}>F</Title>

                        </Col>
                    </Row>
                </Col>
            </Row>
        )
}
