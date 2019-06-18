import React, { Component } from "react";
import "../css/maker.css";
import Wall from "./Wall";
import PreFab from "./PreFab";
import * as Stats from "stats-js";
import * as dat from "dat.gui";

import { withFirebase } from "./Firebase";
import Elevator from "./Elevator";
import { Button, Icon } from "semantic-ui-react";
import PlanCanvas from "./PlanCanvas";
import { BrowserRouter as Router, Route } from "react-router-dom";
import * as ROUTES from "../constants/routes";

const paddedWall = 15;
const voxelSizePlus = 30 + paddedWall;

/// data an array of arrays: row, col, pos
// [[x,y,0 or 1],...] for each wall

const SaveButton = props => {
  return (
    <button className="primary-button" onClick={() => props.onClick()}>
      Save
    </button>
  );
};

const BuildButton = props => {
  return (
    <button className="primary-button" onClick={() => props.onClick()}>
      Build
    </button>
  );
};

const Instructions = () => {
  return (
    <div className="instructions-holder">
      <ul>
        <li>click to add a wall</li>
        <li>drag mouse to extend wall</li>
        <li>shift + click to remove wall</li>
      </ul>
    </div>
  );
};

const FloorplanTitle = props => {
  return (
    <input
      type="text"
      value={props.content}
      onChange={props.onTitleChangeHandler}
      className="floorplan-title-field"
      placeholder="Floorplan 1"
    />
  );
};

class Maker extends Component {
  constructor(props) {
    super(props);
    // console.log("props", props);
    this.voxelsX = 700 / voxelSizePlus;
    this.voxelsY = 500 / voxelSizePlus;
    this.state = {
      width: 700,
      height: 520,
      posts: {},
      data: [],
      voxels: {},
      walls: {},
      title: "",
      nowBuild: false,
      buildFloorKey: null
      // stats: new Stats()
    };
    this.stats = new Stats();
  }

