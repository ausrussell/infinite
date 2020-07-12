import React, { createRef, useState, useRef, useEffect } from "react";

import { useSpring, animated } from 'react-spring'

import { withFirebase } from "../Firebase";
import { List } from 'antd';
import { EnvironmentOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Route } from "react-router-dom";
import { Typography } from 'antd';
const { Paragraph } = Typography;

const galleryPlaceholder = 'https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Fhanger_placeholder.png?alt=media&token=4f847f15-48d6-43d9-92df-80eea32394f5';

const GalleryList = props => {
  const [galleriesList, setGalleriesList] = useState([]);
  const [selectedListItem, setSelectedListItem] = useState();

  const galleriesRefs = useRef([])
  const [springProps, setSpringProps, stopSpringProps] = useSpring(() => ({ scroll: 1 }))

  useEffect(() => {
    const options = {
      refPath: "publicGalleries",
      callback: fillList,
      orderField: "title"
    }
    galleriesList.length === 0 && props.firebase.getList(options);
    console.log("db called")
  }, [props.selectCallback]);

  useEffect(() => {
    console.log("useEffect props.markerSelected", props.markerSelected);
    const markerSelected = galleriesRefs.current.filter(item => item.current.id === props.markerSelected);
    if (markerSelected.length) {
      const itemSelected = markerSelected[0].current.parentElement.parentElement

      setSpringProps({ scroll: itemSelected.offsetTop });
      resetMarkerSelected(itemSelected);
    }
  }
    , [props.markerSelected]);

  const resetMarkerSelected = itemSelected => {
    selectedListItem && selectedListItem.classList.remove("gallery-list-item--selected");
    setSelectedListItem(itemSelected);

  }

  useEffect(() => {
    console.log("useEffect selectedListItem", selectedListItem);
    if (selectedListItem) {
      selectedListItem.classList.add("gallery-list-item--selected");
    }
  }
    , [selectedListItem]);

const getItemFromId = id => {
  const markerSelected = galleriesRefs.current.filter(filterItem => filterItem.current.id === id);
  return  (markerSelected.length) ? markerSelected[0].current.parentElement.parentElement : null
}


  const onClickHandler = (action, item) => {
    console.log("e", action, item)
    if (action === "Locate") {
      resetMarkerSelected(getItemFromId(item.id))
      props.selectCallback(item);
    }

    if (action === "Visit") {
      const { history, nameEncoded } = item
      history.push({ pathname: "/Gallery/" + nameEncoded })
    }

  }

  const fillList = data => {
    console.log("Galleries callback", data);
    const list = [];
    if (data) {
      data.forEach((childSnapshot) => {
        const snap = childSnapshot.val();
        snap.ref = createRef();
        galleriesRefs.current.push(snap.ref);
        snap.id = childSnapshot.key
        list.push(snap);
      });
    }
    console.log("Galleries plansCallback", list);
    setGalleriesList(list);
    props.listCallback(list)
  };
  return (
    <animated.div
      scrollTop={springProps.scroll}
      onWheel={stopSpringProps}
      className="gallery-list-holder">
      <List
        itemLayout="vertical"
        dataSource={galleriesList}
        renderItem={item => {
          return <GalleryListItem item={item} onClickHandler={onClickHandler} ref={item.ref} />
        }}
      />
    </animated.div>
  );
}

const GalleryListItem = React.forwardRef((props, ref) => {
  const { item, onClickHandler } = props;
  const galleryImg = (item.galleryImg) ? item.galleryImg.thumb : galleryPlaceholder;
  return (
    <List.Item
      className="gallery-list-item"
      extra={
        <div style={{
          backgroundImage: "url(" + galleryImg + ")"
        }}
          className="gallery-list-item-image"
          ref={ref}
          id={item.id}
        />
      }
      actions={[
        <span onClick={() => onClickHandler("Locate", item)}><EnvironmentOutlined key="list-vertical-star-o" style={{ marginRight: 8 }} />Locate</span>,
        <Route
          path="/"
          render={routeProps => {
            Object.assign(routeProps, item);
            return <span onClick={() => onClickHandler("Visit", routeProps)} ><ArrowRightOutlined key="list-vertical-star-o" style={{ marginRight: 8 }} />Visit</span>;
          }}

        />
      ]}
    >
      <List.Item.Meta
        title={item.title}
        description={<div>{item.userDisplayName && <p>Built by: {item.userDisplayName}</p>}
          <Paragraph ellipsis={{ rows: 5, expandable: true }}>{item.description}</Paragraph>
        </div>}
      />
    </List.Item>
  )
})

export default withFirebase(GalleryList);
