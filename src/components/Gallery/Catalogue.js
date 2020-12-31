import React, { useState, useEffect } from "react";
import { withFirebase } from "../Firebase";
import { Button, List, Typography, message, Divider, Popover } from "antd";
import { DownOutlined, StarOutlined, StarFilled } from "@ant-design/icons";
import moment from "moment";
import { ArtDetailsList } from "./ArtDetails";
const { Paragraph } = Typography;

const IconText = ({ icon, text, borrowClickHandler }) => (
  <div onClick={borrowClickHandler}>
    {icon}&nbsp;
    {text}
  </div>
);

const Catalogue = ({ galleryData, owner, firebase, changeGallery }) => {
  const [catalogueData, setCatalogueData] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [counter, setCounter] = useState(0);
  const [borrowedCounter, setBorrowedCounter] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const itemsArray = [];
    let artCounter = 0;

    const getArtForCatalogueDetail = (key, type) => {
      const refPath = "users/" + owner + "/" + type + "/" + key;

      const options = {
        refPath: refPath,
        once: true,
        callback: setArtForCatalogue,
      };
      const assetCall = firebase.getAsset(options);
      console.log("assetCall", assetCall);
    };
    const getBorrowedArtForCatalogueDetail = (key, type) => {
      const refPath = `users/${owner}/${type}/${key}`;

      const options = {
        refPath: refPath,
        once: true,
        callback: setBorrowedArt,
      };
      const assetCall = firebase.getAsset(options);
      console.log("assetCall", assetCall);
    };

    const setBorrowedArt = (snap) => {
      const snapVal = snap.val();
      console.log("borrowed Snap", snapVal);
      if (snapVal) {
        const refPath = `users/${snapVal.owner}/art/${snapVal.key}`;
        const callback = (ownersSnap) => {
          const ownersSnapVal = ownersSnap.val();
          console.log("ownersSnapVal", ownersSnapVal);
          const combinedSnapVal = Object.assign(snapVal, ownersSnapVal);
          console.log("combinedSnapVal", combinedSnapVal);
          setArtForCatalogue(combinedSnapVal);
        };

        const options = {
          refPath: refPath,
          once: true,
          callback: callback,
        };
        firebase.getAsset(options);
      }
    };

    const setArtForCatalogue = (snap) => {
      const snapVal = snap.val ? snap.val() : snap;
      let duplicateArray = itemsArray.filter((item) => item.key === snap.key);
      if (duplicateArray.length > 0 || !snapVal) artCounter--; //maybe add || !snapVal
      if (snapVal && duplicateArray.length === 0) {
        snapVal.key = snap.key;
        if ("borrowedBy" in snapVal) {
          snapVal.borrowersNumber = Object.keys(snapVal.borrowedBy).length;
          console.log("snapVal", snapVal);
          snapVal.borrowersNames = Object.values(snapVal.borrowedBy).map(
            (item) => item.borrowerDisplayName
          );
        }
        itemsArray.push(snapVal);
        if (itemsArray.length === artCounter) {
          setCatalogueData(itemsArray);
        }
      }
    };

    const setCatalogue = () => {
      if (galleryData.art) {
        artCounter = galleryData.art.length;
        if (galleryData.borrowedArt) {
          console.log("galleryData.borrowedArt", galleryData.borrowedArt);
          artCounter += galleryData.borrowedArt.length;
          galleryData.borrowedArt.forEach((art) => {
            getBorrowedArtForCatalogueDetail(art, "borrowed-art");
          });
        }
        galleryData.art.forEach((art) => {
          getArtForCatalogueDetail(art, "art");
        });
      }
    };
    setCatalogue();
  }, [owner, galleryData, galleryData.galleryKey, borrowedCounter]);

  const borrowClickHandler = (item) => {
    console.log("borrowClickHandler", item);
    const type = "art";
    const path = `borrowed-${type}/${item.key}`;
    let options = {};
    const borrowFlag = !(
      item.borrowedBy && item.borrowedBy[firebase.currentUID]
    ); //borrowing or removing
    if (borrowFlag) {
      console.log("borrow", item);
      options = {
        borrowed: moment().format("MMMM Do YYYY, h:mm:ss a"),
        borrower: firebase.currentUID,
        borrowerDisplayName: firebase.currentUser.displayName,
        owner: owner,
        galleryKey: galleryData.galleryKey,
        galleryTitle: galleryData.title,
        nameEncoded: galleryData.nameEncoded,
        ownerDisplayName: galleryData.userDisplayName,
        type: type,
      };
      Object.assign(options, item);
    }
    var updates = {};
    const borrowerPath = "users/" + firebase.currentUID + "/" + path;
    updates[borrowerPath] = options;
    const itemPath = `${type}/${item.key}/borrowedBy/${firebase.currentUID}`;
    const itemRefPath = `users/${owner}/${itemPath}`;
    updates[itemRefPath] = options;
    firebase.updateAssets(updates).then(() => {
      setBorrowedCounter(borrowedCounter + 1);
      message.success(
        <>
          <span style={{ color: "#000" }}>{item.title}</span> succesfully{" "}
          {borrowFlag ? "added to" : "removed from"} your vault!
        </>
      );
    });
  };
  const toggleExpanded = () => {
    expanded && setCounter(counter + 1);
    setExpanded(expanded ? false : true);
  };

  const renderItem = (item, i) => {
    const borrowedByCurrent =
      item.borrowedBy && item.borrowedBy[firebase.currentUID];
    const icon = borrowedByCurrent
      ? React.createElement(StarFilled, { style: { color: "#ff8f00" } })
      : React.createElement(StarOutlined);
    let shareable;
    if (item.borrowed) {
      shareable = <p>Visit Gallery to borrow</p>;
    } else {
      shareable = item.shareable ? (
        <IconText
          icon={icon}
          borrowedByCurrent={borrowedByCurrent}
          text={borrowedByCurrent ? "Unborrow Work" : "Borrow Work"}
          key="list-vertical-star-o"
          borrowClickHandler={() => borrowClickHandler(item)}
        />
      ) : (
        <span>Unavailable for borrowing</span>
      );
    }
    return (
      <List.Item
        className="gallery-list-item-holder"
        key={`art-${i}`}
        extra={
          <div className="gallery-list-item-image">
            <img src={item.thumb || item.url} alt={item.title} />
          </div>
        }
        actions={[shareable]}
      >
        <ArtDetailsList selectedArt={item} changeGallery={changeGallery} />
      </List.Item>
    );
  };

  const catalogue = (
    <div
      style={{
        width: "75vw",
        maxHeight: "75vh",
        overflow: "auto",
        maxWidth: 800,
      }}
    >
      <div key={counter}>
        <Paragraph
          strong
          ellipsis={{
            rows: 8,
            expandable: true,
            symbol: "Expand",
            onExpand: toggleExpanded,
          }}
        >
          {galleryData.description}
          {expanded && (
            <span>
              <Button
                type="link"
                style={{ float: "right" }}
                onClick={toggleExpanded}
              >
                Reduce Text
              </Button>
            </span>
          )}
        </Paragraph>
      </div>
      <Divider style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }} />
      <List
        style={{ clear: "both" }}
        itemLayout="vertical"
        size="large"
        dataSource={catalogueData}
        renderItem={renderItem}
      ></List>
    </div>
  );

  return (
    <Popover
      content={catalogue}
      trigger="click"
      placement="bottom"
      visible={visible}
      onVisibleChange={(s) => setVisible(s)}
    >
      <DownOutlined style={{ marginLeft: 16 }} />
    </Popover>
  );
};

export default withFirebase(Catalogue);
