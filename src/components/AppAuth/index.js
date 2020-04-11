import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Navigation from "../Navigation";
import "../../css/navigation.css";
import "../../css/nav.less";
import Landing from "../Landing";
import SignUpPage from "../SignUp";
import SignInPage from "../SignIn";
import PasswordForgetPage from "../PasswordForget";
import HomePage from "../Home";
import AccountPage from "../Account";
import AdminPage from "../Admin";

import Planner from "../Planner";
import Gallery from "../Gallery";
import Builder from "../PlanBuilder";
import StudioPage from "../Studio";

import * as ROUTES from "../../constants/routes";
import { withAuthentication } from "../Session";
import { Layout } from "antd";

const AppAuth = () => {
  return (
    <Layout>
      <Router>
        <Navigation />
        <Route exact path={ROUTES.LANDING} component={Landing} />
        <Route path={`${ROUTES.GALLERY}/:galleryName`} component={Gallery} />
        <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
        <Route path={ROUTES.SIGN_IN} component={SignInPage} />
        <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
        <Route path={ROUTES.HOME} component={HomePage} />
        <Route path={ROUTES.ACCOUNT} component={AccountPage} />
        <Route path={ROUTES.ADMIN} component={AdminPage} />
        <Route path={ROUTES.PLANNER} component={Planner} />

        <Route path={ROUTES.BUILDER} component={Builder} />
        <Route path={ROUTES.STUDIO} component={StudioPage} />
      </Router>
    </Layout>
  );
};

export default withAuthentication(AppAuth);
