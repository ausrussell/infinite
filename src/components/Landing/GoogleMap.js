
import { GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';//
import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import ReactDOM from "react-dom";
import '../../css/map.css';
import { ArrowRightOutlined } from '@ant-design/icons';


import CurrentLocation from './CurrentLocation';
// import { ExpandOutlined, StarOutlined, StarFilled, StarTwoTone } from '@ant-design/icons';

const defaultIconURL = "https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Fwhite_cube.png?alt=media&token=f852da15-6e33-448a-ab0f-2da3fdac8149"

export class MapContainerBase extends Component {
  state = {
    showingInfoWindow: false,  //Hides or the shows the infoWindow
    activeMarker: {},          //Shows the active marker upon click
    selectedPlace: {}          //Shows the infoWindow to the selected place upon a marker
  };

  constructor(props) {
    super(props);
    console.log("MapContainer props", props)
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("this.props.list",this.props)
    if (this.props.selected !== prevProps.selected) {
      console.log("this.props.selected", this.props.selected)
    }

    if (this.props.list !== prevProps.list) {
      console.log("this.props.list", this.props.list)
    }
  }
  onMarkerClick = (props, marker, e) => {
    console.log("onMarkerClick", props, marker, e)
    Object.assign(props)
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    })
    this.props.markerCallback(props)
  };
  onClickHandler = (action, item) => {
    console.log("e", action, item)
    if (action === "Visit") {
      this.props.history.push("/Gallery/" + item.item.nameEncoded);
    }

  }

  onMarkerDragEnd = (hoverKey, childProps, mouse) => {
    // console.log("onMarkerDragEnd", hoverKey, childProps, mouse)
    const { latLng } = mouse;
    console.log("onMarkerDragEnd", latLng)
    this.props.latLngCallBack({ lat: latLng.lat(), lng: latLng.lng() });
  }

  renderInfoWindow = (routeProps) => {
    console.log("renderInfoWindow", this.state.selectedPlace)
    if (this.state.selectedPlace) {
      return (<div><h4>{this.state.selectedPlace.name}</h4>
        <span onClick={() => this.onClickHandler("Visit",this.state.selectedPlace)} className="map-info-window-link"><ArrowRightOutlined key="list-vertical-star-o" style={{ marginRight: 8 }} />Visit</span>
      </div>
      )
    }
  }

  render() {
    const centerSet = (this.props.setCenter && this.props.setCenter.lat);
    // console.log("this.props.setCenter ={!centerSet}", this.props.setCenter)

    return (<CurrentLocation
      centerAroundCurrentLocation={!centerSet}
      google={this.props.google}
      props
      selected={this.props.setCenter || this.props.selected}
      modal={this.props.modal}
      latLngCallBack={this.props.latLngCallBack}
    >
      {!this.props.modal && this.props.list.map((item, index) => {
        return (
          <Marker
            position={item.location}
            name={item.title}
            key={index}
            onClick={this.onMarkerClick}
            icon={{ url: (item.galleryImg) ? item.galleryImg.url : defaultIconURL, scaledSize: { width: 32, height: 32 } }}
            id={item.id}
            item={item}
          />
        )
      })
      }


      <InfoWindowEx
        marker={this.state.activeMarker}
        visible={this.state.showingInfoWindow}
        onClose={this.onClose}
      >
        <div className="map-info-window">
          {this.renderInfoWindow()}

        </div>
      </InfoWindowEx>
    </CurrentLocation >

    );
  }

}

class InfoWindowEx extends Component {
  constructor(props) {
    super(props);
    this.infoWindowRef = React.createRef();
    this.contentElement = document.createElement(`div`);
  }

  componentDidUpdate(prevProps) {
    if (this.props.children !== prevProps.children) {
      ReactDOM.render(
        React.Children.only(this.props.children),
        this.contentElement
      );
      this.infoWindowRef.current.infowindow.setContent(this.contentElement);
    }
  }

  render() {
    return <InfoWindow ref={this.infoWindowRef} {...this.props} />;
  }
}

const MapContainer = withRouter(MapContainerBase)
export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY
})(MapContainer);