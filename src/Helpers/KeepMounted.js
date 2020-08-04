import React, { Component } from "react";
import { withFirebase } from "../components/Firebase";


class KeepMounted extends Component {
    hasBeenMounted = false
    render() {
      const { isMounted, render } = this.props;
      console.log("KeepMounted", this.props, isMounted);
      this.hasBeenMounted = this.props.firebase.landingLoaded;
      return (
        <div style={{ display: isMounted ? null : 'none' }}>
          {this.hasBeenMounted ? render() : null}
        </div>
      );
    }
  }

  export default withFirebase(KeepMounted);

