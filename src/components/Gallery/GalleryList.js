import React, { Component } from "react";

import { withFirebase } from "../Firebase";
import { List, Avatar } from 'antd';
import { EnvironmentOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Route } from "react-router-dom";


const galleryPlaceholder = 'https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Fhanger_placeholder.png?alt=media&token=4f847f15-48d6-43d9-92df-80eea32394f5';
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

    if (action==="Visit") {
      const {history,nameEncoded} = item
      history.push({ pathname: "/Gallery/" + nameEncoded})
    }

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
        renderItem={item => <CustomItem item={item} onClickHandler={this.onClickHandler} /> }
      />
    );
  }
}
const IconText = ({ icon, text, onClick, item }) => {
  console.log("IconText",icon, text, onClick);
  return (  <span onClick={() => onClick(text, item)}>
    {React.createElement(icon, { style: { marginRight: 8 } })}
    {text}
  </span>)
};
const CustomItem = ({item, onClickHandler}) => {
  //<ButtonToNavigate {...routeProps} />
  return(
  <List.Item style={{backgroundColor: "#F5F5F6", padding: 10}}
  extra={
    <img
      width={172}
      alt={`${item.title} Gallery`}
      src={item.galleryImg ? `${item.galleryImg.url}` : galleryPlaceholder}
    />
  }
  actions={[
    <span onClick={() => onClickHandler("Locate",item)}><EnvironmentOutlined key="list-vertical-star-o" style={ {marginRight: 8 } }/>Locate</span>,
    <Route
    path="/"
    render={routeProps => {
      Object.assign(routeProps, item);
      return <span onClick={() => onClickHandler("Visit",routeProps)}  ><ArrowRightOutlined key="list-vertical-star-o" style={ {marginRight: 8 } }/>Visit</span>;
    }}
  />
    


  ]}>
    <List.Item.Meta
      title={item.title}
      description={item.description}

    />
  </List.Item>
)}

export default withFirebase(GalleryList);
