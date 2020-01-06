import React from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import AuthUserContext from "./context";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";

const withAuthorization = condition => Component => {
  class WithAuthorization extends React.Component {
    state = { user: null };
    componentDidMount() {
      this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
        console.log("onAuthStateChanged", authUser);
        if (!condition(authUser)) {
          this.props.history.push(ROUTES.SIGN_IN);
        } else {
          this.setState({ user: authUser });
          // this.props.push(this.state);
        }
      });
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      // if (authUser) this.props.push(authUser);
      const propsPlus = [{ userAuthor: this.props.user }];
      propsPlus.push(this.state);
      console.log(
        "WithAuthorization state in render",
        this.state,
        this.props,
        "propsPlus",
        propsPlus
      );
      return (
        <AuthUserContext.Consumer>
          {authUser =>
            condition(authUser) ? <Component {...propsPlus} /> : null
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return compose(
    withRouter,
    withFirebase
  )(WithAuthorization);
};

export default withAuthorization;
