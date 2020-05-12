import React, { Component } from "react";
import "../../css/maker.css";
import Wall from "./Wall";
import PreFab from "./PreFab";
import { withAuthentication } from "../Session";
import Elevator from "../Elevator";
import PlanCanvas from "./PlanCanvas";
import FloorplanHeader from './FloorplanHeader';

const paddedWall = 15;
const voxelSizePlus = 30 + paddedWall;

/// data an array of arrays: row, col, pos
// [[x,y,0 or 1],...] for each wall

class Planner extends Component {
  state = {
    width: 700,
    height: 520,
    walls: {},
    title: "",
    nowBuild: false,
    buildFloorKey: null,
    data: {}
  };
  constructor(props) {
    super(props);
    console.log("Planner props", props);
    this.voxelsX = 700 / voxelSizePlus;
    this.voxelsY = 500 / voxelSizePlus;
  }

  componentDidMount() {
    this.setState({ walls: this.setWalls() });
  }

  componentWillUnmount() { }

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
        console.log("set wall", i, j)
      }
    }
    console.table(walls);
    return walls;
  }

  getWallsFromState(i, j) {
    return this.state.walls[i][j];
  }

  onSaveClickWallData = () => {
    const voxels = [];
    for (let i in this.state.walls) {
      voxels[i] = [];
      for (let j in this.state.walls[i]) {
        const walls = this.getWallsFromState(i, j);
        voxels[i][j] = { walls: [walls[0].built, walls[1].built] };
      }
    }
    return voxels
    // const plan = {
    //   title: this.state.title,
    //   data: voxels,
    //   timestamp: Date.now()
    // };
    // this.setLocalStorage(plan);
    // this.pushToDatabase(plan);
    // this.setState({ nowBuild: true });
  }

  clearWalls(plan) {
    this.changePlan(plan, this.removeWallFn);
  }

  useStoredPlan(plan) {
    this.changePlan(plan, this.setIfBuiltFn);
    console.log("make this plan", plan);
    this.setState({ data: plan })
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
  }

  tileClickHandler = (returnedData) => {
    console.log("tileClickHandler", returnedData);
    const { data, key } = returnedData;
    this.setState({ title: returnedData.title, id: key })
    this.clearWalls(data);
    this.useStoredPlan(data);
  };
  floors = {
    0: {
      level: 0,
      name: "Floorplans",
      floorComponent: PreFab,
      tileCallback: this.tileClickHandler
    }
  };

  statsCallback() {
    // this.stats.update();
  }

  reset = () => {
    this.clearWalls(this.state.walls);
    this.setState({ id: "" });
  }

  render() {
    return (
      <div>
        <FloorplanHeader title={this.state.title} id={this.state.id} reset={this.reset} onSaveClickWallData={this.onSaveClickWallData} />
        <div className="content-column-holder">
          <div className="content-column">

            <div className="canvas-holder">
              <PlanCanvas
                statsCallback={() => this.statsCallback()}
                width={this.state.width}
                height={this.state.height}
                walls={this.state.walls}
                stats={this.props.stats}
              />
            </div>
            {this.props.firebase.currentUID && (
              <Elevator name="Plans" floors={this.floors} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withAuthentication(Planner);
