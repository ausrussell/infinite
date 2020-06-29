import Floor from "../PlanBuilder/Floor";
import WallDisplayObject from "./WallDisplayObject";
import { WallLightDisplay } from "./WallLightDisplay";
import { GeneralLightDisplay } from "./GeneralLightDisplay";
import Surroundings from "../PlanBuilder/Surroundings";


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
    walls.forEach(wall => {
      const options = wall;
      options.builder = this;
      this.wallEntities.push(new WallDisplayObject(options));
    });
    const wallMeshes = [];
    const artMeshes = [];
    this.wallEntities.forEach(wall => {
      wall.renderWall();
      wallMeshes.push(wall.wallMesh);
      console.log("getArt",wall.getArt());
      const gotArt = wall.getArt();
      if (gotArt.length ) {
        gotArt.forEach(item => {
        console.log("got art item",item)
          artMeshes.push(item)})
      }
    });
    console.log("artMeshes in renderwalls",artMeshes)
    this.builder.setState({ wallMeshes: wallMeshes, artMeshes: artMeshes })

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
    const wallLights = lights;
    console.log("renderLights", wallLights);
    if (!wallLights) return;
    wallLights.forEach(light => {
      const options = light;
      options.builder = this;

      this.wallLights.push(WallLightDisplay(options));
    });
  }

  renderSurrounds() {
    const { surrounds } = this.sceneData;
    this.surrounds = new Surroundings(this);
    surrounds && this.surrounds.setDataToMaterial(surrounds);
  }
}

export default SceneLoader;
