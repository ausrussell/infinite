import React from "react";

const GuiContext = React.createContext(null);

export const withGui = Component => props => (
  <GuiContext.Consumer>
    {gui => <Component {...props} gui={gui} />}
  </GuiContext.Consumer>
);

export default GuiContext;