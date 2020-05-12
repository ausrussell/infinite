import React from 'react';
import { Row, Col, Divider } from "antd";


export const PlannerHelp = {
    title: 'Making a Floorplan',
    showOnce: true,
    width: "60vw",
    content:
        (<div><Row>
            <Col span={16} offset={4}>
                <Divider orientation="left">Adding art</Divider>
                <ul style={{ fontSize: 22 }}>
                    <li>click to add a wall</li>
                    <li>drag mouse while clicked to extend wall</li>
                    <li>shift + click to remove wall</li>
                </ul>
            </Col>
        </Row>
            <Row>
                <Col span={16} offset={4} style={{ fontSize: 18 }}>
                    <Divider orientation="left">Once saved...</Divider>
                    <p>Your saved Floorplans are added to your vault at the bottom right of screen.</p>
                    <p>Clicking the icons for a floorplan there let's you edit, delete or build them into a gallery.</p>
                    <p>Editting a floorplan won't change a gallery you've already built with it.</p>
                </Col>
            </Row>
        </div>

        )
}
