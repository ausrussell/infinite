
import { GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';//
import React, { Component } from "react";
import '../../css/map.css';

import CurrentLocation from './CurrentLocation';
// import { ExpandOutlined, StarOutlined, StarFilled, StarTwoTone } from '@ant-design/icons';

const defaultIconURL = "https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Fwhite_cube.png?alt=media&token=f852da15-6e33-448a-ab0f-2da3fdac8149"

export class MapContainer extends Component {
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
    if (this.props.selected !== prevProps.selected) {
      console.log("this.props.selected", this.props.selected)
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
  };

  onMarkerDragEnd = (hoverKey, childProps, mouse) => {
    // console.log("onMarkerDragEnd", hoverKey, childProps, mouse)
    const { latLng } = mouse;
    this.props.latLngCallBack({ lat: latLng.lat(), lng: latLng.lng() });
  }

  render() {
    const centerSet = (this.props.setCenter && this.props.setCenter.lat);
    console.log("this.props.setCenter ={!centerSet}", this.props.setCenter)

    return (<CurrentLocation
      centerAroundCurrentLocation={!centerSet}
      google={this.props.google}
      props
      selected={this.props.setCenter || this.props.selected}
      modal={this.props.modal}
    >
      {this.props.modal ? (<Marker position={this.props.setCenter} onClick={this.onMarkerClick} name={'current location'} draggable={true} onDragend={this.onMarkerDragEnd} />) :
        this.props.list.map((item, index) => {
          console.log("marker item", item)
          return (
            <Marker
              position={item.location}
              name={item.title}
              key={index}
              onClick={this.onMarkerClick}
              icon={{ url: (item.galleryImg) ? item.galleryImg.url : defaultIconURL, scaledSize: { width: 32, height: 32 } }}
            />
          )
        })
      }


      <InfoWindow
        marker={this.state.activeMarker}
        visible={this.state.showingInfoWindow}
        onClose={this.onClose}
      >
        <div>
          <h4>{this.state.selectedPlace.name}</h4>
        </div>
      </InfoWindow>
    </CurrentLocation >

    );
  }

}


export default GoogleApiWrapper({
  apiKey: 'AIzaSyAZ8009CBQp6KKDtOjk5svYXe76q2ehG7w',


})(MapContainer);