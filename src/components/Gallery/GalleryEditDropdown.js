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

  getGalleryData(id) {
    console.log("onChange getGalleryData", id, this.currentId);
    if (this.currentId === id) return;
    this.props.firebase.getGalleryById(id).on("value", snapshot => {
      console.log("getGalleryData", snapshot.val());
      console.log("onChange getGalleryById", id, this.currentId);
      if (this.currentId !== id) {
        this.callback(snapshot.val(), id);
        this.currentId = id;
      }
    });
    // .then(data => this.callback(data))
  }
  render() {
    return (
      <select onChange={({ target }) => this.getGalleryData(target.value)}>
        <option value={0}>Select a Gallery to edit</option>
        {this.state.galleriesList.map(data => (
          <GalleryEditListItem data={data} key={data.key} />
        ))}
      </select>
    );
  }
}
export default withFirebase(GalleryEditDropdown);
