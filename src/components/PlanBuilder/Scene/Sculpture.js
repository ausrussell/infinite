import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import Animate from "../../Helpers/animate";

const { Quaternion } = THREE;

export default class Sculpture {
  constructor(scene) {
    console.log("sculpture instance", scene);
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.rotationGroup = new THREE.Group(); //holds scene, viewing position, boxHelper
    this.rotationGroup.name = "sculpture"
    this.animationMixer = null;
    this.clips = [];
  }

  setDataToMaterial = (data) => {
    const { key, url, position, quaternion, scale } = data;
    this.key = key;
    this.url = url;
    this.loader.load(url, (gltf) => {
      this.gltf = gltf;
      this.gltfScene = gltf.scene;
      this.gltfScene.scope = this;
      this.scene.add(this.rotationGroup);
      this.rotationGroup.add(this.gltfScene);
      //   this.setHelper();

      if (position) {
        //from database
        // console.log("place sculpture from db", this.gltfScene);
        this.gltfScene.position.set(position.x, position.y, position.z);
        const rotation = new Quaternion(
          quaternion._x,
          quaternion._y,
          quaternion._z,
          quaternion._w
        );
        this.gltfScene.scale.set(scale.x, scale.y, scale.z);
        this.rotationGroup.setRotationFromQuaternion(rotation);
      }

      this.checkforAnimations();
      //   this.builder.sculptureCallback(this);
    });
  };

  checkforAnimations() {
    this.clips = this.gltf.animations || [];
    if (this.clips.length > 0) {
      this.animationMixer = new THREE.AnimationMixer(this.gltfScene);
      this.playAnimation();
    }
  }

  playAnimation(value = true) {
    var action = this.animationMixer.clipAction(this.clips[0]); // need to check name for multiples
    // if (this.builder.preview || this.builder.fla){
    if (value) {
      action.play();
      console.log("playAnimation", action);
    } else {
      action.stop();
      console.log("stopAnimation", action);
    }
    // }
  }
  destroy() {
    this.scene.remove(this.rotationGroup);
  }

}
