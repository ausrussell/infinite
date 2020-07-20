import React, { useState, useCallback } from "react";
import GalleryList from '../Gallery/GalleryList'
import { Row, Col } from "antd";
// import { withAuthorization } from "../Session";
import GoogleApiWrapper from "./GoogleMap";
import PageTitle from '../Navigation/PageTitle';
import {HangarHelp} from './HangarHelp'
import { withFirebase } from "../Firebase";


const Landing = (props) => {
  const [list, setList] = useState([]);
  // const [listLength, setListLength] = useState([]);

  const [selected, setSelected] = useState([]);
  const [markerSelected, setMarkerSelected] = useState([]);

  // const listCallback = useCallback(
  //   () => {
  //   console.log("Landing list", list)
  //   setList(list)}, [list])
  // }

  const listCallback = useCallback(
    (galleriesList) => {
      console.log("listCallback",galleriesList)
      setList(galleriesList);
    },
    [],
  );

  const selectCallback = (item) => {
    console.log("selectCallback",item)
    setSelected(item);
    // setMarkerSelected(item.id);
  }
  const markerCallback = ({id}) => {
    const selectedItem = list.filter(item => item.id === id);
    setSelected(selectedItem[0])
    setMarkerSelected(id);
  }
  return (
    <div>
      <PageTitle title={'Hangar'} help={HangarHelp} />
      <Row>
        <Col  flex="0 1 420px" className="gallery-list-column" >
          <GalleryList listCallback={listCallback} selectCallback={selectCallback} markerSelected={markerSelected} firebase={props.firebase} />
        </Col>
        <Col flex="auto"><GoogleApiWrapper listLength={list.length} list={list} selected={selected} markerCallback={markerCallback} /></Col>
      </Row>
    </div>)
}

// const condition = authUser => !!authUser;

export default withFirebase(Landing);
