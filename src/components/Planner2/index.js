import React, { Component } from "react";
import * as THREE from "three";
import { connect } from "react-redux";

import MainCanvas from "../Scene/MainCanvas";
import FlaneurControls from "../PlanBuilder/FlaneurControls";
import Floor2 from "../Scene/Floor2";
import ForwardStats from "../Scene/ForwardStats";

import Lines from "../Scene/Lines";
import HardWalls from "../Scene/HardWalls";

import AnimateUpdatables from "../Scene/AnimateUpdatables";
import {
  addAnimationUpdatables,
  createSceneData,
  addPhysicsObject,
} from "../../redux/actions";
import { withFirebase } from "../Firebase";
import _, { isEqual } from "lodash";
import { OBJLoader } from "three/examples/jsm/loaders//OBJLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";

// import { PhysicsLoader } from '@enable3d/ammo-physics'

import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

import ArtFromWalls from "../Scene/ArtFromWalls";
import Physics from "../Scene/Physics";

import { setDataToNewMaterial } from "../../Helpers/TextureAdder";
import { ControlFilled } from "@ant-design/icons";

const wallOptions = {
  leftWall: { hole: { w: 1.5, h: 2, x: 12.5, y: 1.5 } },
};
const matisseStudioTexture =
  "/users/zHXGGNge3bS76tWjQ9wlhacZ8wD2/wall/-N8z1e47VvhpGG5w1i5Y";
const galleryForArt = "A_colorful_array";

// [0, 1.79, 0];
const cameraLookAt = new THREE.Vector3(0, 1.79, 0);
const cameraPos = [0, 1.79, 10];

const composer = null;

class Planner2 extends Component {
  constructor(props) {
    super(props);
    const { camera, scene, renderer } = this.props;
    this.scene = scene; // new THREE.Scene();
    this.camera = camera; //new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    this.renderer = renderer;
    this.clock = new THREE.Clock();

    this.props.addAnimationUpdatables({ planner: this.animate });
    // this.stats = React.createRef();

    this.setUpListeners();
    this.loader = new OBJLoader();
    RectAreaLightUniformsLib.init();
    // this.addLight();
    this.addFog();
    this.addPointLight();
  }
  addFog() {
    this.scene.fog = new THREE.Fog(0xffffff, 0, 750);
  }
  addPointLight() {
    var light = new THREE.PointLight(0xff4455, 0.9, 100);
    light.position.z = 1;
    light.position.y = 3;
    this.scene.add(light);
  }

