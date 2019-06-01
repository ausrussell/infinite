import React, { Component } from "react";
import Maker from "./Maker";
import * as firebase from "firebase";
import Builder from "./Builder";
class App extends Component {
  constructor() {
    super();
    this.state = {
      walls: {},
      view: "Maker" //Builder" //
    };
  }
  buildHandler(walls) {
    console.log("build this", walls, this);
    this.setState({ walls: walls, view: "Builder" });
  }
  render() {
    const view = this.state.view;
    let viewComponent;
    console.log("state", this.state, view === "Maker");
    if (view === "Maker") {
      viewComponent = (
        <Maker buildHandler={walls => this.buildHandler(walls)} />
      );
    } else {
      viewComponent = <Builder walls={this.state.walls} />;
    }
    console.log("viewComponent", viewComponent);
    return <div>{viewComponent}</div>;
  }
}

export default App;
