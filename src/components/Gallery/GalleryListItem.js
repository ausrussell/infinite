import React from "react";
import { List, Typography } from "antd";
import { withRouter } from "react-router-dom";

const { Paragraph } = Typography;

const GalleryListItem = ({ data, history }) => {
  // const { data } = props;
  const item = data;
  const onContainerClickHandler = (e) => {
    const { nameEncoded } = item;
    // console.log("onContainerClickHandler", e, item)
    if (
      e.target.src ||
      e.target.classList[0] === "ant-list-item-meta-title" ||
      e.target.classList[0] === "gallery-list-item-image"
    ) {
      history.push({ pathname: "/Gallery/" + nameEncoded });
    }
  };
  return (
    <div
      // ref={ref}
      // id={item.id}
      className="gallery-list-item-holder"
      onClick={(e) => onContainerClickHandler(e)}
    >
      <List.Item
        className="gallery-list-item"
        extra={
          <div className="gallery-list-item-image">
            <img
              src={item.galleryImg.thumb || item.galleryImg.url}
              //   onLoad={(e) => {
              //     artLoadedListCallback(e.target);
              //   }}
              alt={item.title}
            />
          </div>
        }
      >
        <List.Item.Meta
          title={item.title}
          description={
            <div>
              {item.userDisplayName && (
                <p>Built by YYY: {item.userDisplayName}</p>
              )}
              <Paragraph ellipsis={{ rows: 5, expandable: true }}>
                {item.description}
              </Paragraph>
            </div>
          }
        />
      </List.Item>
    </div>
  );
};

export default withRouter(GalleryListItem);
