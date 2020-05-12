import React from "react";
import { Route } from "react-router-dom";
import { CheckOutlined } from '@ant-design/icons';
import {Button} from 'antd';

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
      Object.assign(routeProps, props);
      return <ButtonToNavigate {...routeProps} />;
    }}
  />
);



export const MainBuild = props => (
  <Route
    path="/"
    render={routeProps => {
      Object.assign(routeProps, props);
      return <MainButtonToNavigate {...routeProps} />;
    }}
  />
);

const ButtonToNavigate = props => {
  const { title, history, plan } = props;
  return (
    <CheckOutlined
      onClick={() =>
        history.push({ pathname: "/Builder", state: { plan, title } })
      }
    />
  );
};

const MainButtonToNavigate = props => {
  const { title, history, plan } = props;
  return (<Button type="primary" disabled={!plan} onClick={() =>
    history.push({ pathname: "/Builder", state: { plan, title } })}>
    Build
  </Button>)
}