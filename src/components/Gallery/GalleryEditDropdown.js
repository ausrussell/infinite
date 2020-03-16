import React, { Component } from "react";
import { Select } from "antd";
import { withFirebase } from "../Firebase";

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

  getGalleryData = id => {
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
  };

  listItem(data) {
    const { Option } = Select;

    const galleryData = data.val();
    const { key } = data;
    const { name } = galleryData;
    return (
      <Option value={key} key={data.key}>
        {name}
      </Option>
    );
  }
  render() {
    const { Option } = Select;
    // {this.state.galleriesList.map(data => (
    //   <GalleryEditListItem data={data} key={data.key} />
    // ))}
    // <Option value={0}>Select a Gallery to edit</Option>
    // onChange={({ target }) => this.getGalleryData(target.value)}

    return (
      <Select
        style={{ width: 250 }}
        defaultValue="Select a Gallery to edit"
        onChange={this.getGalleryData}
      >
        {this.state.galleriesList.map(data => this.listItem(data))}
      </Select>
    );
  }
}
export default withFirebase(GalleryEditDropdown);
