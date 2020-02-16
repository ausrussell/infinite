import FloorDisplay from "./FloorDisplay";
import WallDisplayObject from "./WallDisplayObject";

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
  }
  renderFloor() {
    // const options = {
    //   scene: this.scene,
    //   floorItem: this.sceneData.floor,
    //   builder: this
    // };
    this.floor = new FloorDisplay(this);
    this.floor.renderFloor();
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
}

export default SceneLoader;
