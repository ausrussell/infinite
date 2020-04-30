import React from "react";
import { withRouter } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import { compose } from "recompose";

import { withFirebase } from "../Firebase";

const SignOutButtonBase = (props) =>{ 
  const onClick = () => {
    props.firebase
      .doSignOut()
      .then(() => props.history.push(ROUTES.HOME));
  };
    return (
      <span onClick={onClick}>
        Sign Out
      </span>
    );
  
}

const SignOutButton = compose(
  withRouter,
  withFirebase
)(SignOutButtonBase);

export default SignOutButton;
