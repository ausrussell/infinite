import React, { Component } from "react";
import Maker from "./Maker";
// import * as firebase from "firebase";
<<<<<<< HEAD:src/components/AppX.js
// import Builder from "./Builder";
=======
import Builder from "./Builder";
>>>>>>> c8bad0b60d8806c539e78dd9454028cd387eb640:src/components/App.js
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
