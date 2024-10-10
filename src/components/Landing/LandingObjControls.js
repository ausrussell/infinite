import { connect } from "react-redux";
import { addAnimationUpdatables } from "../../redux/actions";

import { ObjControls } from "../../Helpers/ObjControls";

const LandingObjectControls = ({ renderer, camera, sphere }) => {
  console.log("LandingObjectControls sphere", sphere);
  if (sphere) {
    let controls = new ObjControls(sphere, renderer.domElement, camera);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.015;
    // controls.screenSpacePanning = false;
    // controls.minDistance = 8;
    controls.maxPolarAngle = Math.PI / 2;
    addAnimationUpdatables({ objControls: controls.update });
  }
  return null;
};

const mapStateToProps = ({ renderer }) => {
  return {
    renderer,
  };
};
export default connect(mapStateToProps, { addAnimationUpdatables })(
  LandingObjectControls
);
