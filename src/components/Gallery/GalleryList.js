import React, { Component } from "react";

import { withFirebase } from "../Firebase";
import { List } from 'antd';
import { EnvironmentOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Route } from "react-router-dom";
import { Typography } from 'antd';
const { Paragraph } = Typography;

const galleryPlaceholder = 'https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Fhanger_placeholder.png?alt=media&token=4f847f15-48d6-43d9-92df-80eea32394f5';

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
    console.log("e", action, item)
    if (action === "Locate") this.props.selectCallback(item);

    if (action === "Visit") {
      const { history, nameEncoded } = item
      history.push({ pathname: "/Gallery/" + nameEncoded })
    }

  }

  fillList = data => {
    console.log("Galleries callback", data);

    const list = [];
    if (data) {
      data.forEach( (childSnapshot)=> {
        const snap = childSnapshot.val();
        console.log("list data", childSnapshot.key, snap)
        list.push(snap);
      });
    }
    this.setState({ galleriesList: list });
    console.log("Galleries plansCallback", list);
    this.props.listCallback && this.props.listCallback(list)
  };

  render() {
    return (
      <List
        itemLayout="vertical"
        dataSource={this.state.galleriesList}
        renderItem={item => <GalleryListItem item={item} onClickHandler={this.onClickHandler} />}
      />
    );
  }
}

const GalleryListItem = ({ item, onClickHandler }) => {

  return (
    <List.Item style={{ backgroundColor: "#F5F5F6", padding: 10 }}
      extra={
        <img
          width={172}
          alt={`${item.title} Gallery`}
          src={item.galleryImg ? `${item.galleryImg.thumb || item.galleryImg.url}` : galleryPlaceholder}
        />
      }
      actions={[
        <span onClick={() => onClickHandler("Locate", item)}><EnvironmentOutlined key="list-vertical-star-o" style={{ marginRight: 8 }} />Locate</span>,
        <Route
          path="/"
          render={routeProps => {
            Object.assign(routeProps, item);
            return <span onClick={() => onClickHandler("Visit", routeProps)}  ><ArrowRightOutlined key="list-vertical-star-o" style={{ marginRight: 8 }} />Visit</span>;
          }}
        />



      ]}>
      <List.Item.Meta
        title={item.title}
        description={<div>{item.userDisplayName && <p>Built by: {item.userDisplayName}</p>}
          <Paragraph ellipsis={{ rows: 5, expandable: true }}>{item.description}</Paragraph>
        </div>}
      />
    </List.Item>
  )
}

export default withFirebase(GalleryList);
