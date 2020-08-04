import React, { Component } from "react";
import { Link } from "react-router-dom";
import SignOutButton from "../SignOut";
import * as ROUTES from "../../constants/routes";
import { AuthUserContext, withAuthentication } from "../Session";
import { Menu } from 'antd';

class Navigation extends Component {
  state = {
    current: "map"
  };

  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
      console.log("onAuthStateChanged", authUser);
      this.setState({ user: authUser });
      console.log("Navigation componentDidMount", authUser);
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

const NavigationAuth = ({ selectedKeys, onClick}) => {
  return (
    <Menu selectedKeys={selectedKeys} mode="horizontal" onClick={onClick}>
      <Menu.Item key="map">
        <Link to={ROUTES.LANDING}>World</Link>
      </Menu.Item>
      <Menu.Item key="builder">
        <Link to={ROUTES.BUILDER}>Build</Link>
      </Menu.Item>
      <Menu.Item key="studio">
        <Link to={ROUTES.STUDIO}>Resources</Link>
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
        <Link to={ROUTES.LANDING}>World</Link>
      </Menu.Item>
      <Menu.Item key="builder">
        <Link to={ROUTES.SIGN_IN}>Build</Link>
      </Menu.Item>

      <Menu.Item key="signin">
        <Link to={ROUTES.SIGN_IN}>Sign In</Link>
      </Menu.Item>
    </Menu>)
};

export default withAuthentication(Navigation);
