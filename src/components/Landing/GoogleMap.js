
import { GoogleApiWrapper, GoogleMapReact, GoogleMap, Map, InfoWindow, Marker } from 'google-maps-react';//
import React, { Component } from "react";
import '../../css/map.css';


import CurrentLocation from './CurrentLocation';
import { ExpandOutlined, StarOutlined, StarFilled, StarTwoTone } from '@ant-design/icons';
import svgMarker from './svgMarker';
const CircleThing = () => {
  return (
    <div className="marker" style={{ height: 50, width: 50, backgroundColor: "purple", borderRadius: 20 }}> Circle thing</div>
  )
}

const mapStyles = {
  width: '100%',
  height: '100%'
};

export class MapContainer extends Component {
  state = {
    showingInfoWindow: false,  //Hides or the shows the infoWindow
    activeMarker: {},          //Shows the active marker upon click
    selectedPlace: {}          //Shows the infoWindow to the selected place upon a marker
  };

  constructor(props) {
    super(props);
    console.log("MapContainer props", props)
    console.log("getCustomSvg", svgMarker)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.selected !== prevProps.selected) {
      console.log("this.props.selected", this.props.selected)
    }
  }
  onMarkerClick = (props, marker, e) => {
    console.log("onMarkerClick",props, marker, e)
    Object.assign(props,)
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    })
  };

  onMarkerDragEnd = (hoverKey, childProps, mouse) => {
    // console.log("onMarkerDragEnd", hoverKey, childProps, mouse)
    const { latLng } = mouse;
    this.props.latLngCallBack({lat: latLng.lat(), lng: latLng.lng()});
  }

  getSvgMarker() {
    console.log("getSvgMarker");
    return
  }


  render() {
  //   const icon = { url: 'https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/users%2FzHXGGNge3bS76tWjQ9wlhacZ8wD2%2Fart%2FIMG_0052.JPG?alt=media&token=c31af1f7-df93-46a9-b34e-c634ff259d14', scaledSize: { width: 32, height: 32 } };
  //   const Markers = this.props.list.map((item, index) => {
  //     console.log("marker item", item)
  //     return (
  //       <Marker 
  //         position={item.location}
  //         name={item.title}
  //         key={index}
  //         onClick={this.onMarkerClick}
  //         icon={{url:item.galleryImg.url, scaledSize: { width: 32, height: 32 }}}
  //       />
  //     )
  //   })
  //   const initialCenter =
  //   {
  //     lat: 37.816482707999,
  //     lng: -122.25793661469727
  //   }
    const otherCenter = this.props.setCenter ||
    {
      lat: 37.826482707999,
      lng: -122.25793661469727
    }
  console.log("this.props.setCenter",this.props.setCenter)
    return (<CurrentLocation
      centerAroundCurrentLocation
      google={this.props.google}
      props
      initialCenter={otherCenter}
      selected={this.props.selected}
    >
      {this.props.modal ? (<Marker position={otherCenter} onClick={this.onMarkerClick} name={'current location'} draggable={true} onDragend={this.onMarkerDragEnd} />) :
        this.props.list.map((item, index) => {
          console.log("marker item", item)
          return (
            <Marker 
              position={item.location}
              name={item.title}
              key={index}
              onClick={this.onMarkerClick}
              icon={{url:item.galleryImg.url, scaledSize: { width: 32, height: 32 }}}
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