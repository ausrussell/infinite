import React, { Component } from "react";
import { Link } from "react-router-dom";
import SignOutButton from "../SignOut";
import * as ROUTES from "../../constants/routes";

import { AuthUserContext } from "../Session";
<<<<<<< HEAD
import { Transition, Spring, animated, config } from "react-spring/renderprops";

class Navigation extends Component {
  state = {
    deskOpen: false
  };
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
    return (
      <div className="navigation-holder">
        <DeskButton onClick={() => this.onDeskClick()} />

        <Spring from={{ opacity: 0, height: 0 }} to={styles}>
          {props => {
            return (
              <div style={props}>
                <AuthUserContext.Consumer>
                  {authUser =>
                    authUser ? <NavigationAuth /> : <NavigationNonAuth />
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

const NavigationAuth = () => {
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
=======

const Navigation = () => (
  <div className="navigation-holder">
    <AuthUserContext.Consumer>
      {authUser => (authUser ? <NavigationAuth /> : <NavigationNonAuth />)}
    </AuthUserContext.Consumer>
  </div>
>>>>>>> c8bad0b60d8806c539e78dd9454028cd387eb640
);

const NavigationAuth = () => (
  <ul>
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
      <Link to={ROUTES.APP}>App</Link>
    </li>
    <li>
      <SignOutButton />
    </li>
  </ul>
);

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

export default Navigation;
