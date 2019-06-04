import React, { Component, PureComponent } from "react";
import "../css/elevator.css";
// import { Button, Icon } from "semantic-ui-react";
import { Transition, Spring, animated, config } from "react-spring/renderprops";
import * as THREE from "three";
import { floorData } from "./Floor";

const Floors = {
  0: {
    name: "Gallery"
  },
  1: {
    name: "Frames"
  }
};

const COLORS = [
  "crimson",
  "teal",
  "coral",
  "hotpink",
  "skyblue",
  "salmon",
  "seagreen",
  "peachpuff"
];

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
    vaultOpen: false,
    y: 20
  };
  constructor(props) {
    super(props);
  }
  vaultButtonHandler() {
    this.setState({ vaultOpen: !this.state.vaultOpen });
  }
  state = { y: 0 };
  el = React.createRef();
  spring = React.createRef();
  setY = () => this.setState({ y: Math.round(Math.random() * 50) + 50 });
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

    //{props.y}
    const y = this.el.current ? this.el.current.scrollTop : 0;
    return (
      <div className={`vault-container ${vaultOpen ? "open" : "closed"}`}>
        <div className="vault-doors">
          <div className="vault-floors-container">
            <FloorWrapper title={y}>
              <TilesFloor
                tilesData={framesData}
                tileCallback={this.props.tileCallback}
              />
            </FloorWrapper>

            <FloorWrapper title="Floors">
              <TilesFloor
                tilesData={floorData}
                tileCallback={this.props.floorTileCallback}
              />
            </FloorWrapper>
          </div>
          <div className="elevator-panel">
            <div className="elevator header">
              <div className="elevator-current-floor">current </div>
            </div>
            <div className="elevator-floors-list">
              <ul>
                <li>Frames</li>
                <li>Floors</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="scrolltop-main-holder">
          <div className="scrolltop-main">
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
                  <FloorWrapper title={y}>
                    <TilesFloor
                      tilesData={framesData}
                      tileCallback={this.props.tileCallback}
                    />
                  </FloorWrapper>

                  <FloorWrapper title="Floors">
                    <TilesFloor
                      tilesData={floorData}
                      tileCallback={this.props.floorTileCallback}
                    />
                  </FloorWrapper>
                </animated.div>
              )}
            </Spring>
          </div>
          <div className="scrolltop-b" onClick={this.setY} />
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
