import React, { Component } from "react";
import { Link } from "react-router-dom";
import SignOutButton from "../SignOut";
import * as ROUTES from "../../constants/routes";
import { withFirebase } from "../Firebase";

import { AuthUserContext, withAuthentication } from "../Session";
import { Transition, Spring, animated, config } from "react-spring/renderprops";
import { Menu } from 'antd';

class Navigation extends Component {
  state = {
    current: "map"
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

  onClick = e => {
    console.log('click ', e);
    this.setState({
      current: e.key,
    });
  };

  render() {
    return (

      <AuthUserContext.Consumer>
        {authUser =>
          authUser ? (
            <NavigationAuth selectedKeys={[this.state.current]} onClick={this.onClick} />
          ) : (
              <NavigationNonAuth />
            )
        }
      </AuthUserContext.Consumer>

    );
  }
}

{/* <Menu.Item key="admin">
<Link to={ROUTES.ADMIN}>Admin</Link>
</Menu.Item> */}


const NavigationAuth = (props) => {
  const { selectedKeys } = props;
  // console.log("NavigationAuth , user, authuser", user, authuser);
  return (
    <Menu selectedKeys={selectedKeys} mode="horizontal" onClick={props.onClick}>

      <Menu.Item key="map">
        <Link to={ROUTES.LANDING}>Map</Link>
      </Menu.Item>
      <Menu.Item key="account">
        <Link to={ROUTES.ACCOUNT}>Account</Link>
      </Menu.Item>

      <Menu.Item key="studio">

        <Link to={ROUTES.STUDIO}>Studio</Link>
      </Menu.Item>
      <Menu.Item key="floorplan">

        <Link to={ROUTES.PLANNER}>Floorplan</Link>
      </Menu.Item>
      <Menu.Item key="builder">

        <Link to={ROUTES.BUILDER}>Builder</Link>
      </Menu.Item>
      <Menu.Item key="signout">

        <SignOutButton />
      </Menu.Item>
    </Menu>

  );
};

const NavigationNonAuth = (props) => {
  const { selectedKeys } = props;
  return (
    <Menu selectedKeys={selectedKeys} mode="horizontal" onClick={props.onClick}>

      <Menu.Item key="map">
        <Link to={ROUTES.LANDING}>Map</Link>
      </Menu.Item>

      <Menu.Item key="signin">
        <Link to={ROUTES.SIGN_IN}>Sign In</Link>
      </Menu.Item>
    </Menu>)
};

export default withAuthentication(Navigation);
