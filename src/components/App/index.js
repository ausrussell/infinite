import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Navigation from "../Navigation";
import "../../css/navigation.css";
import "../../css/nav.less";
import LandingKept from "../Landing";
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
import AccountManagement from "../AccountManagement";
import { withAuthentication } from "../Session";
import * as ROUTES from "../../constants/routes";
import { Layout } from "antd";

const logoSrc =
  "https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Flogo-letters-tagline.png?alt=media&token=cb1c760d-1f11-4f4e-b978-5179f4769ffa";

const App = () => {
  return (
    <Layout>
      <img src={logoSrc} style={{ display: "none" }} alt="" />
      <Router>
        <Navigation />
        <Route path={ROUTES.LANDING} component={LandingKept} />
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
        <Route path={ROUTES.ACCOUNT_MANAGEMENT} component={AccountManagement} />
      </Router>
    </Layout>
  );
};

export default withAuthentication(App);
