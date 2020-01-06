import React, { Component } from "react";
import { Link } from "react-router-dom";
import SignOutButton from "../SignOut";
import * as ROUTES from "../../constants/routes";
import { withFirebase } from "../Firebase";

import { AuthUserContext, withAuthentication } from "../Session";
import { Transition, Spring, animated, config } from "react-spring/renderprops";

class Navigation extends Component {
  state = {
    deskOpen: false,
    user: null
  };
  constructor(props) {
    super(props);
    console.log("Navigation", this.props);
  }

  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
      console.log("onAuthStateChanged", authUser);

      this.setState({ user: authUser });
      console.log("listener in Navigation", authUser);
      // this.props.push(this.state);
    });
  }

  componentWillUnmount() {
    this.listener();
  }

  onDeskClick = () => {
    this.setState({ deskOpen: !this.state.deskOpen });
  };
  render() {
    const { deskOpen } = this.state;
    const styles = {
      opacity: deskOpen ? 1 : 0,
      height: deskOpen ? "auto" : 0
      // width: vaultOpen ? "100%" : "0%",
      // color: "#fff"
    };
    // if (this.props.firebase.currentUser) {
    //   ? this.props.firebase.currentUser
    //   : null;
    // // }
    console.log("render in Navigation firebase this.state", this.state);
    const userName = this.state.user ? this.state.user.displayName : null;
    console.log("userName", userName);
    return (
      <div className="navigation-holder">
        <div>{userName || "Public"}</div>
        <DeskButton onClick={() => this.onDeskClick()} />

        <Spring from={{ opacity: 0, height: 0 }} to={styles}>
          {props => {
            return (
              <div style={props}>
                <AuthUserContext.Consumer>
                  {authUser =>
                    authUser ? (
                      <NavigationAuth user={userName} authUser={authUser} />
                    ) : (
                      <NavigationNonAuth />
                    )
                  }
                </AuthUserContext.Consumer>
              </div>
            );
          }}
        </Spring>
      </div>
    );
  }
}

const DeskButton = props => {
  return (
    <button className="desk-button" onClick={props.onClick}>
      Desk
    </button>
  );
};

const NavigationAuth = (user, authuser) => {
  console.log("NavigationAuth , user, authuser", user, authuser);
  return (
    <ul className="navigation-list">
      <li>
        <Link to={ROUTES.LANDING}>Landing</Link>
      </li>
      <li>
        <Link to={ROUTES.HOME}>Home</Link>
      </li>
      <li>
        <Link to={ROUTES.ACCOUNT}>Account</Link>
      </li>
      <li>
        <Link to={ROUTES.ADMIN}>Admin</Link>
      </li>
      <li>
        <Link to={ROUTES.PLANNER}>Planner</Link>
      </li>
      <li>
        <Link to={ROUTES.BUILDER}>Builder</Link>
      </li>
      <li>
        <SignOutButton />
      </li>
    </ul>
  );
};

const NavigationNonAuth = () => (
  <ul>
    <li>
      <Link to={ROUTES.LANDING}>Landing</Link>
    </li>
    <li>
      <Link to={ROUTES.SIGN_IN}>Sign In</Link>
    </li>
  </ul>
);

export default withAuthentication(Navigation);
