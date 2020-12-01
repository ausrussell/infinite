import React from "react";
import {UploadRapidButton} from "../Uploader";


import { Button } from "antd";

const RapidUploader = ({rapidBuild}) => {
  const buildFloorplan = () => {
    console.log("rapid");
  };
  const makeGalleryCallback = (artItems) => {
    rapidBuild(artItems);
  }
  return <div>
            <UploadRapidButton title="Rapid Upload and Buld" makeGalleryCallback={makeGalleryCallback}

          /></div>;
};

export default RapidUploader;
