import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import * as BUTTONS from "./buttons";
import { Card, Row, Col, Tooltip } from "antd";
// import Icon from "@ant-design/icons"
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

class PreFab extends Component {
  state = {
    userFloorplans: []
  };

  componentDidMount() {
    this.props.firebase.getUsersFloorplans(this.plansCallback);
  }

  componentWillUnmount() {
    this.props.firebase.detachGetUsersFloorplans();
  }

  plansCallback = data => {
    console.log("Prefab plansCallback", data);
    const list = [];
    if (data) {
      data.forEach(function (childSnapshot) {
        list.push(childSnapshot);
      });
    }
    this.setState({ userFloorplans: list });
    console.log("Prefab plansCallback", list);
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
    this.props.firebase.removePlan(key);
  }

  buildPlan(key) {
    debugger; //looks wropng
    this.props.firebase.removePlan(key);
  }

  cardStyle = {
    // height: 140,
    width: 140,
    // margin: 'auto', 
    // marginBottom: 16
  }


  renderFloorplanTile(snapshot) {
    const planData = snapshot.val();
    const { title, data } = planData;
    const { key } = snapshot;
    planData.key = key;

    console.log("key", key, data)
    return (
      <Col key={key}>
        <Card size="small" style={this.cardStyle}
          title={title}
          cover={<CanvasTile plan={data} />}
          bodyStyle={{ padding: 0 }}
          actions={[
            <Tooltip title="Edit"><EditOutlined key="edit" onClick={() => this.props.tileCallback(planData)} /></Tooltip>,
            <Tooltip title="Delete"><DeleteOutlined key="delete" onClick={() => this.removePlan(key)} /></Tooltip>,
            <Tooltip title="Build"><span><BUTTONS.PlannerButtonRoute key="build" plan={key} title={title} /></span></Tooltip>

          ]}>

        </Card>
      </Col>
    );
  }



  render() {
    const { userFloorplans } = this.state;
    return (
      <div>
        <div className="tile-holder">
          <Row gutter={[16, 16]}>

            {userFloorplans.map(data => this.renderFloorplanTile(data))}
          </Row>
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
    this.planData = this.props.plan;
    this.voxelsX = this.planData.length;
    this.voxelsY = this.planData[0].length;
    this.voxelSize = this.tileEdgeSize / this.voxelsX;
    this.voxelWidth = 2;
  }

  componentDidMount() {
    this.buildCanvas();
  }

  componentDidUpdate(prevProps) {
    console.log("componentDidUpdate CanvasTile",prevProps.plan,this.props.plan)
    if (prevProps.plan !== this.props.plan) this.buildCanvas();
  }

  buildCanvas() {
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
    return (<div style={{ height: 80, overflow: "hidden" }}><canvas ref={this.canvas} /></div>);
  }
}

export default withFirebase(PreFab);
