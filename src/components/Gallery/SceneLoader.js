import Floor from "../PlanBuilder/Floor";
import WallDisplayObject from "./WallDisplayObject";
import { WallLightDisplay } from "./WallLightDisplay";
import { GeneralLightDisplay } from "./GeneralLightDisplay";
import Surroundings from "../PlanBuilder/Surroundings";
import Sculpture from "../PlanBuilder/Sculpture";

import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const perseusUrl = "https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/users%2F0XHMilIweAghhLcophtPU4Ekv7D3%2F3d%2Faphrodite_crouching_british_museum%2Fscene.glb?alt=media&token=1f369cfd-70eb-4c65-a548-c5f220c6a967"

class SceneLoader {
  state = {
    voxelsX: 16,
    voxelsY: 12,
    wallWidth: 20
  };
  constructor(options) {
    const { scene, sceneData, builder } = options;
    console.log("SceneLoader:: scene, sceneData", scene, sceneData);
    this.scene = scene;
    this.sceneData = sceneData;
    this.builder = builder;
  }
  renderData() {
    // this.addBox();
    // this.add3d();
    this.renderFloor();
    this.renderWalls();
    this.renderGeneralLight();
    this.renderLights();
    this.renderSurrounds();
    this.render3d();
  }
  renderFloor() {
    const options = {
      builder: this,
      data: this.sceneData.floor
    }
    const floor = new Floor(options);
    floor.addFloorMesh(this.sceneData.floor);
    // this.floor.setDataToMaterial(this.sceneData.floor);
  }
  renderWalls() {
    const { walls } = this.sceneData;
    this.wallEntities = [];
    const wallGeometry = new THREE.BoxBufferGeometry(
      20,
      60,
      5
    );

    walls.forEach(wall => {
      const options = wall;
      Object.assign(options, {
        wallGeometry: wallGeometry,
        builder: this
      })

      this.wallEntities.push(new WallDisplayObject(options));
    });
    const wallMeshes = [];
    const artMeshes = [];
    this.wallEntities.forEach(wall => {
      wall.renderWall();
      wallMeshes.push(wall.wallMesh);
      const gotArt = wall.getArt();
      if (gotArt.length) {
        gotArt.forEach(item => {
          console.log("got art item", item)
          artMeshes.push(item)
        })
      }
    });
    console.log("artMeshes in renderwalls", artMeshes)
    this.builder.setState({ wallMeshes: wallMeshes, artMeshes: artMeshes })
     
  }

  addBox() {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff
      // wireframe: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    mesh.position.set(0, 0, 0);
  }

  renderGeneralLight() {
    const { generalLight } = this.sceneData;
    const options = generalLight;
    options.builder = this;
    if (this.generalLight) this.scene.remove(this.generalLight);
    this.generalLight = GeneralLightDisplay(options);
    console.log("renderGeneralLight", this.scene.children);
  }

  renderLights() {
    this.wallLights = [];
    const { lights } = this.sceneData;
    // const wallLights = lights;
    console.log("renderLights", lights);
    if (!lights) return;
    // wallLights.forEach(light => {
    let i;
    let length = (lights.length > 10) ? 10 : lights.length;
    console.log("lights", length, lights)
    for (i = 0; i < length; i++) {
      const options = lights[i];
      options.builder = this;
      this.wallLights.push(WallLightDisplay(options));
    };
    console.log("this.wallLights", this.wallLights)
  }

  renderSurrounds() {
    const { surrounds } = this.sceneData;
    this.surrounds = new Surroundings(this);
    surrounds && this.surrounds.setDataToMaterial(surrounds);
  }

  render3d() {
    const { sculptures } = this.sceneData;
    if (!sculptures) return;
    this.sculptures = [];
    sculptures.forEach(sculptureOptions => {
      console.log("sculptureOptions",sculptureOptions)
      const sculpture = new Sculpture(this);
      sculpture.setDataToMaterial(sculptureOptions)
    })
  }
  sculptureCallback(sculpture) {
    console.log("sculptureCallback", sculpture);
    const sculptures = this.builder.state.sculptures;
    sculptures.push(sculpture.gltfScene);
    // this.builder.setState({sculptures}, () => console.log("this.builder.state.sculptures",this.builder.state.sculptures))
    this.builder.flaneurControls.addCollidableObject(sculpture.gltfScene);
    this.builder.dragControls && this.builder.dragControls.addObject(sculpture.gltfScene);//no drag controls without mobile

    if (sculpture.clips.length > 0) {
      sculpture.playAnimation(true);
      const currentAnimations = this.builder.state.sculptureAnimations;
      currentAnimations.push(sculpture)
      this.builder.setState({ sculptureAnimations: currentAnimations })
    }
  }

  destroy() {
    if (this.sceneData.surrounds) {
      this.surrounds.destroy();
    }
  }


  add3d() {
    let loader = new GLTFLoader();
    loader.load(perseusUrl, (gltf) => {
      const perseus = gltf.scene.children[0];
      perseus.translateZ(30)
      perseus.scale.set(2, 2, 2);
      this.scene.add(gltf.scene);
      // animate();
    });
  }
}

export default SceneLoader;
