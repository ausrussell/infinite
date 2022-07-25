import React from "react";
// import AuthUserContext from "./context";
import { withFirebase } from "../Firebase";
import { connect } from 'react-redux';
import { compose } from 'recompose';

const withAuthentication = Component => {
  console.log("withAuthentication function")
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);
      this.props.onSetAuthUser(
        JSON.parse(localStorage.getItem('authUser')),
      );
    }


    componentDidMount() {
      console.log("withAUthentication did mount",localStorage);
      this.listener = this.props.firebase.onAuthUserListener(
        authUser => {
          console.log("setting authUser in with AUthentication")
          localStorage.setItem('authUser', JSON.stringify(authUser));
          this.props.onSetAuthUser(authUser);
        },
        () => {
          console.log("unsetting authUser in with AUthentication")

          localStorage.removeItem('authUser');
          this.props.onSetAuthUser(null);
        },
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      return <Component {...this.props} />;
    }
  }


  const mapDispatchToProps = dispatch => ({
    onSetAuthUser: authUser =>
      dispatch({ type: 'AUTH_USER_SET', authUser }),
  });

  return compose(
    withFirebase,
    connect(
      null,
      mapDispatchToProps,
    ),
  )(WithAuthentication);
};

export default withAuthentication;
