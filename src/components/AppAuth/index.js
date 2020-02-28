import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Navigation from "../Navigation";
import "../../css/navigation.css";
import "../../css/nav.less";
// import LandingPage from "../Landing";
import SignUpPage from "../SignUp";
import SignInPage from "../SignIn";
import PasswordForgetPage from "../PasswordForget";
import HomePage from "../Home";
import AccountPage from "../Account";
import AdminPage from "../Admin";

// import App from "../App";
import Planner from "../Planner";
import Gallery from "../Gallery";
import Builder from "../PlanBuilder";

import * as ROUTES from "../../constants/routes";
import { withAuthentication } from "../Session";
import { Layout } from "antd";

// import App from "../App";

// <Route exact path={ROUTES.LANDING} component={LandingPage} />
// <Route path={ROUTES.APP} component={App} />
const AppAuth = () => {
  const { Header } = Layout; //Footer, Sider, Content

  //<div className="desk-container"></div>
  //      <Header>Header</Header>
  return (
    <Layout style={{ backgroundColor: "#37474F" }}>
      <Router>
        <Navigation />
        <Route path={`${ROUTES.GALLERY}/:galleryName`} component={Gallery} />
        <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
        <Route path={ROUTES.SIGN_IN} component={SignInPage} />
        <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
        <Route path={ROUTES.HOME} component={HomePage} />
        <Route path={ROUTES.ACCOUNT} component={AccountPage} />
        <Route path={ROUTES.ADMIN} component={AdminPage} />
        <Route path={ROUTES.PLANNER} component={Planner} />

        <Route path={ROUTES.BUILDER} component={Builder} />
      </Router>
    </Layout>
  );
};

export default withAuthentication(AppAuth);
