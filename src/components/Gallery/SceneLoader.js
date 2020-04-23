import Floor from "../PlanBuilder/Floor";
import WallDisplayObject from "./WallDisplayObject";
import { WallLightDisplay } from "./WallLightDisplay";
import { GeneralLightDisplay } from "./GeneralLightDisplay";
import Surroundings from "../PlanBuilder/Surroundings";


const wallWidth = 20;
class SceneLoader {
  constructor(options) {
    const { scene, sceneData } = options;
    console.log("SceneLoader:: scene, sceneData", scene, sceneData);
    this.scene = scene;
    this.sceneData = sceneData;
    this.voxelsX = sceneData.floorplan.data.length;
    this.voxelsY = sceneData.floorplan.data[0].length;
    this.gridWidth = this.voxelsX * wallWidth;
    this.gridDepth = this.voxelsY * wallWidth;
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
    this.floor = new Floor(options);
    this.floor.setDataToMaterial(this.sceneData.floor);
  }
  renderWalls() {
    const { walls } = this.sceneData;
    this.wallEntities = [];
    walls.forEach(wall => {
      const options = wall;
      options.builder = this;
      this.wallEntities.push(new WallDisplayObject(options));
    });
    this.wallEntities.forEach(wall => wall.renderWall());
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

  renderSurrounds(){
    const { surrounds } = this.sceneData;
    this.surrounds = new Surroundings(this);
    surrounds && this.surrounds.setDataToMaterial(surrounds);
  }
}

export default SceneLoader;
