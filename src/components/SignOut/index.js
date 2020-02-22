import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import { compose } from "recompose";

import { withFirebase } from "../Firebase";

class SignOutButtonBase extends Component {
  constructor(props) {
    super(props);
    console.log("SignOutButton", props);
  }
  onClick = () => {
    this.props.firebase
      .doSignOut()
      .then(() => this.props.history.push(ROUTES.HOME));
  };

  render() {
    return (
      <button type="button" onClick={this.onClick}>
        Sign Out
      </button>
    );
  }
}

const SignOutButton = compose(
  withRouter,
  withFirebase
)(SignOutButtonBase);

export default SignOutButton;
