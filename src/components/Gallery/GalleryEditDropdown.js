import React, { Component } from "react";

import { withFirebase } from "../Firebase";

const GalleryEditListItem = props => {
  console.log("props.data", props.data);
  const galleryData = props.data.val();
  const { key } = props.data;
  console.log("key, galleryData", key, galleryData);
  const { name } = galleryData;
  return <option value={key}>{name}</option>;
};

class GalleryEditDropdown extends Component {
  state = {
    galleriesList: []
  };
  constructor(props) {
    super(props);
    console.log("GalleryEditDropdown props", props);

    this.callback = props.callback;
  }

  componentDidMount() {
    this.props.firebase.getGalleryEditList(this.fillList);
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

  getGalleryData(value) {
    this.props.firebase.getGalleryById(value).on("value", snapshot => {
      console.log("getGalleryData", snapshot.val());
      this.callback(snapshot.val());
    });
    // .then(data => this.callback(data))
  }
  render() {
    return (
      <select onChange={({ target }) => this.getGalleryData(target.value)}>
        {this.state.galleriesList.map(data => (
          <GalleryEditListItem data={data} key={data.key} />
        ))}
      </select>
    );
  }
}
export default withFirebase(GalleryEditDropdown);
