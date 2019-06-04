import React from "react";

import { BrowserRouter as Router, Route } from "react-router-dom";

import Navigation from "../Navigation";
import SignUpPage from "../SignUp";

import * as ROUTES from "../../constants/routes";

const App = () => (
  <Router>
    <Navigation />

    <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
  </Router>
);

export default App;
