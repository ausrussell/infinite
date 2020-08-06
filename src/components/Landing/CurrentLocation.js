import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'antd';
import { Marker } from 'google-maps-react';//
import { Alert } from "antd";
import { isEqual } from 'lodash';
const styles = require('./GoogleMapStyles.json')

const permissionAlert = <Alert
  message="Please grant permission to use your location"
  banner
  closable
/>
export class CurrentLocation extends Component {

  constructor(props) {
    super(props);
    console.log("CurrentLocation props", this.props)
    const { lat, lng } = (this.props.selected && this.props.selected.lat) ? this.props.selected : this.props.initialCenter;
    this.state = {
      currentLocation: {
        lat: lat,
        lng: lng
      },
      locationPermission: null,
      displayPermissionAlert: false,
      recentering: false
    };
    this.setLocationPermission();
    this.mapStyles = {
      map: {
        width: '100%',
        height: (this.props.modal) ? 400 : 'calc(100vh - 126px)'
      }
    };
  }
  componentDidMount() {
    if (this.props.centerAroundCurrentLocation) {
      // if (navigator && navigator.geolocation) {
      //   navigator.geolocation.getCurrentPosition(pos => {
      //     const coords = pos.coords;
      //     this.setState({
      //       currentLocation: {
      //         lat: coords.latitude,
      //         lng: coords.longitude
      //       }
      //     });
      //   });
      // }
    } else if (this.props.selected) {
      // this.setState({
      //   currentLocation: this.props.selected
      // });
    }
    this.loadMap();
  }
  componentDidUpdate(prevProps, prevState) {
    // console.log("Current map did update", prevProps, prevState, this.props, this.state);
    if (prevProps.google !== this.props.google) {
      // console.log("componentDidUpdate loadMap");
      this.loadMap();
    }
    if (this.props.selected && !isEqual(prevProps.selected, this.props.selected)) {
      console.log("componentDidUpdate panTo new selected");
      this.panTo()
    }
    if (!isEqual(prevState.currentLocation, this.state.currentLocation)) {
      // console.log("componentDidUpdate recenterMap")
      this.recenterMap();
    }
    if (this.props.activeMarker && !isEqual(prevProps.activeMarker, this.props.activeMarker)) {
      console.log("componentDidUpdate new activeMarker");
      debugger;
      // this.props.google.maps.event.trigger(this.props.activeMarker[0], 'click');
    }

  }

  panToInit() {
    this.setState({
      currentLocation: this.props.initialCenter
    }, this.recenterMap);
  }

  panTo() {
    console.log("panTo this.props.selected.location || this.props.selected", this.props.selected.location, this.props.selected)
    this.setState({
      currentLocation: this.props.selected.location || this.props.selected
    });
  }

  loadMap() {
    console.log("loadMap")
    if (this.props && this.props.google) {
      // checks if google is available
      const { google } = this.props;
      const maps = google.maps;

      const mapRef = this.refs.map;

      // reference to the actual DOM element
      const node = ReactDOM.findDOMNode(mapRef);

      let { zoom } = this.props;
      const { lat, lng } = this.state.currentLocation;
      const center = new maps.LatLng(lat, lng);
      const mapConfig = Object.assign(
        {},
        {
          center: center,
          zoom: zoom,
          styles: styles
        }
      );

      // maps.Map() is constructor that instantiates the map
      this.map = new maps.Map(node, mapConfig);
      maps.event.addListenerOnce(this.map, 'tilesloaded', () => console.log("tilesloaded"));

      this.map.addListener("idle", () => {
        console.log("map idle")
        this.setState({ recentering: false })})
    }
  }

  recenterMap() {
    console.log("recenterMap", this.state.currentLocation)
    const map = this.map;
    const current = this.state.currentLocation;
    const google = this.props.google;
    const maps = google.maps;
    if (map) {
      let center = new maps.LatLng(current.lat, current.lng);
      map.panTo(center);
      map.setZoom(14);

      // debugger;
    }
  }

  onMarkerDragEnd = (hoverKey, childProps, mouse) => {
    console.log("onMarkerDragEnd", hoverKey, childProps, mouse)
    const { latLng } = mouse;
    console.log("latLng", { lat: latLng.lat(), lng: latLng.lng() })
    this.props.latLngCallBack({ lat: latLng.lat(), lng: latLng.lng() });
  }


  renderChildren() {
    // console.log("renderChildren this.state", this.state)
    if (this.props.modal) {
      const modalMarker = <Marker position={this.state.currentLocation} name={'Your Gallery\'s location'} draggable={true} onDragend={this.onMarkerDragEnd} />
      const modalMarkerClone = React.cloneElement(modalMarker, {
        map: this.map,
        google: this.props.google,
        mapCenter: this.state.currentLocation
      });
      return modalMarkerClone
    }
    else {
      const { children } = this.props;
      if (!children) return;
      return React.Children.map(children, c => {
        if (!c) return;
        const clone = React.cloneElement(c, {
          map: this.map,
          google: this.props.google,
          mapCenter: this.state.currentLocation
        });
        return clone
      });
    }
  }

  setLocationPermission() {
    if (navigator.permissions) {
    let locationPermission;
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          locationPermission = result.state;
          this.setState({ locationPermission: result.state });
          console.log("locationPermission", locationPermission);

        } else if (result.state === 'prompt') {
          locationPermission = result.state;
          this.setState({ locationPermission: result.state });

          console.log("locationPermission", locationPermission);


        } else if (result.state === 'denied') {
          locationPermission = result.state;
          this.setState({ locationPermission: result.state });
          console.log("locationPermission", locationPermission);

        }
        result.onchange = () => {
          locationPermission = result.state;
          this.setState({ locationPermission: result.state });
          if (result.state === "granted") this.setState({ displayPermissionAlert: false })
          console.log("locationPermission", locationPermission);

        }
      });
    }
  }


  allowLocation = () => {
    this.setState({ recentering: true })
    if (this.state.locationPermission !== "granted") {
      this.setState({ displayPermissionAlert: true })
    }
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const coords = pos.coords;
        this.setState({
          currentLocation: {
            lat: coords.latitude,
            lng: coords.longitude
          }

        }, this.props.latLngCallBack(this.state.currentLocation));
      });
    }
    //{this.state.currentLocation && <p>This.currentLocation lat {this.state.currentLocation.lat}<br />{this.state.currentLocation.lng}</p>} -- add to render for debugger

  }

  render() {
    const style = Object.assign({}, this.mapStyles.map);
    return (
      <div>
        {this.state.displayPermissionAlert && permissionAlert}
        {this.props.modal && <div><p>Drag the marker to your desired location</p><Button onClick={this.allowLocation} loading={this.state.recentering} style={{ marginBottom: 5 }}>Move marker to your current location</Button></div>}
        <div style={style} ref="map">
          Loading map...
           </div>
        {this.renderChildren()}
      </div>
    );
  }

}
export default CurrentLocation;

CurrentLocation.defaultProps = {
  zoom: 2,
  initialCenter: {
    lat: 37.80521330475583,
    lng: -122.27177955554198
  },
  centerAroundCurrentLocation: false,
  visible: true
};