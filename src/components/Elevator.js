import React, { Component, PureComponent } from "react";
import "../css/elevator.css";
// import { Button, Icon } from "semantic-ui-react";
import { Transition, Spring, animated, config } from "react-spring/renderprops";
import * as THREE from "three";
import { floorData } from "./Floor";

// import { FirebaseContext } from "./Firebase";

// import firebase from "firebase";
// import configf from "../api/firebase-config";
// firebase.initializeApp(configf);

// const Floors = {
//   0: {
//     name: "Frames",
//     y: 0
//   },
//   1: {
//     name: "Floors",
//     y: 235
//   }
// };

const framesData = [
  { key: 0, type: "color", color: "#543499" },
  { key: 1, color: "#240099", type: "color" },
  { key: 2, type: "color", color: "#111111" },
  { key: 3, type: "color", color: "#FFFFFF" },
  { key: 4, type: "texture", url: "../textures/wood/wood1.png" },
  { key: 5, type: "texture", url: "../textures/wood/wood2.png" },
  { key: 6, type: "texture", url: "../textures/wood/wood3.png" }
];

class FloorWrapper extends Component {
  render() {
    const { title, children } = this.props;

    return (
      <div className="floor-container" key="title">
        <h4 className="floor-title">{title}</h4>
        <div className="floor-wrapper">{children}</div>
      </div>
    );
  }
}

const Tile = props => {
  const { color, url, type } = props.item;

  const style = {
    backgroundColor: color,
    backgroundImage: "url(" + url + ")"
    // fontSize: "55px"
  };
  return <div className="tile" style={style} />;
};

class TilesFloor extends Component {
  constructor(props) {
    super(props);
  }

  tileClickHandler = item => {
    console.log("item", item);
    this.props.tileCallback(item);
  };
  render() {
    const { tilesData } = this.props;
    return (
      <div className="tile-holder">
        {tilesData.map(item => {
          return (
            <div key={item.key} onClick={e => this.tileClickHandler(item)}>
              <Tile item={item} />
            </div>
          );
        })}
      </div>
    );
  }
}

class ArtFloor extends Component {
  constructor(props) {
    super(props);
    // this.props.firebase.listArt();

    //
    // var storageRef = firebase.storage().ref("art");
    //
    // // Now we get the references of these images
    // storageRef
    //   .listAll()
    //   .then(function(result) {
    //     result.items.forEach(function(imageRef) {
    //       // And finally display them
    //       displayImage(imageRef);
    //     });
    //   })
    //   .catch(function(error) {
    //     // Handle any errors
    //   });
    //
    // function displayImage(imageRef) {
    //   imageRef
    //     .getDownloadURL()
    //     .then(function(url) {
    //       console.log("url of image", url);
    //       // TODO: Display the image on the UI
    //     })
    //     .catch(function(error) {
    //       // Handle any errors
    //     });
    // }
  }

  render() {
    return <div> art works</div>;
  }
}

class Elevator extends PureComponent {
  state = {
    currentFloor: 0,
    vaultOpen: false,
    y: 0
  };
  constructor(props) {
    super(props);
    this.floors = props.floors;
  }
  vaultButtonHandler() {
    this.setState({ vaultOpen: !this.state.vaultOpen });
  }

  el = React.createRef();
  spring = React.createRef();
  handleFloorClick = floorNo => {
    this.setState({ y: this.floors[floorNo].y, currentFloor: floorNo });
  };
  // User interaction should stop animation in order to prevent scroll-hijacking
  // Doing this on onWheel isn't enough, but just to illustrate ...
  stop = () => this.spring.current.stop();

  render() {
    const vaultOpen = this.state.vaultOpen;
    const styles = {
      doors: {
        opacity: vaultOpen ? 1 : 0,
        width: vaultOpen ? "100%" : "0%",
        color: "#fff"
      }
    };
    // <FloorWrapper title="Artworks">
    //   <ArtFloor />
    // </FloorWrapper>;

    //{props.y}
    const y = this.el.current ? this.el.current.scrollTop : 0;
    return (
      <div className={`vault-container ${vaultOpen ? "open" : "closed"}`}>
        <div className="vault-doors">
          <div className="vault-floors-container">
            <Spring
              native
              reset
              from={{ y }}
              to={{ y: this.state.y }}
              ref={this.spring}
              config={config.slow}
            >
              {props => (
                <animated.div
                  className="scrolltop-c"
                  ref={this.el}
                  onWheel={this.stop}
                  scrollTop={props.y}
                >
                  {Object.values(this.props.floors).map(floor => {
                    return (
                      <FloorWrapper title={floor.name} key={floor.level}>
                        {floor.floorComponent(floor)}
                      </FloorWrapper>
                    );
                  })}
                </animated.div>
              )}
            </Spring>
          </div>
          <div className="elevator-panel">
            <div className="elevator header">
              <div className="elevator-current-floor">
                {this.state.currentFloor +
                  " " +
                  this.floors[this.state.currentFloor].name}
              </div>
            </div>
            <div className="elevator-floors-list">
              <ul>
                {Object.values(this.props.floors).map(floor => {
                  return (
                    <li
                      key={floor.level}
                      onClick={() => this.handleFloorClick(floor.level)}
                    >
                      {floor.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="vault-button-panel">
          <div
            onClick={() => this.vaultButtonHandler()}
            className="vault-button"
          >
            {vaultOpen ? "Close" : "Open"}
            <br />
            {this.props.name}
          </div>
        </div>
      </div>
    );
  }
}

// <FloorWrapper title="Frames">
//   <TilesFloor
//     tilesData={framesData}
//     tileCallback={this.props.tileCallback}
//   />
// </FloorWrapper>
// <FloorWrapper title="Floors">
//   <TilesFloor
//     tilesData={floorData}
//     tileCallback={this.props.floorTileCallback}
//   />
// </FloorWrapper>
// <FloorWrapper title="Artworks">
//   <FirebaseContext.Consumer>
//     {firebase => <ArtFloor firebase={firebase} />}
//   </FirebaseContext.Consumer>
// </FloorWrapper>

export default Elevator;
