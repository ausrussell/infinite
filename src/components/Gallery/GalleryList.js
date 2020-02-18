import React, { Component } from "react";

import { withFirebase } from "../Firebase";
// import { Row, Col, Card } from "antd";

const GalleryListItem = props => {
  console.log("props.data", props.data);
  const galleryData = props.data.val();
  const { key } = props.data;
  console.log("key, galleryData", key, galleryData);
  const { name, nameEncoded } = galleryData;
  return (
    <li>
      <a href={"./gallery/" + nameEncoded}>{name}</a>
    </li>
  );
};

class GalleryList extends Component {
  state = {
    galleriesList: []
  };

  componentDidMount() {
    this.props.firebase.getGalleryList(this.fillList);
  }

  fillList = data => {
    console.log("Galleries callback", data);
    const list = [];
    if (data) {
      data.forEach(function(childSnapshot) {
        list.push(childSnapshot);
      });
    }
    this.setState({ galleriesList: list });
    console.log("Galleries plansCallback", list);
  };
  render() {
    return (
      <ul>
        {this.state.galleriesList.map(data => (
          <GalleryListItem data={data} key={data.key} />
        ))}
      </ul>
    );
  }
}

export default withFirebase(GalleryList);
