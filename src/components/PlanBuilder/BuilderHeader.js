import React, { useState, useEffect } from "react";

import { withFirebase } from "../Firebase";
import { connect } from "react-redux";

import { compose } from "recompose";
import { Button, Row, Col } from "antd";
import GalleryEditDropdown from "../Gallery/GalleryEditDropdown";
import PageTitle from "../Navigation/PageTitle";
import { BuilderHelp } from "./BuilderHelp";
import FloorplanDropdown from "../Planner/FloorplanDropdown";
import { isNil } from "lodash";
import _ from "lodash";
import * as ROUTES from "../../constants/routes";

import { withRouter } from "react-router-dom";
// import RapidUploader from "./RapidUploader";
import { UploadRapidButton } from "../Uploader";
import DetailsDropdownForm from "./DetailsHeader";
import {createScene,createSceneData} from "../../redux/actions"
// import {createScene, addSculptures, addSculpture} from "../../redux/actions"


const BuilderHeader = ({
  history,
  firebase,
  galleryDesc,
  galleryId,
  onEditDropdownChangeHandler,
  saveGallery,
  floorplan,
  floorplanSelectedHandler,
  createSceneData
}) => {
  // console.log("BuilderHeader props", props)
  const [title, setTitle] = useState(galleryDesc.title || "");
  const [id, setId] = useState("");
  const [currentGalleryDesc, setCurrentGalleryDesc] = useState({});
  const [curatorsUID, setCuratorsUID] = useState(false); //??
  const [floorplans, setFloorplans] = useState(false);

  useEffect(() => {
    const updateFields = () => {
      setTitle(galleryDesc.title);
      setCurrentGalleryDesc(galleryDesc);
    };
    updateFields();
  }, [galleryId]);


  const removeEmptyObjects = (obj) => {
    return _(obj)
      .pickBy(_.isObject) // pick objects only
      .mapValues(removeEmptyObjects) // call only for object values
      .omitBy(_.isEmpty) // remove all empty objects
      .assign(_.omitBy(obj, _.isObject)) // assign back primitive values
      .omitBy(isNil) // remove all empty objects
      .value();
  };

  const editCallback = (data) => {
    if (galleryId) {
      // checkForChanges(data, () => {
      onEditDropdownChangeHandler(data);
      // });
    } else {
      onEditDropdownChangeHandler(data);
    }
  };

  const floorplanCallback = (data) => {
    console.log("floorplanCallback data", data);
    if (galleryId) {
      // checkForChanges(data, () => {
      floorplanSelectedHandler(data);
      // });
    } else {
      floorplanSelectedHandler(data);
    }
  };

  const closeGallery = () => {
    console.log("closeGallery");
    onEditDropdownChangeHandler({ id: null });
  };

  const buildFloorplan = () => history.push(ROUTES.PLANNER);

  const rapidBuild = (artItems) => {
    console.log("floorplans", floorplans, artItems);
    console.log(
      "firebase.currentUser.displayName",
      firebase.currentUser.displayName
    );
    floorplanSelectedHandler(floorplans[4], artItems);
  };

  const changeGallery = ({galleryData}) => {
    console.log("changeGallery",galleryData);
    createSceneData(galleryData)
  }

  return (
    <div className="page-header-area">
      <PageTitle
        title={title ? "Building gallery: " + title : "Build a gallery"}
        help={BuilderHelp}
      />

     
        <DetailsDropdownForm
          id={galleryId}
          galleryDesc={currentGalleryDesc}
          floorplan={floorplan}
          saveGallery={saveGallery}
          closeGallery={closeGallery}
        />


      {!galleryId && (
        <Row gutter={16}>
          <Col flex="1">
            <FloorplanDropdown
              floorplanCallback={floorplanCallback}
              galleryDesc={currentGalleryDesc}
              id={id}
              floorplan={floorplan}
              setFloorplans={setFloorplans}
            />
          </Col>
          <Col className="header-button-col" flex="200px">
            <div className="header-tile-title">or...</div>
            <div>
              <UploadRapidButton rapidBuild={rapidBuild} />
            </div>
            <div style={{ marginTop: 15 }}>
              <Button onClick={buildFloorplan}>Create a Floorplan</Button>
            </div>

            <div style={{ marginTop: 15 }}>
              <GalleryEditDropdown
                callback={changeGallery}
                galleryDesc={currentGalleryDesc}
                id={galleryId}
              />
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default compose(connect(null, {createSceneData}), withRouter, withFirebase)(BuilderHeader);
// export default withFirebase(BuilderHeader);
