// import * as THREE from "three";

// const degreesToRadians = degrees => {
//   return (degrees * Math.PI) / 180;
// };
// THREE.FirstPersonControls = function(object, domElement) {
class FlaneurControls {
  constructor(object, builder) {
    this.object = object;
    this.builder = builder;
  }
}

export default FlaneurControls;
