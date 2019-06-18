import React, { Component } from "react";
import Maker from "./Maker";
// import * as firebase from "firebase";
import Builder from "./Builder";
import { withFirebase } from "./Firebase";

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
    if (view === "Maker") {
      viewComponent = (
        <Maker buildHandler={walls => this.buildHandler(walls)} />
      );
    }
    return <div>{viewComponent}</div>;
  }
}

export default App;
