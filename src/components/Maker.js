import React, { Component } from "react";
import "../css/maker.css";
import Wall from "./Wall";
import PreFab from "./PreFab";

import { withFirebase } from "./Firebase";
import Elevator from "./Elevator";

const paddedWall = 15;
const voxelSizePlus = 30 + paddedWall;

/// data an array of arrays: row, col, pos
// [[x,y,0 or 1],...] for each wall

const Button = props => {
  return (
    <button className="primary-button" onClick={() => props.onClick()}>
      Save
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
      shiftDown: false
    };
  }

  componentDidMount() {
    this.canvas = this.refs.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.setState({ walls: this.setWalls() }, this.renderCanvas);
    this.setupListeners();
    // var planData = JSON.parse(localStorage.getItem("planData"));
    // console.log("planData", planData);
  }

  setupListeners() {
    this.canvas.addEventListener("mousemove", e => {
      let x = e.clientX - this.canvas.offsetLeft,
        y = e.clientY - this.canvas.offsetTop;
      if (this.mouseoverWall) {
        this.renderWalls();
        this.mouseoverWall = this.mouseoverWall.onMouseOut();
      }
      const walls = this.getWallsFromPos(x, y);
      console.log("walls", x, y, walls);
      if (!walls && !this.state.shiftDown) return;
      const options = {
        // shiftDown: this.shiftDown
      };
      if ((x - 5) % voxelSizePlus < paddedWall) {
        //left
        this.mouseoverWall = walls[0];
        console.log("this.shiftDown left", this.state.shiftDown);
        if (
          this.state.shiftDown &&
          this.mousedown &&
          this.mouseoverWall.built === 1
        ) {
          console.log("this.mouseoverWall", this.mouseoverWall);
          // debugger;
          this.mouseoverWall.removeWall();
          console.log("remove because shift down");
          return;
        }
        if (this.buildingWall) {
          console.log("build on mousedown left", this.state.shiftDown);
          options.isAdjacentToWall = this.isAdjacentToWall(walls[0]);
          this.mouseoverWall.onMouseDown(options);

          this.renderWalls();
        } else if (!this.buildingWall) {
          console.log("!this.buildingWall left");
          this.mouseoverWall.onMouseOver();
        }
      } else if ((y - 5) % voxelSizePlus < paddedWall) {
        //top
        this.mouseoverWall = walls[1];
        if (this.state.shiftDown && this.mousedown) {
          this.mouseoverWall.removeWall();
          console.log("remove top because shift down");
          return;
        }
        if (this.buildingWall) {
          console.log("build on mousedown top", this.shiftDown);
          options.isAdjacentToWall = this.isAdjacentToWall(walls[1]);

          this.mouseoverWall.onMouseDown(options);
          this.renderWalls();
        } else if (!this.buildingWall) {
          console.log("!this.buildingWall top");
          this.mouseoverWall.onMouseOver();
        }
      } else {
        this.mouseoverWall = false;
      }
    });
    this.canvas.addEventListener("mousedown", e => this.onMouseDown(e));
    this.canvas.addEventListener("mouseup", e => {
      this.mousedown = false;
      this.buildingWall = null;
    });
    document.addEventListener("keydown", e => this.onKeyDown(e));
    document.addEventListener("keyup", e => this.onKeyUp(e));
  }

  pushToData() {
    const voxels = [];
    for (let i in this.state.walls) {
      voxels[i] = [];
      for (let j in this.state.walls[i]) {
        const walls = this.getWallsFromState(i, j);
        voxels[i][j] = { walls: [walls[0].built, walls[1].built] };
      }
    }
    const dataStringified = JSON.stringify(voxels);
    console.log("this.data", this.data);
    localStorage.setItem("planData", dataStringified);
    this.props.firebase.storeFloorplan(dataStringified);
    // });
  }

  onMouseDown = e => {
    this.mousedown = true;
    console.log("mousedown this.mousedown", this.mousedown);

    if (this.mouseoverWall) {
      const options = {
        shiftDown: this.shiftDown,
        isAdjacentToWall: true
      };
      this.buildingWall = this.mouseoverWall.onMouseDown(options);
      console.log("this.buildingWall", this.buildingWall);
    }
  };

  onKeyDown(e) {
    switch (e.keyCode) {
      case 16:
        console.log("shift down true");
        this.setState({ shiftDown: true });
        break;
    }
  }

  onKeyUp(e) {
    console.log("keyup ", e.key);
    switch (e.keyCode) {
      case 16:
        console.log("shift down false");

        this.setState({ shiftDown: false });

        break;
    }
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
      console.log("prevRow,nextRow", prevRow, nextRow);
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
    console.log("dir", dir);
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
  renderCanvas() {
    this.renderWalls();
    this.buildWallFromCoords();
  }

  renderWalls() {
    this.ctx.fillStyle = "rgba(38,50,56)";
    this.ctx.fillRect(0, 0, this.state.width, this.state.height);
    for (let i in this.state.walls) {
      for (let j in this.state.walls[i]) {
        const walls = this.getWallsFromState(i, j);
        if (j < this.voxelsY - 1) walls[0].draw(); //left
        if (i < this.voxelsX - 1) walls[1].draw(); //top
        if (walls[0].built + walls[1].built > 0) walls[0].drawPost();
      }
    }
  }
  getWallsFromState(i, j) {
    return this.state.walls[i][j];
  }

  onSaveClick() {
    this.pushToData();
    this.props.buildHandler(this.state.walls);
  }

  clearWalls(plan) {
    this.changePlan(plan, "removeWall");
  }

  useStoredPlan(plan) {
    console.log("make this plan", plan);
    for (let i in plan) {
      for (let j in plan[i]) {
        const walls = this.getWallsFromState(i, j);

        if (plan[i][j].walls[0]) walls[0].setBuilt();
        if (plan[i][j].walls[1]) walls[1].setBuilt();
      }
    }
    this.renderWalls();
  }

  changePlan(plan, changeFunction) {
    for (let i in plan) {
      for (let j in plan[i]) {
        const walls = this.getWallsFromState(i, j);

        walls[0][changeFunction]();
        walls[1][changeFunction]();
      }
    }
    this.renderWalls();
  }

  tileClickHandler = data => {
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

  // tileCallback={this.tileCallback}

  render() {
    return (
      <div className="maker-page">
        <h1>Maker</h1>
        <div className="content-column-holder">
          <div className="content-column">
            <div className="button-holder">
              <Button icon="save" onClick={() => this.onSaveClick()} />
            </div>

            <div className="canvas-holder">
              <canvas
                ref="canvas"
                width={this.state.width}
                height={this.state.height}
              />
            </div>

            <Elevator name="Plans" floors={this.floors} />
          </div>
        </div>
      </div>
    );
  }
}

const HelpFloor = () => {
  return <Instructions />;
};

const PlansFloor = floor => {
  return <PreFab floor={floor} />;
};

export default withFirebase(Maker);
