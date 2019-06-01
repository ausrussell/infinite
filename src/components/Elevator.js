import React, { Component, PureComponent } from "react";
import "../css/elevator.css";
// import { Button, Icon } from "semantic-ui-react";
import { Transition } from "react-spring/renderprops";
import * as THREE from "three";

const Floors = {
  0: {
    name: "Gallery"
  },
  1: {
    name: "Frames"
  }
};

const framesData = [
  { key: 0, type: "color", color: "#543499" },
  { key: 1, color: "#240099", type: "color" },
  { key: 2, type: "color", color: "#111111" },
  { key: 3, type: "color", color: "#FFFFFF" },
  { key: 4, type: "texture", url: "../textures/wood/wood1.png" },
  { key: 5, type: "texture", url: "../textures/wood/wood2.png" },
  { key: 6, type: "texture", url: "../textures/wood/wood3.png" }
];
const texturesPath = "../textures/";
const floorData = [
  {
    key: 0,
    type: "texture-array",
    url: texturesPath + "wood/hardwood2_diffuse.jpg",
    floorMat: new THREE.MeshStandardMaterial({
      roughness: 0.8,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.0005
    }),
    map: texturesPath + "wood/hardwood2_diffuse.jpg",
    bumpMap: texturesPath + "wood/hardwood2_bump.jpg",
    roughnessMap: texturesPath + "wood/hardwood2_roughness.jpg"
  },
  { key: 9, type: "color", color: "#543499" },
  { key: 1, color: "#564449", type: "color" },
  { key: 2, type: "color", color: "#111111" },
  { key: 3, type: "color", color: "#FFFFFF" },
  { key: 4, type: "texture", url: "../textures/wood/hardwood.jpg" },
  {
    key: 5,
    type: "texture",
    url: "../textures/concrete_stone/concrete01_diff.jpg"
  },
  {
    key: 6,
    type: "texture",
    url: "../textures/concrete_stone/stonetiles_001_diff.jpg"
  },
  {
    key: 7,
    type: "texture",
    url: "../textures/concrete_stone/stonetiles_002_diff.jpg"
  },
  {
    key: 8,
    type: "texture",
    url: "../textures/concrete_stone/stonetiles_003_diff.jpg"
  }
];

class FloorWrapper extends Component {
  render() {
    const { title, children } = this.props;

    return (
      <div className="floor-container">
        <h4 className="floor-title">{title}</h4>
        <div className="floor-wrapper">{children}</div>
      </div>
    );
  }
}

const Tile = props => {
  const { color, url, type } = props.item;
  console.log("tile", props, type, url, color);

  const style = {
    backgroundColor: color,
    backgroundImage: "url(" + url + ")"
    // fontSize: "55px"
  };
  return <div className="tile" style={style} />;
};

class FramesFloor extends Component {
  constructor(props) {
    super(props);
  }

  tileClickHandler(item) {
    console.log("item", item);
    this.props.tileCallback(item);
  }
  render() {
    const { tilesData } = this.props;
    return (
      <div className="tile-holder">
        {tilesData.map(item => {
          console.log("item", item);
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

class Elevator extends PureComponent {
  state = {
    currentFloor: Floors[0],
    vaultOpen: false
  };
  constructor(props) {
    super(props);
  }
  vaultButtonHandler() {
    this.setState({ vaultOpen: !this.state.vaultOpen });
  }
  render() {
    const vaultOpen = this.state.vaultOpen;
    return (
      <div className={`vault-container ${vaultOpen ? "open" : "closed"}`}>
        <div className="vault-doors">
          <div className="vault-floors-container">
            <FloorWrapper title="Frames">
              <FramesFloor
                tilesData={framesData}
                tileCallback={this.props.tileCallback}
              />
            </FloorWrapper>

            <FloorWrapper title="Floors">
              <FramesFloor
                tilesData={floorData}
                tileCallback={this.props.floorTileCallback}
              />
            </FloorWrapper>
          </div>
          <div className="elevator-panel">
            <div className="elevator header">
              <div className="elevator-current-floor">
                {this.state.currentFloor.name}
              </div>
            </div>
            <div className="elevator-floors-list">
              <ul>
                <li>Frames</li>
                <li>Floors</li>
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
            Vault
          </div>
        </div>
      </div>
    );
  }
}

export default Elevator;