  addLight() {
    const light = new THREE.HemisphereLight(0xffffff, 0xff4455, 0.75);
    this.scene.add(light);
  }
  createWorld2() {
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.1, 10),
      new THREE.ShadowMaterial({ color: 0x111111 })
    );
    floor.position.y = 0.0;
    floor.receiveShadow = true;
    floor.name = "ammoFloor";
    // this.scene.add( floor );
    console.log("createWorld2", this.scene);

    const material = new THREE.MeshLambertMaterial();

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    // Boxes

    const geometryBox = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const boxes = new THREE.InstancedMesh(geometryBox, material, 100);
    boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    boxes.castShadow = true;
    boxes.receiveShadow = true;
    this.scene.add(boxes);
    this.position = new THREE.Vector3();
    for (let i = 0; i < boxes.count; i++) {
      matrix.setPosition(
        Math.random() - 0.5,
        Math.random() * 2 + 5,
        Math.random() - 0.5
      );
      boxes.setMatrixAt(i, matrix);
      boxes.setColorAt(i, color.setHex(0xffffff * Math.random()));
    }
    this.props.addPhysicsObject({ floor, boxes });
  }

  furniture = {
    woodenTables: {
      url: "../furniture/woodenTables.obj",
      position: [-4, 0, -5],
      name: "tables",
      color: 0x924433,
      object: {},
    },
    table: {
      url: "../furniture/db_table_07.obj",
      position: [-4, 0, 5],
      name: "table",
      color: 0x924433,
      object: {},
    },
    tree: {
      url: "../furniture/tree.obj",
      position: [-14, 0, 5],
      name: "table",
      color: 0x924433,
      object: {},
    },
    chair: {
      url: "../furniture/chair.obj",
      position: [3.3, -0.35, 7.5],
      name: "chair",

      color: 0x924433,
      object: {},
      scale: 0.22,
      rotation: Math.PI / 2 + 0.3,
    },
    door: {
      url: "../furniture/first_picasso_door.obj",
      position: [0, 0, 0],
      name: "door",
      color: 0x924433,
      object: {},
      rotationX: Math.PI / 2,
    },
  };

  componentDidMount() {
    this.setUpScene();

    this.galleryRef = this.props.firebase.getGalleryByName(
      galleryForArt,
      this.processGallery
    );
    if (composer) {
      this.composer = this.setUpComposer();
    }

    // this.createScene();
  }

  componentDidUpdate(prevProps) {
    function changedKeys(o1, o2) {
      var keys = _.union(_.keys(o1), _.keys(o2));
      return _.filter(keys, function (key) {
        return o1[key] !== o2[key];
      });
    }
    let changedKeysAr = changedKeys(prevProps, this.props);
    console.log("planner2 changedKeys for props", changedKeysAr);
    console.log("planner2 this.props", this.props);
  }

  componencomponentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize, false);
  }

  setUpComposer = () => {
    const composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);
    let res = { x: this.mount.clientWidth, y: this.mount.clientHeight };
    this.selectableObjects = [
      this.backWall,
      this.leftWall,
      this.rightWall,
    ];
    console.log("this.selectableObjects", this.selectableObjects);
    const outlinePass = new OutlinePass(
      res,
      this.scene,
      this.camera,
      this.selectableObjects
    ); //resolution, scene, camera, selectedObjects
    outlinePass.edgeStrength = Number(3);
    outlinePass.edgeGlow = Number(0.15);
    outlinePass.edgeThickness = Number(1);
    outlinePass.pulsePeriod = Number(0);
    outlinePass.visibleEdgeColor.set("#658673");
    outlinePass.hiddenEdgeColor.set("#000");
    composer.addPass(outlinePass);
    return composer;
  };
  //scene setup
  setUpScene() {
    this.camera.position.set(...cameraPos); //260
    this.camera.lookAt(cameraLookAt);
    this.mount.appendChild(this.renderer.domElement);
    this.onWindowResize();
    // this.addFloor();
    // this.addWalls();
    this.addFurniture(this.furniture.door);
    this.addFurniture(this.furniture.woodenTables);
    this.addFurniture(this.furniture.table);
    this.addFurniture(this.furniture.tree);
    this.addFurniture(this.furniture.chair);
    this.addWindowLight();
  }
  processGallery = (data, val) => {
    console.log("processGallery", data);
    // data.generalLight.intensity = 1;
    this.props.createSceneData(data);
  };

  setUpListeners() {
    window.addEventListener("resize", this.onWindowResize, false);
  }

  getDefaultMaterialPhong() {
    const material = new THREE.MeshPhongMaterial({
      color: 0xf03fcf,
      //   shininess: 50,
      side: THREE.DoubleSide,
      flatShading: true,
      //   blending: THREE.NoBlending
    });
    // material.flatShading = true
    this.setDataToNewMaterial(material);
    return material;
  }

  getDefaultMaterial() {
    const material = new THREE.MeshLambertMaterial({
      color: 0xf03fcf,
      //   shininess: 50,
      side: THREE.DoubleSide,
      flatShading: true,
      //   blending: THREE.NoBlending
    });
    material.flatShading = true;
    // this.setDataToNewMaterial(material);
    return material;
  }

  onWindowResize = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
  setDataToNewMaterial(material) {
    // material.computeVertexNormals();
    const { getAsset } = this.props.firebase;
    const options = {
      refPath: matisseStudioTexture,
      once: true,

      callback: (snap) => {
        const texData = snap.val();
        console.log("snap.val()", snap.val(), material, texData);

        setDataToNewMaterial(texData, material);
      },
    };
    getAsset(options);
    // setDataToNewMaterial(this.data.texture, this.material);
  }
  addFloor() {
    this.floorDimensions = {
      a: [-5.0, 0.0, 8.0],
      b: [-2.0, 0.0, -10.0],
      c: [4.0, 0.0, -3.0],
      d: [5.0, 0.0, 10.0],
    };

    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array([
      ...this.floorDimensions.a,
      ...this.floorDimensions.b,
      ...this.floorDimensions.c,

      ...this.floorDimensions.a,
      ...this.floorDimensions.c,
      ...this.floorDimensions.d,
    ]);

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    // const material = new THREE.MeshStandardMaterial({
    //   color: 0xff5033,
    //   side: THREE.DoubleSide,
    // });
    const material = this.getDefaultMaterial();
    this.floorMesh = new THREE.Mesh(geometry, material);
    this.floorMesh.name = "floor";
    // this.setDataToNewMaterial(material);
    this.scene.add(this.floorMesh);

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.4, 20),
      new THREE.ShadowMaterial()
    );
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    floor.name = "ammoFloor";
    // this.scene.add(floor);
    // this.props.addPhysicsObject({ floor });
  }

  addCube = (w, h, d) => {
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccffc,
      transparent: true,
      opacity: 0.25,
      // wireframe: true,
      side: THREE.DoubleSide,
      // clippingPlanes: [ leftPlane]//localPlane
    });
    const boxGeometry = new THREE.BoxGeometry(w, h, d);

    const cube = new THREE.Mesh(boxGeometry, boxMaterial);
    return cube;
  };

  // //ceiling
  // const ceiling = new THREE.Mesh(
  //   horizGeo.clone(),
  //   new THREE.MeshPhongMaterial({
  //     color: 0xfffcfe,
  //     // shininess: 150,
  //     // side: THREE.DoubleSide,
  //     // wireframe: true
  //   })
  // );

  // ceiling.rotation.x = Math.PI / 2; // rotates X/Y to X/Z
  // ceiling.receiveShadow = true;
  // ceiling.position.setY(3);

  // this.scene.add(ceiling);

  addWalls() {
    console.log("this.floorMesh addWalls", this.floorMesh);

    const a = new THREE.Vector3(...this.floorDimensions.a);
    const b = new THREE.Vector3(...this.floorDimensions.b);
    const c = new THREE.Vector3(...this.floorDimensions.c);
    const d = new THREE.Vector3(...this.floorDimensions.d);
    const { hole } = wallOptions.leftWall;
    this.leftWall = this.wallsWithHoles(a.distanceTo(b), 10, 5, hole);
    this.leftWall.position.set(b.x, b.y, b.z);
    const axis = new THREE.Vector3(0, 1, 0);
    const v2 = new THREE.Vector3(0, 3, 18);
    this.leftWall.setRotationFromAxisAngle(axis, axis.angleTo(v2));
    this.leftWall.rotateY(Math.PI);
    this.leftWall.name = "leftWall";
    // this.scene.add(this.leftWall);
    // this.addPhysicsWall(this.leftWall);

    this.rightWall = this.wallsWithHoles(c.distanceTo(d), 5, 15);
    this.rightWall.position.set(d.x, d.y, d.z);
    this.rightWall.name = "rightWall";

    const v3 = new THREE.Vector3(0, -1, 13);

    this.rightWall.setRotationFromAxisAngle(axis, axis.angleTo(v3));
    // this.scene.add(this.rightWall);

    this.backWall = this.wallsWithHoles(b.distanceTo(c), 5, 5);
    this.backWall.position.set(c.x, c.y, c.z);
    this.backWall.name = "backWall";
    const v4 = new THREE.Vector3(0, -6, 7);

    this.backWall.setRotationFromAxisAngle(axis, axis.angleTo(v4));

    // this.scene.add(this.backWall);
    // this.addPhysicsWall(this.backWall);
  }

  wallsWithHoles = (rectWidth, rectHeightl, rectHeightr, holeDim) => {
    const rectShape = new THREE.Shape()
      .moveTo(0, 0)
      .lineTo(rectWidth, 0)
      .lineTo(rectWidth, rectHeightl)
      .lineTo(0, rectHeightr)
      .lineTo(0, 0);
    // Hole
    if (holeDim) {
      const { w, h, x, y } = holeDim;
      const hole = new THREE.Shape()
        .moveTo(x, y)
        .lineTo(x + w, y)
        .lineTo(x + w, y + h)
        .lineTo(x, y + h)
        .lineTo(x, y);
      rectShape.holes.push(hole);
      console.log("hole", hole);
    }
    const extrudeSettings = {
      depth: 0.12,
      bevelEnabled: false,
      bevelSegments: 4,
      steps: 4,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };
    const geometry = new THREE.ExtrudeBufferGeometry(
      rectShape,
      extrudeSettings
    );
    // geometry.computeVertexNormals();
    // geometry.center();
    // const material = new THREE.MeshLambertMaterial({

    const material = this.getDefaultMaterial();

    const wall = new THREE.Mesh(geometry, material);

    if (holeDim) {
      const { w, h, x, y } = holeDim;

      //   const light = this.addWindowLight(w, h);
      //   light.position.set(x + w / 2, y + h / 2, 0.12);
      //   wall.add(light);

      const cube = this.addCube(w + 0.1, h + 0.4, 0.1);
      cube.position.set(x + w / 2, y + h / 2, -0.3);
      wall.add(cube);
    }

    return wall;
  };

  addPhysicsWall(wall) {
    const boxMaterial = new THREE.ShadowMaterial({
      receiveShadow: true,
    });
    const boxGeometry = new THREE.BoxGeometry(20, 15, 0.12);
    // boxGeometry.center();
    const cube = new THREE.Mesh(boxGeometry, boxMaterial);

    const v1 = new THREE.Vector3(0, 0, 1).applyQuaternion(wall.quaternion);
    const v2 = new THREE.Vector3(1, 0, 0).applyQuaternion(wall.quaternion);

    cube.quaternion.copy(wall.quaternion);
    cube.position
      .copy(wall.position)
      .sub(v1.multiplyScalar(-0.06))
      .sub(v2.multiplyScalar(-2.5));
    this.wallPhysics = cube;
    // this.scene.add(this.wallPhysics);
    const object = { [wall.name]: this.wallPhysics };
    this.props.addPhysicsObject(object);
  }

  processFurniture = (object, data) => {
    const { name, position, color, scale, rotation, rotationX } = data;
    console.log("add ", name);
    this.furniture[name] = object;
    this.scene.add(this.furniture[name]);
    this.furniture[name].position.set(...position);
    if (scale) this.furniture[name].scale.set(scale, scale, scale);
    if (rotation) this.furniture[name].rotation.y = rotation;
    if (rotationX) {
    //   this.furniture[name].rotation.x = rotationX;
      console.log("name of furniture:", name, this.furniture[name]);
    } else {
      console.log("name of furniture:", name, this.furniture[name]);

    }
    this.furniture[name].traverse((obj) => {
      if (obj.isMesh) {
        console.log("mesh isMesh", obj, obj.material);
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.color.set(color));
        } else {
          obj.material.color.set(color);
        }
      }
    });
    this.selectableObjects.push(object);

    this.composer.selectableObjects = this.selectableObjects;
  };

  addFurniture(data) {
    // load a resource
    this.loader.load(
      // resource URL
      data.url,
      // called when resource is loaded
      (object) => {
        this.processFurniture(object, data);
      },
      // called when loading is in progresses
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      function (error) {
        console.log("An error happened", error);
      }
    );
  }

  addWindowLight(w, h) {
    const rectLight = new THREE.RectAreaLight(0xb5dbd3, 1, w, h);
    // const rectLightHelper = new RectAreaLightHelper(rectLight);
    // rectLight.add(rectLightHelper);
    return rectLight;
  }

  animate = () => {
    // this.stats.current.update();
    // this.renderer.render(this.scene, this.camera);
    if (composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  };

  render() {
    return (
      <>
        <MainCanvas refer={(mount) => (this.mount = mount)} />
        <AnimateUpdatables />
        <FlaneurControls />
        {/* <Walls /> */}
        {/*        <Sculptures /> */}
        {/* <GeneralLight /> */}
        <Floor2 />
        {/* <Lights /> */}
        <ForwardStats ref={this.stats} />
        <ArtFromWalls />
        <HardWalls />
        <Physics />)
      </>
    );
  }
}

const mapStateToProps = (state) => {
  console.log("Planner2 state", state);
  const { camera, renderer, scene, sceneData, animationUpdatables } = state;

  return { sceneData, camera, scene, renderer, animationUpdatables }; //{scene: state.scene};
};

export default connect(mapStateToProps, {
  createSceneData,
  addAnimationUpdatables,
  addPhysicsObject,
})(withFirebase(Planner2));
