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
    this.curatorUsers = {};
  }

  componentDidUpdate(oldProps) {
    // console.log("GalleryEditDropdown oldProps, this.props",oldProps, this.props)
    // console.log("isEmpty(this.props.galleryDesc)",isEmpty(this.props.galleryDesc))
  }

  componentDidMount() {
    let options = {}
    if (this.props.firebase.isCurator) {//
      options = {
        refPath: "users",
        callback: this.fillCuratorList,
        orderField: "title"
      }
    } else {
      options = {
        refPath: "users/" + this.props.firebase.currentUID + "/galleryDesc",
        callback: this.fillList,
        orderField: "title"
      }
    }
    this.listCall = this.props.firebase.getList(options);
  }

  fillCuratorList = data => {//do differently when there's many users
  console.log("fillCuratorList",data, data.val());
    const dataList = {};
    this.curatorUsers = {}
    if (data) {
      data.forEach((childSnapshot) => {

        const snap = childSnapshot.val();
        const userUID = childSnapshot.key;
        console.log("userUID",userUID)
        console.log("snap val",snap)
        if (snap.galleryDesc) {
          console.log("there are snap.galleryDesc", snap.galleryDesc)
          for (const [key, value] of Object.entries(snap.galleryDesc)) {
            console.log(`${key}:`, value);
            this.curatorUsers[key] = childSnapshot.key;
            dataList[key] = value;
          }
        }
      });
    }

    this.setState({ dataList: dataList });
  }

  componentWillUnmount() {
    this.listCall && this.props.firebase.detachRefListener(this.listCall);
    this.assetCall && this.props.firebase.detachRefListener(this.assetCall);
  }

  fillList = data => {
    const dataList = {};
    if (data) {
      data.forEach((childSnapshot) => {
        dataList[childSnapshot.key] = childSnapshot.val();
        this.setState({ dataList: dataList });
      });
    }
  };

  getGalleryData = (id) => {
    this.selectedId = id;
    this.desc = this.state.dataList[id];

    this.userId = this.curatorUsers[id] || this.props.firebase.currentUID;
    // debugger;
    const options = {
      refPath: "users/" + this.userId + "/galleryData/" + id,
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
      id: this.selectedId,
      userId:this.userId
    }
    console.log("dataToReturn", dataToReturn);
    this.props.callback(dataToReturn)
  }

  listItem(key, value) {
    return <Option key={key} label={value.title || "Untitled"}>
      {value.title || "Untitled"}
    </Option>
  }

  render() {
    const items = [];
    Object.entries(this.state.dataList).forEach((key) => items.push(this.listItem(key[0], key[1])))
    return (
      <Select
        style={{ width: 180 }}
        onChange={(id) => this.getGalleryData(id)}
        value={(isEmpty(this.props.galleryDesc) || isNil(this.props.galleryDesc.title)) ? defaultValue : this.props.id}
      >
        {items}
      </Select>
    );
  }
}
export default withFirebase(GalleryEditDropdown);
