import * as THREE from "three";

const sceneHelperObjects = [
    "footHover",
    "clickFloorPlane",
    "TransformControls",
  ];
  
  const disposeNode = (parentObject) => {
    parentObject.traverse(function (node) {
      // console.log("node", node)
      if (node instanceof THREE.Mesh) {
        if (node.geometry) {
          node.geometry.dispose();
        }
        if (node.material) {
          if (
            node.material instanceof THREE.MeshFaceMaterial 
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
  
  export const emptyScene = (scene, destroyAll) => {
  // return;
  // this.transformOrig && this.transformOrig.detach();
  // this.detach3dTransform();
  const node = scene;
  for (var i = node.children.length - 1; i >= 0; i--) {
    var child = node.children[i];
    if (destroyAll || sceneHelperObjects.indexOf(child.name) === -1) {
      disposeNode(child);
      scene.remove(child);
    }
  }
  console.log("scene after", scene.children);
  return;
};
