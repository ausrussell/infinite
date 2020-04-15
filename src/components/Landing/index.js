import React, {useState} from "react";

import GalleryList from '../Gallery/GalleryList'
import { Row, Col } from "antd";
import { withAuthorization } from "../Session";

import GoogleApiWrapper from "./GoogleMap";


const Landing = () => {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState([]);
  const listCallback= (list) => {
    console.log("Landing list",list)
    setList(list)
  }
  const selectCallback = (item) => {
    setSelected(item)
  }
  return (
  <div style={{ height: "100%" }}>
    <h1>Hanger</h1>
    <p>The Home Page is accessible by every signed in user.</p>
    <Row style={{ height: "100%" }}>
      <Col span="10" style={{ height: "100%" }}>
        <GalleryList listCallback={listCallback} selectCallback={selectCallback}/>
      </Col>
      <Col span="14"><GoogleApiWrapper list={list} selected={selected} /></Col>
    </Row>
  </div>)
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Landing);
