import React, { Component, PureComponent } from "react";
import "../../css/elevator.css";
// import { Button, Icon } from "semantic-ui-react";
import { Spring, animated, config } from "react-spring/renderprops"; //Transition,
// import * as THREE from "three";
// import { FirebaseContext } from "./Firebase";

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

class Elevator extends PureComponent {
  state = {
    currentFloor: 0,
    vaultOpen: false,
    y: 0,
    draggableElement: null
  };

  el = React.createRef();
  spring = React.createRef();

  constructor(props) {
    super(props);
    this.floors = props.floors;
    this.floorCalledCallback = props.floorCalledCallback;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.floorCalled && (nextProps.floorCalled !== this.state.currentFloor)) {
      this.handleFloorClick(nextProps.floorCalled);
    }
  }

  vaultButtonHandler() {
    console.log("vaultButtonHandler")
    this.setState({ vaultOpen: !this.state.vaultOpen });
  }
  setDraggable(element) {
    console.log("setDraggable")

    this.setState({ draggableElement: element });
  }
  handleFloorClick = floorNo => {
    console.log("set y", floorNo);
    // debugger;

    console.log("setDraggable")
 
      this.setState({ y: this.floors[floorNo].y, currentFloor: floorNo });
      this.floorCalledCallback && this.floorCalledCallback(this.floors[floorNo]);

  };

  // User interaction should stop animation in order to prevent scroll-hijacking
  // Doing this on onWheel isn't enough, but just to illustrate ...
  stop = () => this.spring.current.stop();

  render() {
    const vaultOpen = this.state.vaultOpen;
    const y = this.el.current ? this.el.current.scrollTop : 0;

    return (
      <div className={`vault-container ${vaultOpen ? "open" : "closed"}`}>
        {vaultOpen && (<div draggable="true">{this.state.draggable}</div>)}
        <div className="vault-doors">
          {vaultOpen &&(<div className="vault-floors-container">
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
                        {floor.floorComponent instanceof Function
                          ? floor.floorComponent(floor)
                          : floor.floorComponent}
                      </FloorWrapper>
                    );
                  })}
                </animated.div>
              )}
            </Spring>
          </div>)}
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

export default Elevator;
