import React, { useState } from "react";
import SignOutButton from "../SignOut";
import * as ROUTES from "../../constants/routes";
import { connect } from "react-redux";
import { Menu } from "antd";
import { withRouter } from "react-router-dom";



const Navigation = ({ authUser, history }) => {
  const [current, setCurrent] = useState("LANDING");
  const clickHandler = (current) => {
    setCurrent(current);
    history.push({ pathname: ROUTES[current] });
  };
  return (
    <div>
      {authUser ? (
        <NavigationAuth selectedKeys={[current]} onClick={clickHandler} />
      ) : (
        <NavigationNonAuth selectedKeys={[current]} onClick={clickHandler} />
      )}
    </div>
  );
};

const NavigationAuth = ({ selectedKeys, onClick }) => {
  const items = [
    {
      label: "World",
      key: "LANDING",
    },
    {
      label: "Build",
      key: "BUILDER",
    },
    {
      label: "PLANNER2",
      key: "PLANNER2",
    },
    {
      label: "Resources",
      key: "STUDIO",
    },
    {
      label: <SignOutButton />,
      key: "signout", //??
    },
  ];
  return (
    <Menu
      selectedKeys={selectedKeys}
      mode="horizontal"
      onClick={(entry) => onClick(entry.key)}
      items={items}
    ></Menu>
  );
};

const NavigationNonAuth = ({ selectedKeys, onClick }) => {
  const items = [
    {
      label: "World",
      key: "LANDING",
    },
    {
      label: "Build",
      key: "BUILDER",
    },
    {
      label: "Sign in",
      key: "SIGN_IN",
    },
  ];
  return (
    <Menu
      selectedKeys={selectedKeys}
      mode="horizontal"
      onClick={(entry) => onClick(entry.key)}
      items={items}
    ></Menu>
  );
};
const mapStateToProps = (state) => ({
  authUser: state.sessionState.authUser,
});

export default connect(mapStateToProps)(withRouter(Navigation));
