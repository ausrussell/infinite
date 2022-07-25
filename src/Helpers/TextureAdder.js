import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

//smooth tranisitons between textures https://jsfiddle.net/prisoner849/dns0xhkz/

export const setDataToNewMaterial = (data, material) => {
  const textures = {};
  const loadHandler = (textureType, texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    material[textureType] = texture;
    material.needsUpdate = true;
  };
  Object.entries(data).forEach((item) => {
    // console.log("item", item, item[0])
    switch (item[0]) {
      case "color":
        material.color.set(item[1]);
        break;
      case "opacity":
        material.opacity = item[1];
        break;
      case "map":
        textures["map"] = textureLoader.load(item[1], (texture) => {
          loadHandler(item[0], texture);
        });
        // console.log("set map")
        if (data.density) {
          if (Array.isArray(data.density)) {
            //for rectangles
            textures["map"].repeat.set(data.density[1], data.density[0]);
          } else {
            textures["map"].repeat.set(data.density, data.density);
          }
        }
        break;
      case "bumpMap":
        textures["bumpMap"] = textureLoader.load(item[1], (texture) => {
          loadHandler(item[0], texture);
        });
        break;
      case "normalMap":
        textures["normalMap"] = textureLoader.load(item[1], (texture) => {
          loadHandler(item[0], texture);
        });
        break;
      case "roughnessMap":
        textures["roughnessMap"] = textureLoader.load(item[1], (texture) => {
          loadHandler(item[0], texture);
        });
        break;
      case "roughness":
        material.roughness = item[1];
        break;
      case "density":
        // console.log("case set desnity", item[1], textures["map"])

        if (textures["map"]) {
          console.log(
            "setting density",
            Array.isArray(item[1]),
            item[1][1],
            item[1][0]
          );
          if (Array.isArray(item[1])) {
            //for rectangles
            textures["map"].repeat.set(item[1][1], item[1][0]);
          } else {
            textures["map"].repeat.set(item[1], item[1]);
          }
        }
        break;
      case "metalness":
        material.metalness = item[1];
        break;
      case "bumpScale":
        material.bumpScale = item[1];
        break;
      case "normalScale":
        material.normalScale.set(item[1], item[1]);
        break;
      default:
        break;
    }
    material.needsUpdate = true;
  });
};

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
  }
  setDataToMaterial(data, newMaterial) {
    // console.log("setMaterial method", this.material,data)
    // frameData = frame;
    this.material = newMaterial ? newMaterial : this.material;
    Object.entries(data).forEach((item) => {
      // console.log("item", item, item[0])
      switch (item[0]) {
        case "color":
          this.material.color.set(item[1]);
          break;
        case "opacity":
          this.material.opacity = item[1];
          break;
        case "map":
          this.textures["map"] = this.textureLoader.load(item[1], (texture) => {
            this.loadHandler(item[0], texture);
          });
          // console.log("set map")
          if (data.density) {
            if (Array.isArray(data.density)) {
              //for rectangles
              this.textures["map"].repeat.set(data.density[1], data.density[0]);
            } else {
              this.textures["map"].repeat.set(data.density, data.density);
            }
          }

          // this.textures["map"].repeat.set(data.density, data.density);
          break;
        case "bumpMap":
          this.textures["bumpMap"] = this.textureLoader.load(
            item[1],
            (texture) => {
              this.loadHandler(item[0], texture);
            }
          );
          break;
        case "normalMap":
          this.textures["normalMap"] = this.textureLoader.load(
            item[1],
            (texture) => {
              this.loadHandler(item[0], texture);
            }
          );
          break;
        case "roughnessMap":
          this.textures["roughnessMap"] = this.textureLoader.load(
            item[1],
            (texture) => {
              this.loadHandler(item[0], texture);
            }
          );
          break;
        case "roughness":
          this.material.roughness = item[1];
          break;
        case "density":
          // console.log("case set desnity", item[1], this.textures["map"])

          if (this.textures["map"]) {
            console.log(
              "setting density",
              Array.isArray(item[1]),
              item[1][1],
              item[1][0]
            );
            if (Array.isArray(item[1])) {
              //for rectangles
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
    });
  }
}

export const disposeHierarchy = (node, callback) => {
  for (var i = node.children.length - 1; i >= 0; i--) {
    var child = node.children[i];
    disposeHierarchy(child, disposeNode);
    callback(child);
  }
};

export const disposeNode = (parentObject) => {
  parentObject.traverse(function (node) {
    // console.log("node", node)
    if (node instanceof THREE.Mesh) {
      if (node.geometry) {
        node.geometry.dispose();
      }
      if (node.material) {
        for (const value of Object.values(node.material)) {
          if (value instanceof THREE.Texture) {
            value.dispose();
          }
        }

        if (
          node.material instanceof THREE.MeshFaceMaterial ||
          node.material instanceof THREE.MultiMaterial
        ) {
          node.material.materials.forEach(function (mtrl, idx) {
            if (mtrl.map) mtrl.map.dispose();
            if (mtrl.lightMap) mtrl.lightMap.dispose();
            if (mtrl.bumpMap) mtrl.bumpMap.dispose();
            if (mtrl.normalMap) mtrl.normalMap.dispose();
            if (mtrl.specularMap) mtrl.specularMap.dispose();
            if (mtrl.envMap) mtrl.envMap.dispose();

            mtrl.dispose(); // disposes any programs associated with the material
          });
        } else {
          if (node.material.map) node.material.map.dispose();
          if (node.material.lightMap) node.material.lightMap.dispose();
          if (node.material.bumpMap) node.material.bumpMap.dispose();
          if (node.material.normalMap) node.material.normalMap.dispose();
          if (node.material.specularMap) node.material.specularMap.dispose();
          if (node.material.envMap) node.material.envMap.dispose();

          node.material.dispose(); // disposes any programs associated with the material
        }
      }
    }
    // console.log("end of disposeNode", i++)
  });
};

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
};
