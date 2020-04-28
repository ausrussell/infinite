// import React, { Component } from "react";

const paddedWall = 15;
const voxelSizePlus = 30 + paddedWall;

class Wall {
  constructor(pos, ctx, col, row) {
    //0 -> left; 1 -[left,top]
    this.pos = pos;
    this.ctx = ctx;
    this.row = row;
    this.col = col;
    this.built = 0;
    this.style = 0;
    //console.log(pos, ctx, row, col);
  }
  styleMap = {
    0: "#37474f", //not built
    1: "#B9F6CA", //onMouseOver
    2: "#ccddff", //built
    3: "#FFC107", //onMouseOver with shift
    4: "#FF6F00" //onMouseOver with shift over wall
  };
  onMouseOver(shiftDown) {
    // if (this.built) return;
    this.style = shiftDown ? 3 : 1;
    if (this.built && shiftDown) this.style = 4;
    return this;
  }
  onMouseOut() {
    // if (this.built) return;

    this.style = this.built ? 2 : 0;
    // this.draw();
    return false;
  }
  setBuilt() {
    this.built = 1;
    this.style = 2;
  }
  onMouseDown(shiftDown) {
    console.log("shiftDown", shiftDown);
    if (shiftDown) {
      this.removeWall();
    } else {
      this.setBuilt();
    }
    return this;
  }
  getDirection() {
    return this.pos;
  }
  setCtx(ctx) {
    this.ctx = ctx;
  }

  draw(ctx) {
    if (!this.ctx) this.setCtx(ctx);
    this.ctx.fillStyle = this.styleMap[this.style]; //this.state.walls[i][j][0] ? "#0033aa" : "#99aacc";
    const hoverDelta = {
      vert: this.pos === "left" ? 5 : 0,
      horiz: this.pos === "top" ? 5 : 0
    };
    //this.style === 1 &&
    //this.style === 1 &&
    this.ctx.fillRect(
      this.col * voxelSizePlus + 5 + hoverDelta.horiz, // 5here is the non-wallborder round canvas
      this.row * voxelSizePlus + 5 + hoverDelta.vert,
      this.pos === "top" ? voxelSizePlus - hoverDelta.horiz : 5,
      this.pos === "top" ? 5 : voxelSizePlus - hoverDelta.vert
    ); //horiz
    // this.ctx.font = "14px Arial";
    // this.ctx.fillStyle = "#559";
    // this.ctx.fillText(
    //   this.col + "," + this.row,
    //   this.col * voxelSizePlus + 20,
    //   this.row * voxelSizePlus + 40
    // );
  }
  drawPost() {
if (!this.ctx) debugger;
    this.ctx.fillStyle = this.styleMap[2];
    this.ctx.fillRect(
      this.col * voxelSizePlus + 5,
      this.row * voxelSizePlus + 5,
      5,
      5
    );
  }
  removeWall() {
    // console.log("removeWall", this.col, this.row);
    this.style = 0;
    this.built = 0;
  }
}

export default Wall;
