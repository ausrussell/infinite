import * as THREE from "three";

export default class TextureAdder {
    constructor(props) {
        this.material = props.material;
        this.textures = {};
        this.textureLoader = new THREE.TextureLoader();
        // console.log("TextureAdder constructor", this.material)
    }

    loadHandler(textureType, texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        this.material[textureType] = texture;
        this.material.needsUpdate = true;
    };
    setDataToMaterial(data) {
        // console.log("setMaterial method", this.material,data)
        // frameData = frame;

        Object.entries(data).forEach(item => {
            // console.log("item", item, item[0])
            switch (item[0]) {
                case "color":
                    this.material.color.set(item[1]);
                    break;
                case "opacity":
                    this.material.opacity = item[1];
                    break;
                case "map":
                    this.textures["map"] = this.textureLoader.load(item[1], texture => {
                        this.loadHandler(item[0], texture);
                    })
                    // console.log("set map")
                    if (data.density) {
                        if (Array.isArray(data.density)) {//for rectangles
                            this.textures["map"].repeat.set(data.density[1], data.density[0]);
                        } else {
                            this.textures["map"].repeat.set(data.density, data.density);
                        }
                    }

                    // this.textures["map"].repeat.set(data.density, data.density);
                    break;
                case "bumpMap":
                    this.textures["bumpMap"] = this.textureLoader.load(item[1], texture => {
                        this.loadHandler(item[0], texture);
                    })
                    break;
                case "normalMap":
                    this.textures["normalMap"] = this.textureLoader.load(item[1], texture => {
                        this.loadHandler(item[0], texture);
                    })
                    break;
                case "roughnessMap":
                    this.textures["roughnessMap"] = this.textureLoader.load(item[1], texture => {
                        this.loadHandler(item[0], texture);
                    })
                    break;
                case "roughness":
                    this.material.roughness = item[1];
                    break;
                case "density":
                    console.log("case set desnity", item[1], this.textures["map"])

                    if (this.textures["map"]) {
                        console.log("setting density", Array.isArray(item[1]), item[1][1], item[1][0])
                        if (Array.isArray(item[1])) {//for rectangles
                            this.textures["map"].repeat.set(item[1][1], item[1][0]);
                        } else {
                            this.textures["map"].repeat.set(item[1], item[1]);
                        }
                    }
                    break;
                case "metalness":
                    this.material.metalness = item[1];
                    break;
                case "bumpScale":
                    this.material.bumpScale = item[1];
                    break;
                case "normalScale":
                    this.material.normalScale.set(item[1], item[1]);
                    break;
                default:
                    break;
            }
            this.material.needsUpdate = true;
        })
    }
}


const disposeNode = (parentObject) => {
    parentObject.traverse(function (node) {
      // console.log("node", node)
      if (node instanceof THREE.Mesh) {
        if (node.geometry) {
          node.geometry.dispose();
        }
        if (node.material) {
          if (node.material instanceof THREE.MeshFaceMaterial || node.material instanceof THREE.MultiMaterial) {
            node.material.materials.forEach(function (mtrl, idx) {
              if (mtrl.map) mtrl.map.dispose();
              if (mtrl.lightMap) mtrl.lightMap.dispose();
              if (mtrl.bumpMap) mtrl.bumpMap.dispose();
              if (mtrl.normalMap) mtrl.normalMap.dispose();
              if (mtrl.specularMap) mtrl.specularMap.dispose();
              if (mtrl.envMap) mtrl.envMap.dispose();

              mtrl.dispose();    // disposes any programs associated with the material
            });
          }
          else {
            if (node.material.map) node.material.map.dispose();
            if (node.material.lightMap) node.material.lightMap.dispose();
            if (node.material.bumpMap) node.material.bumpMap.dispose();
            if (node.material.normalMap) node.material.normalMap.dispose();
            if (node.material.specularMap) node.material.specularMap.dispose();
            if (node.material.envMap) node.material.envMap.dispose();

            node.material.dispose();   // disposes any programs associated with the material
          }
        }
      }
      // console.log("end of disposeNode", i++)
    });
  }

export const emptyScene = (scene) => {

    // window.cancelAnimationFrame(this.animateCall);
    disposeNode(scene);
    const node = scene;
    for (var i = node.children.length - 1; i >= 0; i--) {
      var child = node.children[i];
      scene.remove(child);
    }
    console.log("this.scene after", scene.children);
    scene.dispose();
    return;
  }