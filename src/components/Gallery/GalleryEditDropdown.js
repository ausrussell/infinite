import React, { Component } from "react";
import { Select } from "antd";
import { withFirebase } from "../Firebase";
import { isEmpty, isNil } from 'lodash';

const { Option } = Select;
const defaultValue = "Edit Gallery"

class GalleryEditDropdown extends Component {
  state = {
    galleriesList: [],
    dataList: {}
  };
  constructor(props) {
    super(props);
    console.log("GalleryEditDropdown props", props);
  }

  componentDidUpdate(oldProps){
    // console.log("GalleryEditDropdown oldProps, this.props",oldProps, this.props)
    // console.log("isEmpty(this.props.galleryDesc)",isEmpty(this.props.galleryDesc))
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
    this.assetCall && this.props.firebase.detachRefListener(this.assetCall);
  }

  fillList = data => {
    console.log("Galleries callback", data);
    const list = [];
    const dataList = {};
    if (data) {
      data.forEach( (childSnapshot) => {
        list.push(childSnapshot);
        dataList[childSnapshot.key] = childSnapshot.val();
      });
    }
    this.setState({ galleriesList: list, dataList: dataList });
  };

  getGalleryData =  (id) => {
    this.selectedId = id;


    this.desc = this.state.dataList[id];
    const options = {
      refPath: "users/" + this.props.firebase.currentUID + "/galleryData/" + id,
      callback: this.returnData,
      once: true 
    }
    this.assetCall = this.props.firebase.getAsset(options)
  };

  returnData = (snapshot) => {
    const galleryData = snapshot.val()
    const dataToReturn = {
      galleryDesc: this.desc,
      galleryData: galleryData,
      id: this.selectedId
    }
    console.log("dataToReturn",dataToReturn);
    this.props.callback(dataToReturn)
  }

  listItem(data) {
    const galleryData = data.val();
    console.log("galleryData listItem",galleryData)

    const { key } = data;
    const { title } = galleryData;
    return (
      <Option key={key} label={data.title || "Untitled"}>
        {title || "Untitled"}
      </Option>
    );
  }

  render() {
    return (
      <Select
        style={{ width: 180 }}        
        onChange={(id) => this.getGalleryData(id)}
        value={(isEmpty(this.props.galleryDesc) || isNil(this.props.galleryDesc.title))? defaultValue : this.props.id}
      >
        {this.state.galleriesList.map(data => this.listItem(data))}
      </Select>
    );
  }
}
export default withFirebase(GalleryEditDropdown);
