import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import { Button, Row, Col } from "antd";

import PageTitle from "../../Navigation/PageTitle";
import { BuilderHelp } from "../BuilderHelp";

import GallerySelect from "../../Gallery/GallerySelect";
// import FloorplanDropdown from "../../Planner/FloorplanDropdown";

const DropdownHeader = (props) => {
  useEffect(() => {
    console.log("drop props", props);
    // const updateFields = () => {
    //   setTitle(galleryDesc.title);
    //   setCurrentGalleryDesc(galleryDesc);
    // };
    // updateFields();
  }, []);
  //   {title ? "Building gallery: " + title : "Build a gallery"}
  return (
    <div className="page-header-area">
      <PageTitle title="title" help={BuilderHelp} />

      <Row gutter={16}>
        {/* <Col flex="1">
            <FloorplanDropdown
              floorplanCallback={floorplanCallback}
              galleryDesc={currentGalleryDesc}
              id={id}
              floorplan={floorplan}
              setFloorplans={setFloorplans}
            />
          </Col> */}
        <Col className="header-button-col" flex="200px">
          {/* <div className="header-tile-title">or...</div>
            <div>
              <UploadRapidButton rapidBuild={rapidBuild} />
            </div>
            <div style={{ marginTop: 15 }}>
              <Button onClick={buildFloorplan}>Create a Floorplan</Button>
            </div> */}

          <div style={{ marginTop: 15 }}>
            <GallerySelect
            // callback={changeGallery}
            // galleryDesc={currentGalleryDesc}
            // id={galleryId}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (state) => {
  console.log("DropdownHeader state ", state);
  return state;
};

export default connect(mapStateToProps)(DropdownHeader);
