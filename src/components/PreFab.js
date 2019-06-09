import React, { Component } from "react";
import { withFirebase } from "./Firebase";

class PreFab extends Component {
  state = {
    userFloorplans: []
  };
  constructor(props) {
    super(props);
    console.log("prefab props", props);
  }

  componentDidMount() {
    this.updateState();
    // console.log(userFloorplans);
  }

  updateState = () => {
    this.props.firebase
      .getUsersFloorplans()
      .then(list => this.setState({ userFloorplans: list }));
  };

  useLocalStorage = () => {
    const localPlan = JSON.parse(localStorage.getItem("planData"));
    console.log(localPlan);
    this.props.useStoredPlan(localPlan);
  };

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
  removePlan(key) {
    console.log("remove", key);
    this.props.firebase.removePlan(key);
    this.updateState();
  }
  //{item.data[0][0].walls[0])})
  renderFloorplanTile(snapshot) {
    console.log(snapshot.key, snapshot.val());
    const planData = JSON.parse(snapshot.val().data);
    const { key } = snapshot;
    return (
      <div key={snapshot.key} className="tile tile-center-content">
        <button
          onClick={() => this.removePlan(key)}
          className="remove-plan-button"
        >
          x
        </button>
        <div onClick={() => this.props.tileCallback(planData)}>
          <CanvasTile data={JSON.parse(snapshot.val().data)} />
        </div>
      </div>
    );
  }
  render() {
    const { userFloorplans } = this.state;
    return (
      <div>
        <div className="tile-holder">
          <div className="tile">
            <button onClick={this.useLocalStorage}>Last session</button>
          </div>

          {userFloorplans.map(data => this.renderFloorplanTile(data))}
        </div>
      </div>
    );
  }
}

class CanvasTile extends Component {
  constructor(props) {
    super(props);
    this.tileEdgeSize = 140;
    this.canvas = React.createRef();
    this.planData = this.props.data;
    this.voxelsX = this.planData.length;
    this.voxelsY = this.planData[0].length;
    this.voxelSize = this.tileEdgeSize / this.voxelsX;
    this.voxelWidth = 2;
    console.log("this.voxelsY", this.voxelsY, "this.voxelsX", this.voxelsX);
  }
  componentDidMount() {
    const canvas = this.canvas.current;
    this.ctx = canvas.getContext("2d");
    canvas.width = this.tileEdgeSize;
    canvas.height = this.voxelSize * this.voxelsY;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.ctx.fillStyle = "#ccddff";
    this.renderWalls();
  }
  drawWall(row, col, pos) {
    this.ctx.fillRect(
      col * this.voxelSize, // + delta.horiz
      row * this.voxelSize, //+ delta.vert
      pos === "top" ? this.voxelSize : this.voxelWidth, //- delta.horiz
      pos === "top" ? this.voxelWidth : this.voxelSize // - delta.vert
    );
  }
  renderWalls() {
    for (let i in this.planData) {
      for (let j in this.planData[i]) {
        const walls = this.planData[i][j].walls;
        if (walls[0]) this.drawWall(j, i, "left"); //left
        if (walls[1]) this.drawWall(j, i, "top"); //top
      }
    }
  }
  render() {
    return <canvas ref={this.canvas} />;
  }
}

export default withFirebase(PreFab);
