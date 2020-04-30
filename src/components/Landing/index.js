import React, { useState } from "react";
import GalleryList from '../Gallery/GalleryList'
import { Row, Col } from "antd";
import { withAuthorization } from "../Session";
import GoogleApiWrapper from "./GoogleMap";
import PageTitle from '../Navigation/PageTitle';
import {HangarHelp} from './HangarHelp'

const Landing = () => {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState([]);
  const listCallback = (list) => {
    console.log("Landing list", list)
    setList(list)
  }
  const selectCallback = (item) => {
    setSelected(item)
  }
  return (
    <div>
      <PageTitle title={'Hangar'} help={HangarHelp} />
      <Row>
        <Col span="10" style={{ 
        height:'calc(100vh - 126px)', overflow:"auto" }}>
          <GalleryList listCallback={listCallback} selectCallback={selectCallback} />
        </Col>
        <Col span="14"><GoogleApiWrapper list={list} selected={selected} /></Col>
      </Row>
    </div>)
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Landing);
