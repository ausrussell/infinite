import React from "react";

import { withAuthorization } from "../Session";

const Landing = () => (
  <div>
    <h1>Landing Page</h1>
    <p>The Home Page is accessible by every signed in user.</p>
  </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Landing);
