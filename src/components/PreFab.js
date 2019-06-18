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
<<<<<<< HEAD
    this.props.firebase.getUsersFloorplans(this.plansCallback);
  }

  plansCallback = data => {
    // debugger;
    const list = [];
    if (data) {
      data.forEach(function(childSnapshot) {
        // key will be "ada" the first time and "alan" the second time
        var key = childSnapshot.key;
        // childData will be the actual contents of the child
        var childData = childSnapshot.val();
        list.push(childSnapshot);
        console.log("childData", key, childData);
      });
    }
    this.setState({ userFloorplans: list });
=======
    this.updateState();
    // console.log(userFloorplans);
  }

  updateState = () => {
    this.props.firebase
      .getUsersFloorplans()
      .then(list => this.setState({ userFloorplans: list }));
>>>>>>> c8bad0b60d8806c539e78dd9454028cd387eb640
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
<<<<<<< HEAD
    // this.updateState();
=======
    this.updateState();
>>>>>>> c8bad0b60d8806c539e78dd9454028cd387eb640
  }
  //{item.data[0][0].walls[0])})
  renderFloorplanTile(snapshot) {
    console.log(snapshot.key, snapshot.val());
<<<<<<< HEAD
    const planData = snapshot.val();
    const { title, data } = planData;
=======
    const planData = JSON.parse(snapshot.val().data);
>>>>>>> c8bad0b60d8806c539e78dd9454028cd387eb640
    const { key } = snapshot;
    return (
      <div key={snapshot.key} className="tile tile-center-content">
        <button
          onClick={() => this.removePlan(key)}
          className="remove-plan-button"
        >
          x
        </button>
<<<<<<< HEAD
        <div className="tile-title">{title}</div>
        <div onClick={() => this.props.tileCallback(planData)}>
          <CanvasTile plan={data} />
=======
        <div onClick={() => this.props.tileCallback(planData)}>
          <CanvasTile data={JSON.parse(snapshot.val().data)} />
>>>>>>> c8bad0b60d8806c539e78dd9454028cd387eb640
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
<<<<<<< HEAD
    this.planData = this.props.plan;

=======
    this.planData = this.props.data;
>>>>>>> c8bad0b60d8806c539e78dd9454028cd387eb640
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
