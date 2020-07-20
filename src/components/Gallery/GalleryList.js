import React, { createRef, useState, useRef, useEffect } from "react";

import { useSpring, animated } from 'react-spring'

import { List } from 'antd';
import { EnvironmentOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Route } from "react-router-dom";
import { withRouter } from "react-router-dom";

import { Typography } from 'antd';
const { Paragraph } = Typography;

const galleryPlaceholder = 'https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Fhanger_placeholder.png?alt=media&token=4f847f15-48d6-43d9-92df-80eea32394f5';

const GalleryList = ({ listCallback, firebase, selectCallback, markerSelected, history }) => {
  const [galleriesList, setGalleriesList] = useState([]);
  const [selectedListItem, setSelectedListItem] = useState({ old: null, new: null });

  const galleriesRefs = useRef([])
  const [springProps, setSpringProps, stopSpringProps] = useSpring(() => ({ scroll: 1 }))
  const { getList, getAssetOnce } = firebase
  useEffect(() => {

    const fillList = async (data) => {
      console.log("Galleries callback", data);
      const list = [];
      if (data) {
        data.forEach((childSnapshot) => {
          const snap = childSnapshot.val();
          snap.ref = createRef();
          galleriesRefs.current.push(snap.ref);
          snap.id = childSnapshot.key
          if (snap.art) {
            const parts = snap.dataPath.split("/");
            const newPath = parts[0] + "/" + parts[1] + "/art/" + snap.art[Math.floor(Math.random() * snap.art.length)]
            const options = {
              refPath: newPath,
              once: true,
              extras: snap,
              callback: (snap2, extras) => {
                debugger;
                console.log("addImages", snap2.val(), extras)
              },
              // orderField: "title"
            }
            snap.call = getAssetOnce(options)
            list.push(snap);

          } else {
            list.push(snap);
          }

        });
      }
      console.log("Galleries plansCallback", list);
      setGalleriesList(list);
      listCallback(list);
    };
    const dbCall = async () => {
      const options = {
        refPath: "publicGalleries",
        callback: fillList,
        orderField: "title"
      }
      getList(options);
    }
    dbCall();
  }, [getList, listCallback]);

  // const resetMarkerSelected = useCallback(itemSelected => {
  //   selectedListItem && selectedListItem.classList.remove("gallery-list-item--selected");
  //   setSelectedListItem(itemSelected)}, )

  useEffect(() => {
    console.log("useEffect galleriesList", galleriesList)
  }, [galleriesList])



  useEffect(() => {
    console.log("useEffect props.markerSelected", markerSelected, galleriesRefs.current);
    const resetItemSelected = itemSelected => {
      selectedListItem.new && selectedListItem.new.current.classList.remove("gallery-list-item--selected");
      setSelectedListItem({ new: itemSelected })
    }
    const doSelect = () => {
      const markerSelected2 = galleriesRefs.current.filter(item => item.current.id === markerSelected);
      if (markerSelected2.length) {
        const itemSelected = markerSelected2[0];
        console.log("itemSelected", itemSelected)
        setSpringProps({ scroll: itemSelected.current.offsetTop });
        resetItemSelected(itemSelected)
        // selectedListItem.new && selectedListItem.new.current.classList.remove("gallery-list-item--selected");
        // setSelectedListItem({ new: itemSelected })
      }
    }
    doSelect();
  }, [markerSelected, setSpringProps]);



  useEffect(() => {
    console.log("useEffect selectedListItem.new", selectedListItem.new)
    if (selectedListItem.new) {
      selectedListItem.new.current.classList.add("gallery-list-item--selected");
    }
  }, [selectedListItem.new]);

  const onClickHandler = (action, item, ref) => {
    console.log("e", action, item, ref)
    if (action === "Locate") {
      // resetMarkerSelected(getItemFromId(item.id))
      // debugger;
      selectedListItem.new && console.log("selectedListItem.new && selectedListItem.new.current", selectedListItem.new, selectedListItem.new.current)
      selectedListItem.new && selectedListItem.new.current.classList.remove("gallery-list-item--selected");

      setSelectedListItem({ new: ref })

      selectCallback(item);
    }

    if (action === "Visit") {
      const { history, nameEncoded } = item
      history.push({ pathname: "/Gallery/" + nameEncoded })
    }

  }
const onContainerClickHandler = (e,item,ref) => {
      const {nameEncoded} = item;
      if (e.target.classList[0] === "ant-list-item-meta-title") history.push({ pathname: "/Gallery/" + nameEncoded })
}

  return (
    <animated.div
      scrollTop={springProps.scroll}
      onWheel={stopSpringProps}
      className="gallery-list-holder">
      <List
        itemLayout="vertical"
        dataSource={galleriesList}
        renderItem={item => {
          return <GalleryListItem item={item} onClickHandler={onClickHandler} onContainerClickHandler={onContainerClickHandler} ref={item.ref} />
        }}
      />
    </animated.div>
  );
}

const GalleryListItem = React.forwardRef((props, ref) => {
  const [art, setArt] = useState();

  const { item, onClickHandler, onContainerClickHandler } = props;
  const galleryImg = (item.galleryImg) ? item.galleryImg.thumb || item.galleryImg.url : galleryPlaceholder;
  if (item.call && !art) {
    item.call.then((snap) => {
      const artItem = snap.val()
      artItem && setArt(artItem.thumb || artItem.url)
    })
  }
  const artToShow = art || galleryImg;
  return <div ref={ref}
    id={item.id}
    className="gallery-list-item-holder"
    onClick={(e) => onContainerClickHandler(e, item, ref)}
    >
    <List.Item
      className="gallery-list-item"
      extra={
        <div style={{
          backgroundImage: "url(" + artToShow + ")"
        }}
          className="gallery-list-item-image"

        ></div>
      }
      actions={[
        <span className="icon-link" onClick={() => onClickHandler("Locate", item, ref)}><EnvironmentOutlined key="list-vertical-star-o" style={{ marginRight: 8 }} />Locate</span>,
        <Route
          path="/"
          render={routeProps => {
            Object.assign(routeProps, item);
            return <span className="icon-link" onClick={() => onClickHandler("Visit", routeProps)} ><ArrowRightOutlined key="list-vertical-star-o" style={{ marginRight: 8 }} />Visit</span>;
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
  </div>;


})

export default withRouter(GalleryList);
