import Floor from "../PlanBuilder/Floor";
import WallDisplayObject from "./WallDisplayObject";
import { WallLightDisplay } from "./WallLightDisplay";
import { GeneralLightDisplay } from "./GeneralLightDisplay";
import Surroundings from "../PlanBuilder/Surroundings";
import * as THREE from "three";


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
    // debugger;
    // this.addBox();
    this.renderFloor();
    this.renderWalls();
    this.renderGeneralLight();
    this.renderLights();
    this.renderSurrounds();
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
      // console.log("getArt", wall.getArt());
      const gotArt = wall.getArt();
      if (gotArt.length) {
        gotArt.forEach(item => {
          console.log("got art item", item)
          artMeshes.push(item)
        })
      }
    });
    // console.log("artMeshes in renderwalls", artMeshes)
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
      let length = (lights.length > 10)? 10 : lights.length;
      console.log("lights",length, lights)
      for (i=0 ; i < length; i++) {
        // debugger;
      const options = lights[i];
      options.builder = this;
      this.wallLights.push(WallLightDisplay(options));
    };
    console.log("this.wallLights",this.wallLights)
  }

  renderSurrounds() {
    const { surrounds } = this.sceneData;
    this.surrounds = new Surroundings(this);
    surrounds && this.surrounds.setDataToMaterial(surrounds);
  }

  destroy(){
    if (this.sceneData.surrounds){
      this.surrounds.destroy();
    }
  }
}

export default SceneLoader;
