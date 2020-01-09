import React, { Component } from "react";

const paddedWall = 15;
const voxelSizePlus = 30 + paddedWall;

class PlanCanvas extends Component {
  state = {
    width: null,
    height: null,
    // walls: {},
    title: "",
    lastEdit: null,
    mousedown: false,
    shiftDown: false,
    mouseoverWall: [], ///col,row,pos
    buildingWallAr: [],
    x: 0,
    y: 0,
    buildTo: null,
    buildDirection: "",
    newBuildingWall: 0,
    overCanvas: false,
    counter: 0
  };
  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {
    // const { width, height } = this.props;
    this.canvas = this.refs.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.setupListeners();
  }

  componentDidUpdate(prevProps) {
    if (
      Object.entries(prevProps.walls).length === 0 &&
      Object.entries(this.props.walls).length > 0
    ) {
      //only start animating once walls come through
      // this.setCtx(this.ctx);
      // this.renderWalls();
      this.updateAnimationState();
    }
  }
  componentWillUnmount() {
    this.canvas.removeEventListener("mousemove", this.mouseMoveRef);
    this.canvas.removeEventListener("mouseenter", this.mouseEnterRef);
    this.canvas.removeEventListener("mouseleave", this.mouseLeaveRef);

    this.canvas.removeEventListener("mousedown", this.mouseDownRef);
    this.canvas.removeEventListener("mouseup", this.mouseUpRef);
    document.removeEventListener("keydown", this.keyDownRef);
    document.removeEventListener("keyup", this.keyUpRef);

    cancelAnimationFrame(this.rAF);
  }
  setupListeners() {
    this.mouseMoveRef = this.onMouseMove.bind(this);
    this.mouseDownRef = this.onMouseDown.bind(this);
    this.mouseEnterRef = this.onMouseEnter.bind(this);
    this.mouseLeaveRef = this.onMouseLeave.bind(this);

    this.mouseUpRef = this.onMouseUp.bind(this);
    this.keyDownRef = this.onKeyDown.bind(this);
    this.keyUpRef = this.onKeyUp.bind(this);

    this.canvas.addEventListener("mousemove", this.mouseMoveRef);
    this.canvas.addEventListener("mouseenter", this.mouseEnterRef);
    this.canvas.addEventListener("mouseleave", this.mouseLeaveRef);
    this.canvas.addEventListener("mousedown", this.mouseDownRef);
    this.canvas.addEventListener("mouseup", this.mouseUpRef);
    document.addEventListener("keydown", this.keyDownRef);
    document.addEventListener("keyup", this.keyUpRef);

    this.updateAnimationState = this.updateAnimationState.bind(this);
  }

  onMouseEnter = () => this.setState({ overCanvas: true });
  onMouseLeave = () => {
    if (this.state.mouseoverWall.length > 0) {
      const [col, row, pos] = this.state.mouseoverWall;
      this.props.walls[col][row][pos].onMouseOut();
    }
    this.setState({ overCanvas: false, mouseoverWall: [] });
  };

  onMouseMove = e => {
    let x = e.clientX - this.canvas.offsetLeft + 1, //+ 1 to prevent
      y = e.clientY - this.canvas.offsetTop + 1;
    if (y < 0) debugger;
    let newAr;
    const walls = this.getWallsFromPos(x, y);
    let pos = null;
    if ((x - 5) % voxelSizePlus < paddedWall) {
      //get wall over or empty
      pos = 0;
      newAr = [walls[pos].col, walls[pos].row, pos];
    } else if ((y - 5) % voxelSizePlus < paddedWall) {
      pos = 1;
      newAr = [walls[pos].col, walls[pos].row, pos];
    } else {
      newAr = [];
    }
    const sameWall = this.compare(this.state.mouseoverWall, newAr);
    if (!sameWall && this.state.mousedown) {
      //only for extended building
      this.buildOnMove(x, y);
    }
    if (!sameWall && this.state.mouseoverWall.length > 0) {
      //mouseout
      const [col, row, pos] = this.state.mouseoverWall;
      this.props.walls[col][row][pos].onMouseOut();
    }
    if (!sameWall) {
      //set new wall
      this.setState({ mouseoverWall: newAr });
      this.setState({ x: x, y: y, counter: this.state.counter + 1 });
    }
  };

  onMouseDown = e => {
    this.setState({ mousedown: true });
    if (this.state.mouseoverWall.length > 0) {
      const buildingWall = this.getWallFromArray(
        this.state.mouseoverWall
      ).onMouseDown(this.state.shiftDown);
      const buildingWallAr = this.getArrayFromWall(buildingWall);
      this.setState({ buildingWallAr: buildingWallAr });
    }
  };
  onMouseUp = e => {
    this.setState({ mousedown: false, buildingWallAr: null, buildTo: null });
  };

  onKeyDown = e => {
    switch (e.keyCode) {
      case 16:
        this.setState({ shiftDown: true });
        break;
      default:
        break;
    }
  };

  onKeyUp = e => {
    switch (e.keyCode) {
      case 16:
        this.setState({ shiftDown: false });
        break;
      default:
        break;
    }
  };

