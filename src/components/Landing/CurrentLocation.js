import React from 'react';
import ReactDOM from 'react-dom';

export class CurrentLocation extends React.Component {

  constructor(props) {
    super(props);
    console.log("CurrentLocation props", this.props)
    const { lat, lng } = (this.props.selected && this.props.selected.lat)? this.props.selected : this.props.initialCenter;
    this.state = {
      currentLocation: {
        lat: lat,
        lng: lng
      }
    };
    this.mapStyles = {
      map: {
        width: '100%',
        height: (this.props.modal) ? 500 : 'calc(100vh - 126px)'
      }
    };
  }
  componentDidMount() {
    if (this.props.centerAroundCurrentLocation) {
      if (navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const coords = pos.coords;
          this.setState({
            currentLocation: {
              lat: coords.latitude,
              lng: coords.longitude
            }
          });
        });
      }
    } else if (this.props.selected) {
      this.setState({
        currentLocation: this.props.selected
      });
    }
    this.loadMap();
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.google !== this.props.google) {
      this.loadMap();
    }
    if (this.props.selected && (prevProps.selected !== this.props.selected)) {
      this.panTo()
    }
    if (prevState.currentLocation !== this.state.currentLocation) {
      this.recenterMap();
    }

  }

  panToInit() {
    this.setState({
      currentLocation: this.props.initialCenter
    }, this.recenterMap);
  }

  panTo() {
    this.setState({
      currentLocation: this.props.selected.location || this.props.selected
    }, this.recenterMap);
  }

  loadMap() {
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
          zoom: zoom
        }
      );

      // maps.Map() is constructor that instantiates the map
      this.map = new maps.Map(node, mapConfig);
    }
  }

  recenterMap() {
    const map = this.map;
    const current = this.state.currentLocation;

    const google = this.props.google;
    const maps = google.maps;
    if (map) {
      let center = new maps.LatLng(current.lat, current.lng);
      map.panTo(center);
    }
  }


  renderChildren() {
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
  render() {
    const style = Object.assign({}, this.mapStyles.map);
    return (
      <div>
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
  zoom: 14,
  initialCenter: {
    lat: -1.2884,
    lng: 36.8233
  },
  centerAroundCurrentLocation: false,
  visible: true
};