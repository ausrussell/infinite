import React, { Component, useState, useEffect } from "react";
import { withFirebase } from "../Firebase";
import ThreeAssetPreview from './ThreeAssetPreview';

const FrameMaker =  (props) => {
console.log("FrameMaker props", props)
    return (<ThreeAssetPreview props={props} item={props.item} type="frame" />)
}

export default withFirebase(FrameMaker);