  componentDidMount() {
    this.setState({ walls: this.setWalls() }); //, this.renderCanvas
    // this.stats = new Stats();
    this.stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);
  }
  componentWillUnmount() {}

  setLocalStorage(plan) {
    const dataStringified = JSON.stringify(plan);
    localStorage.setItem("planData", dataStringified);
  }

  pushToDatabase(plan) {
    const floorplanKey = this.props.firebase.storeFloorplan(plan);
    this.setState({ buildFloorKey: floorplanKey });
  }

  getWallsFromPos(x, y) {
    //x,y are mouse position
    return this.state.walls[Math.floor(x / voxelSizePlus)][
      Math.floor(y / voxelSizePlus)
    ];
  }

  getWallsFromCoords(x, y) {
    //x,y are positions on grid
    return this.state.walls[x][y];
  }

  buildWallFromCoords(x, y, dir) {
    //dir is top or left
    console.log("buildWallFromCoords", this.getWallsFromCoords(4, 4));
    this.state.walls[4][4][dir === "left" ? 0 : 1].setBuilt();
    this.renderWalls();
  }

  isAdjacentToWall(wall) {
    const dir = this.buildingWall.pos === "left" ? 0 : 1;

    if (
      wall === this.buildingWall ||
      wall.getDirection() !== this.buildingWall.getDirection()
    ) {
      return false;
    }
    if (dir === 0) {
      let prevRow =
        wall.row > 0 ? this.state.walls[wall.col][wall.row - 1][dir].built : 0;
      let nextRow =
        wall.row < this.voxelsX
          ? this.state.walls[wall.col][wall.row + 1][dir].built
          : 0;
      return prevRow + nextRow;
    }
    if (dir === 1) {
      const prevCol =
        wall.col > 0 ? this.state.walls[wall.col - 1][wall.row][dir].built : 0;
      const nextCol =
        wall.col < this.voxelsY
          ? this.state.walls[wall.col + 1][wall.row][dir].built
          : 0;

      return prevCol + nextCol;
    }
    return this.buildingWall.getDirection() === "top";
  }

  setWalls() {
    let walls = {};
    for (let i = 0; i < this.voxelsX; i++) {
      walls[i] = {};
      for (let j = 0; j < this.voxelsY; j++) {
        walls[i][j] = [
          new Wall("left", this.ctx, i, j),
          new Wall("top", this.ctx, i, j)
        ];
      }
    }
    console.table(walls);
    return walls;
  }

  getWallsFromState(i, j) {
    return this.state.walls[i][j];
  }

  onSaveClick() {
    const voxels = [];
    for (let i in this.state.walls) {
      voxels[i] = [];
      for (let j in this.state.walls[i]) {
        const walls = this.getWallsFromState(i, j);
        voxels[i][j] = { walls: [walls[0].built, walls[1].built] };
      }
    }

    const plan = {
      title: this.state.title,
      data: voxels,
      timestamp: Date.now()
    };
    this.setLocalStorage(plan);
    this.pushToDatabase(plan);
    this.setState({ nowBuild: true });
  }

  clearWalls(plan) {
    this.changePlan(plan, this.removeWallFn);
  }

  useStoredPlan(plan) {
    this.changePlan(plan, this.setIfBuiltFn);
    console.log("make this plan", plan);
  }

  setIfBuiltFn = (i, j, plan) => {
    const walls = this.getWallsFromState(i, j);
    if (plan[i][j].walls[0]) walls[0].setBuilt();
    if (plan[i][j].walls[1]) walls[1].setBuilt();
  };

  removeWallFn = (i, j) => {
    const walls = this.getWallsFromState(i, j);
    walls[0].removeWall();
    walls[1].removeWall();
  };

  changePlan(plan, changeFunction) {
    for (let i in plan) {
      for (let j in plan[i]) {
        changeFunction(i, j, plan);
      }
    }
    this.setState({ timestamp: Date.now() });
  }

  tileClickHandler = ({ data }) => {
    console.log("tileClickHandler", data);
    this.clearWalls(data);
    this.useStoredPlan(data);
  };
  floors = {
    0: {
      level: 0,
      name: "Help",
      y: 0,
      floorComponent: HelpFloor
    },
    1: {
      level: 1,
      name: "Floorplans",
      y: 235,
      floorComponent: PreFab,
      tileCallback: this.tileClickHandler
    }
  };

  onTitleChangeHandler = ({ target }) => {
    this.setState({ title: target.value });
  };

  galleryButtonRoute = () => (
    <Route
      path="/"
      render={props => {
        props.merge({
          plan: this.state.buildFloorKey,
          text: `Build ${this.state.title}`
        });
        return <ButtonToNavigate {...props} />;
      }}
    />
  );

  render() {
    const { nowBuild } = this.state;
    return (
      <div className="maker-page">
        <h1>Maker</h1>
        <div className="content-column-holder">
          <div className="content-column">
            <div className="floorplan-title">
              <FloorplanTitle
                content={this.state.title}
                onTitleChangeHandler={this.onTitleChangeHandler}
              />
            </div>
            <div className="button-holder">
              {nowBuild ? (
                <GalleryButtonRoute
                  plan={this.state.buildFloorKey}
                  title={`Build ${this.state.title}`}
                />
              ) : (
                <SaveButton onClick={() => this.onSaveClick()} />
              )}
            </div>

            <div className="canvas-holder">
              <PlanCanvas
                width={this.state.width}
                height={this.state.height}
                walls={this.state.walls}
                stats={this.stats}
              />
            </div>

            <Elevator name="Plans" floors={this.floors} />
          </div>
        </div>
      </div>
    );
  }
}
const GalleryButtonRoute = props => (
  <Route
    path="/"
    render={routeProps => {
      // routeProps.merge(props);
      const buttonProps = Object.assign(routeProps, props);
      return <ButtonToNavigate {...routeProps} />;
    }}
  />
);

const HelpFloor = () => {
  return <Instructions />;
};

const PlansFloor = floor => {
  return <PreFab floor={floor} />;
};

const ButtonToNavigate = props => {
  const { title, history, plan } = props;
  return (
    <button
      type="button"
      className="primary-button"
      onClick={() =>
        history.push({ pathname: "/gallery", state: { plan, title } })
      }
    >
      {title}
    </button>
  );
};

export default withFirebase(Maker);
