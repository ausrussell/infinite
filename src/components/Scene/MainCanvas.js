import React from "react";

const MainCanvas = props => {
  return <div id="boardCanvas" ref={mount => props.refer(mount)} >
      {props.children}
      </div>;
};

export default MainCanvas;




// import { render } from "less";
// import React, {Component} from "react";
// import * as THREE from "three";

// class MainCanvas extends Component{
//     constructor(props){
//         super(props);
//         console.log("Main canvas congtructor")
//     }
//     state =
// {        camera:new THREE.PerspectiveCamera(
//             60,
//             window.innerWidth / window.innerHeight,
//             1,
//             1000
//           ),
//           renderer: new THREE.WebGLRenderer({ antialias: true }),
//           scene: new THREE.Scene()
//     }
// componentDidMount(){
//     // setMainSceneObj.renderer.setSize(window.innerWidth, window.innerHeight);
//     console.log("refer on mouont",this.props.refer);

//     this.props.refer.current.appendChild(this.state.renderer.domElement);
//     this.props.mainSceneCallback(this.state);
// }
// //   setUp(){
// //       const {camera, scene, renderer} = this.state;
// //     // sceneToSet.background = new THREE.Color(0x37474f); //null;//new THREE.Color(0x37474f);
// //     // sceneToSet.fog = new THREE.FogExp2(0xcccccc, 0.001);
// //     // camera.position.set(initCameraPos);
// //     // camera.lookAt(cameraLookAt);
// //     // renderer.setSize(window.innerWidth, window.innerHeight);
// //     // setFocusCamera(camera.clone());
// //     // // setFocusScene(new THREE.Scene());
// //     console.log("this.props.refer",this.props.refer)
// //     this.props.refer.current.appendChild(renderer.domElement);
// //   }
// render(){
//   return <div id="mainCanvas" ref={this.props.refer} />;
// }
// }

// export default MainCanvas;
