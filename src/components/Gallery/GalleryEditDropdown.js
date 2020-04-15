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
    const options = {
      refPath: "users/" + this.props.firebase.currentUID + "/galleryDesc",
      callback: this.fillList,
      orderField: "title"
    }
    this.listCall = this.props.firebase.getList(options);
  }

  componentWillUnmount() {
    this.listCall && this.props.firebase.detachRefListener(this.listCall);
    this.props.firebase.detachRefListener(this.assetCall);
  }

  fillList = data => {
    console.log("Galleries callback", data);
    const list = [];
    this.dataList = {};

    if (data) {
      data.forEach( (childSnapshot) => {
        list.push(childSnapshot);
        this.dataList[childSnapshot.key] = childSnapshot.val();
      });
    }
    this.setState({ galleriesList: list });
    console.log("Galleries plansCallback", list);
  };

  getGalleryData =  (id) => {
    console.log("galleriesList",id,this.dataList[id])
    this.desc = this.dataList[id];
    const options = {
      refPath: "users/" + this.props.firebase.currentUID + "/galleryData/",
      callback: this.returnData,
      once: true 
    }

    this.assetCall = this.props.firebase.getAsset(options)

  };
  returnData = (snapshot) => {
    const dataToReturn = {
      galleryDesc: this.desc,
      galleryData: snapshot.val()
    }
    console.log("dataToReturn",dataToReturn);
    this.callback(dataToReturn)

  }

  listItem(data) {
    const { Option } = Select;

    const galleryData = data.val();
    const { key } = data;
    const { title } = galleryData;
    return (
      <Option value={key} key={data.key}>
        {title}
      </Option>
    );
  }
  render() {
    const { Option } = Select;

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
