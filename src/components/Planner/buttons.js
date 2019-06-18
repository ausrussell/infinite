import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

export const SaveButton = props => {
  return (
    <button className="primary-button" onClick={() => props.onClick()}>
      Save
    </button>
  );
};

export const PlannerButtonRoute = props => (
  <Route
    path="/"
    render={routeProps => {
      const buttonProps = Object.assign(routeProps, props);
      return <ButtonToNavigate {...routeProps} />;
    }}
  />
);

const ButtonToNavigate = props => {
  const { title, history, plan } = props;
  return (
    <button
      type="button"
      className="primary-button"
      onClick={() =>
        history.push({ pathname: "/Builder", state: { plan, title } })
      }
    >
      Build {title}
    </button>
  );
};
