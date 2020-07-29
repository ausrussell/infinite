import React, { useState, useCallback } from "react";
import GalleryList from '../Gallery/GalleryList'
import { Row, Col } from "antd";
// import { withAuthorization } from "../Session";
import GoogleApiWrapper from "./GoogleMap";
import PageTitle from '../Navigation/PageTitle';
import { HangarHelp } from './HangarHelp'
import { withFirebase } from "../Firebase";
import LandingLoading from "./LandingLoading"
import { useSpring, animated, config } from 'react-spring'




const Landing = (props) => {
  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(true)
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState([]);
  const [markerSelected, setMarkerSelected] = useState([]);
  const [images, setImages] = useState([])
  const [springProps, setSpringProps, stopSpringProps] = useSpring(() => ({opacity: 1 }))
  const listCallback = useCallback(
    (galleriesList) => {
      console.log("listCallback", galleriesList)
      setList(galleriesList);
    },
    [],
  );

  const selectCallback = (item) => {
    console.log("selectCallback", item)
    setSelected(item);
  }

  const markerCallback = ({ id }) => {
    const selectedItem = list.filter(item => item.id === id);
    setSelected(selectedItem[0])
    setMarkerSelected(id);
  }

  const artLoadedCallback = (artObj, finished) => {
    console.log("artLoadedCallback", artObj);
    // const newImages = images;
    // newImages.push(artObj)

    setImages([...images, artObj]);
    console.log("finished",finished)
    if (finished) setSpringProps({config: { duration: 1500 },delay: 3000, onRest: () => setLoading(false), opacity: 0 });
  }
  //   <Row >
  //   <Col  flex="0 1 420px" className="gallery-list-column" >
  //     <GalleryList listCallback={listCallback} selectCallback={selectCallback} markerSelected={markerSelected} firebase={props.firebase} />
  //   </Col>
  //   <Col flex="auto"><GoogleApiWrapper listLength={list.length} list={list} selected={selected} markerCallback={markerCallback} /></Col>
  // </Row>


  return (
    <div>
      <PageTitle help={HangarHelp} />
      {loading && <animated.div
      className="landing-holder"
        style={springProps}>
        <LandingLoading images={images} />
      </animated.div>
    }
      <Row >
        <Col flex="0 1 420px" className="gallery-list-column" >
          <GalleryList listCallback={listCallback} selectCallback={selectCallback} markerSelected={markerSelected} artLoadedCallback={artLoadedCallback} firebase={props.firebase} />
        </Col>
        <Col flex="auto"><GoogleApiWrapper listLength={list.length} list={list} selected={selected} markerCallback={markerCallback} /></Col>
      </Row>
    </div>)
}

// const condition = authUser => !!authUser;

export default withFirebase(Landing);
