import React, { Component } from "react";

import { withFirebase } from "../Firebase";
import { List, Avatar } from 'antd';
import { EnvironmentOutlined, ArrowRightOutlined } from '@ant-design/icons';
const IconText = ({ icon, text, onClick, item }) => {
  console.log("IconText",icon, text, onClick);
  return (  <span onClick={() => onClick(text, item)}>
    {React.createElement(icon, { style: { marginRight: 8 } })}
    {text}
  </span>)
};
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
    // this.listCall = this.props.firebase.getGalleryList(this.fillList);
    const options = {
      refPath: "publicGalleries",
      callback: this.fillList,
      orderField: "title"
    }
    this.listCall = this.props.firebase.getList(options);
  }
  componentWillUnmount() {
    this.props.firebase.detachRefListener(this.listCall);

  }
  onClickHandler = (action, item) => {
    console.log("e",action, item)
    if (action==="Locate") this.props.selectCallback(item);
  }

  fillList = data => {
    console.log("Galleries callback", data);
    const list = [];
    if (data) {
      data.forEach(function (childSnapshot) {
        list.push(childSnapshot.val());
      });
    }
    this.setState({ galleriesList: list });
    console.log("Galleries plansCallback", list);
    this.props.listCallback && this.props.listCallback(list)
  };
  //   <ul>
  //   {this.state.galleriesList.map(data => (
  //     <GalleryListItem data={data} key={data.key} />
  //   ))}
  // </ul>
  render() {
    return (


      <List
        itemLayout="vertical"
        dataSource={this.state.galleriesList}
        renderItem={item => (
          <List.Item style={{backgroundColor: "#F5F5F6", padding: 10}}
          extra={
            <img
              width={172}
              alt={`${item.title} Gallery`}
              src={item.galleryImg.url}
            />
          }
          actions={[
            <IconText icon={EnvironmentOutlined} text="Locate" key="list-vertical-star-o" onClick={this.onClickHandler.bind(this)} item={item} />,
            <IconText icon={ArrowRightOutlined} text="Visit" key="list-vertical-star-o" />,

          ]}>
            <List.Item.Meta
              title={<a href="https://ant.design">{item.title}</a>}
              description={item.description}

            />
          </List.Item>
        )}
      />




    );
  }
}

export default withFirebase(GalleryList);
