import React from "react";

import { withAuthorization } from "../Session";
import GalleryList from "../Gallery/GalleryList";
import { Row, Col, Card } from "antd";

const HomePage = () => (
  <div>
    <h1>Home Page</h1>
    <Row>
      <Col span={12} offset={6} className="center-standard-form">
        <Card title="Galleries">
          <Card type="inner" title="All Galleries">
            <GalleryList />
          </Card>
        </Card>
      </Col>
    </Row>
  </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(HomePage);
