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
  const [markerSelected, setMarkerSelected] = useState([]);

  const listCallback = (list) => {
    console.log("Landing list", list)
    setList(list)
  }
  const selectCallback = (item) => {
    setSelected(item)
  }
  const markerCallback = ({id}) => {
    console.log("markerCallback",id);
    setMarkerSelected(id)
  }
  return (
    <div>
      <PageTitle title={'Hangar'} help={HangarHelp} />
      <Row>
        <Col  flex="0 1 420px">
          <GalleryList listCallback={listCallback} selectCallback={selectCallback} markerSelected={markerSelected} />
        </Col>
        <Col flex="auto"><GoogleApiWrapper list={list} selected={selected} markerCallback={markerCallback} /></Col>
      </Row>
    </div>)
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Landing);
