import React, { Component } from "react";
// import { compose } from "recompose";
// import { FirebaseContext } from "../Firebase";
import { withFirebase } from "../Firebase";
import { Row, Col, Card } from "antd";
import Uploader from "../Uploader";

const CubeBox = () => {
  const dragOverHandler = e => {
    console.log("cubebox over", e, e.target);
  };
  const fileDragLeaveHandler = e => {
    console.log("CubeBox fileDragLeaveHandler", e);
  };

  const fileDropHandler = (item, uploadTask) => {
    console.log("fileDropHandler item, uploadTask", item, uploadTask);
  };

  const fileLoadedHandler = (item, uploadTask) => {
    console.log("CubeBox:: fileLoadedHandler item, uploadTask", item, uploadTask);
  };
  // fileDragLeaveHandler={this.fileDragLeaveHandler}
  // fileDrop={(item, uploadTask) => this.fileDropHandler(item, uploadTask)}
  // wallOver={this.state.wallOver}
  return (
    <div>
      <div>Drag Folders to upload Cube boxes</div>
      <Uploader
        button="Upload zip"
        fileDragover={dragOverHandler}
        fileDragLeaveHandler={fileDragLeaveHandler}
        fileDrop={(item, uploadTask) => fileDropHandler(item, uploadTask)}
        fileLoadedHandler={fileLoadedHandler}
        type="cubebox"
      />
    </div>
  );
};

const StudioPage = () => {
  console.log("StudioPage");
  return (
    <div>
      <h1>Studio</h1>

      <Row>
        <Col span={12} offset={6} className="center-standard-form">
          <Card title="Studio">
            <Card type="inner">
              <div>Here you can upload resources for your galleries.</div>
            </Card>
            <Card type="inner" title="CubeBox uploader">
              <CubeBox />
            </Card>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default withFirebase(StudioPage);