  updateAnimationState = () => {
    this.renderWalls();
    this.rAF = requestAnimationFrame(this.updateAnimationState);
  };

  setCtx() {
    // this.setState({ counter: ++this.state.counter });
    for (let i in this.props.walls) {
      for (let j in this.props.walls[i]) {
        const walls = this.getWallsFromProps(i, j);
        walls[0].setCtx(this.ctx); //left
        walls[1].setCtx(this.ctx); //top
      }
    }
    // this.updateAnimationState();
  }
  renderWalls() {
    this.ctx.fillStyle = "rgba(38,50,56)";
    this.ctx.fillRect(0, 0, this.props.width, this.props.height);
    const voxelsY = this.props.height / voxelSizePlus;
    const voxelsX = this.props.width / voxelSizePlus;
    if (this.state.overCanvas) this.userEvents();

    for (let i in this.props.walls) {
      for (let j in this.props.walls[i]) {
        const walls = this.getWallsFromProps(i, j);
        if (j < voxelsY - 1) walls[0].draw(this.ctx); //left
        if (i < voxelsX - 1) walls[1].draw(this.ctx); //top
        if (walls[0].built + walls[1].built > 0) walls[0].drawPost();
      }
    }
    // debugger;
    // this.props.stats.update();
  }
  userEvents = () => {
    this.doAnyHover();
    if (this.state.mousedown && this.state.buildingWallAr)
      this.doAnyExtendedBuilding();
  };

  doAnyExtendedBuilding() {
    const { buildTo } = this.state;
    if (!buildTo) return;

    const buildDirection = this.state.buildingWallAr[2];
    let makeChange = false;
    let newBuildingWallAr;
    if (buildDirection === 1 && buildTo[0] !== this.state.buildingWallAr[0]) {
      const leftRight = buildTo[0] > this.state.buildingWallAr[0] ? 1 : -1;
      newBuildingWallAr = [
        this.state.buildingWallAr[0] + leftRight,
        this.state.buildingWallAr[1],
        buildDirection
      ];
      makeChange = true;
    }
    if (buildDirection === 0 && buildTo[1] !== this.state.buildingWallAr[1]) {
      const topDown = buildTo[1] > this.state.buildingWallAr[1] ? 1 : -1;
      newBuildingWallAr = [
        this.state.buildingWallAr[0],
        this.state.buildingWallAr[1] + topDown,
        buildDirection
      ];
      makeChange = true;
    }
    if (makeChange) {
      const newWall = this.getWallFromArray(newBuildingWallAr);
      if (this.state.shiftDown) {
        newWall.removeWall();
        this.setState({ buildingWallAr: newBuildingWallAr });
      } else {
        newWall.setBuilt();

        this.setState({ buildingWallAr: newBuildingWallAr });
      }
    }
  }

  doAnyHover() {
    if (this.state.mouseoverWall.length === 0 || this.state.mousedown) return;
    this.getWallFromArray(this.state.mouseoverWall).onMouseOver(
      this.state.shiftDown
    );
  }

  compare = (arr1, arr2) => {
    if (!arr1 || !arr2) return;
    let result;
    arr1.forEach((e1, i) =>
      arr2.forEach(e2 => {
        if (e1.length > 1 && e2.length) {
          result = this.compare(e1, e2);
        } else if (e1 !== e2) {
          result = false;
        } else {
          result = true;
        }
      })
    );

    return result;
  };

  getWallsFromPos(x, y) {
    if (y < 0) debugger;
    if (x > 5) x -= 5;
    if (y > 5) y -= 5;
    console.log(
      "getWallsFromPos",
      Math.floor(x / voxelSizePlus),
      Math.floor(y / voxelSizePlus)
    );
    return this.props.walls[Math.floor(x / voxelSizePlus)][
      Math.floor(y / voxelSizePlus)
    ];
  }

  getVoxelFromPos(x, y) {
    // x += 25;
    // y += 5;
    console.log(
      "getVoxelFromPos",
      Math.floor(x / voxelSizePlus),
      Math.floor(y / voxelSizePlus)
    );
    return [Math.floor(x / voxelSizePlus), Math.floor(y / voxelSizePlus)];
  }

  getArrayFromWall(wall) {
    return [wall.col, wall.row, wall.pos === "left" ? 0 : 1];
  }

  getWallsFromProps(i, j) {
    return this.props.walls[i][j];
  }
  getWallFromArray([col, row, pos]) {
    return this.props.walls[col][row][pos];
  }

  buildOnMove(x, y) {
    //stop dragging beyond Canvas
    const voxelTo = this.getVoxelFromPos(x, y);
    this.setState({ buildTo: voxelTo });
  }

  render() {
    const { width, height } = this.props;
    const { x, y, counter } = this.state;
    //   var divStyle = {
    // color: 'white'}
    return (
      <div>
        <div style={{ color: "#f81" }}>
          mouse: {x},{y} - counter {counter}
        </div>
        <canvas ref="canvas" width={width} height={height} />
      </div>
    );
  }
}

export default PlanCanvas;
