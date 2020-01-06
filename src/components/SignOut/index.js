import React, { Component } from "react";

import { withFirebase } from "../Firebase";

class SignOutButton extends Component {
  constructor(props) {
    super(props);
    console.log("SignOutButton", props);
  }
  //{this.props.user.user.displayName}

  render() {
    console.log("SignOutButton render", this.props);

    if (this.props.firebase.currentUser)
      console.log(
        "sign out this.props.user.authUser.displayName",
        this.props.firebase.currentUser.displayName
      );
    // debugger;
    return (
      <button type="button" onClick={this.props.firebase.doSignOut}>
        Sign Out
      </button>
    );
  }
}

export default withFirebase(SignOutButton);
