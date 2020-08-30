import React, { createRef, useState, useRef, useEffect } from "react";

import { useSpring, animated } from 'react-spring'

import { List } from 'antd';
import { EnvironmentOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Route } from "react-router-dom";
import { withRouter } from "react-router-dom";

import { Typography } from 'antd';
const { Paragraph } = Typography;

const galleryPlaceholder = 'https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Fhanger_placeholder.png?alt=media&token=4f847f15-48d6-43d9-92df-80eea32394f5';

const GalleryList = ({ listCallback, firebase, selectCallback, markerSelected, history, artLoadedCallback }) => {
  const [galleriesList, setGalleriesList] = useState([]);
  const [selectedListItem, setSelectedListItem] = useState({ new: null });
  const [oldSelectedListItem, setOldSelectedListItem] = useState();
  const galleriesRefs = useRef([])
  const [springProps, setSpringProps, stopSpringProps] = useSpring(() => ({ scroll: 1 }))
  const { getList, getAssetOnce } = firebase;
  const [loadedCounter, setLoadedCounter] = useState(0)
  useEffect(() => {//malfunctions after editing a gallery
    const fillList = async (data) => {
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
  }, [getList, getAssetOnce, listCallback]);

  selectedListItem.new && selectedListItem.new.current && setSpringProps({ scroll: selectedListItem.new.current.offsetTop });

  useEffect(() => {
    const doSelect = () => {
      console.log("galleriesRefs.current,galleriesRefs",galleriesRefs.current,galleriesRefs)
      const markerSelected2 = galleriesRefs.current.filter(item => item.current.id === markerSelected);
      if (markerSelected2.length) {
        const itemSelected = markerSelected2[0];
        setSelectedListItem({ new: itemSelected });
      }
    }
    doSelect();
    
  }, [markerSelected]);

  useEffect(() => {
    if (oldSelectedListItem) {
      oldSelectedListItem.current.classList.remove("gallery-list-item--selected")
    }
    if (selectedListItem.new) {
      selectedListItem.new.current.classList.add("gallery-list-item--selected");
    }
    setOldSelectedListItem(selectedListItem.new)
  }, [oldSelectedListItem, selectedListItem.new]);

  const onClickHandler = (action, item, ref) => {
    console.log("e", action, item, ref)
    if (action === "Locate") {
      selectCallback(item);
    }

    if (action === "Visit") {
      const { history, nameEncoded } = item
      history.push({ pathname: "/Gallery/" + nameEncoded })
    }
  }

  const onContainerClickHandler = (e, item, ref) => {
    const { nameEncoded } = item;
    if (e.target.classList[0] === "ant-list-item-meta-title") history.push({ pathname: "/Gallery/" + nameEncoded })
  }

  const artLoadedListCallback = item => {
    artLoadedCallback(item, loadedCounter + 2 === galleriesList.length)
    setLoadedCounter(loadedCounter + 1);

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
          return <GalleryListItem item={item} artLoadedListCallback={artLoadedListCallback} onClickHandler={onClickHandler} onContainerClickHandler={onContainerClickHandler} ref={item.ref} />
        }}
      />
    </animated.div>
  );
}

const GalleryListItem = React.forwardRef((props, ref) => {
  const [art, setArt] = useState();

  const { item, onClickHandler, onContainerClickHandler, artLoadedListCallback } = props;
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
        <div className="gallery-list-item-image">
          <img src={artToShow}
            onLoad={(e) => {
              artLoadedListCallback(e.target);
            }}
            alt={item.title} />
        </div>
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
