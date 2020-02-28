import React from "react";

const GalleryTitle = props => {
  return (
    <input
      type="text"
      value={props.content}
      onChange={props.onTitleChangeHandler}
      className="floorplan-title-field"
      placeholder="Gallery 1"
    />
  );
};

export default GalleryTitle;
