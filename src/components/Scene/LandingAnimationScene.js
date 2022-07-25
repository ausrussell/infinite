import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import {withCanvas} from "./CanvasContext"

import { gsap } from "gsap";
import Shards from "./Shards";
import ShardFocus from "./ShardFocus";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ObjControls } from "../../Helpers/ObjControls";
import Stats from "three/examples/jsm/libs/stats.module.js";

const numberOfShards = 45;

const segments = 28;
const polesIndexCount = segments * 3;
let cameraLookAt = new THREE.Vector3(0, 1.5, 0);
const raycaster = new THREE.Raycaster();
const initCameraPos = new THREE.Vector3(0, 15, 20);
const finalCameraPos = new THREE.Vector3(0, 1.5, 15);

const worldFront = new THREE.Vector3(0, 2, 9);
let worldFrontVec = new THREE.Vector3();
const startSpherical = new THREE.Spherical();
let picPosHolder = new THREE.Vector3();
let shardPosHolder = new THREE.Vector3();

const LandingAnimationScene = ({ galleries, focusScene, CanvasPrimary }) => {
  const mountRef = useRef(null);
  // const [sphere, setSphere] = useState(new THREE.Mesh());
  const [camera] = useState(
    new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    )
  );
  const [renderer] = useState(new THREE.WebGLRenderer({ antialias: true }));
  const [scene, setScene] = useState();

  const [focusCamera, setFocusCamera] = useState();
  // const [focusScene, setFocusScene] = useState();
  // const focusCamera = useRef();
  // const focusScene = useRef();
  const [linesToPicsMesh] = useState(new THREE.LineSegments());

  const [objControls, setObjControls] = useState();

  const [galleriesArray, _setGalleriesArray] = useState([]);
  const [focusGallery, setFocusGallery] = useState({ index: null });

  // const [shardCurves] = useState(new Shards({ numberOfShards }));

  const shardCurves = useRef();
  const [shardsFocusAnimSet, setShardsFocusAnimSet] = useState(false);

  const insetSceneViewport = useRef([0, 0, 0, 0]);

  const requestRef = useRef();
  const galleriesArrayRef = useRef(galleriesArray);
  const stats = useRef();

  const setGalleriesArray = (x) => {
    galleriesArrayRef.current = x; // keep updated
    _setGalleriesArray(x);
  };

  // const [rotateSphere, setRotateSphere] = useState();
  const sphere = useRef();
  const lineBetween = useRef();

  const animTl = useRef();
  const animTlfocusSphere = useRef();


  useEffect(() => {
    let controls,
      helperLine,
      sceneToSet = new THREE.Scene();
    const generateLinesBetweenShards = () => {
      lineBetween.current = new THREE.Line();
      lineBetween.current.geomtery = new THREE.BufferGeometry();

      // attributes
      const ipositions = new Float32Array(numberOfShards * 3); // 3 vertices per point
      lineBetween.current.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(ipositions, 3)
      );

      // draw range
      const drawCount = 2; // draw the first 2 points, only
      lineBetween.current.geometry.setDrawRange(0, drawCount);

      // material
      const material = new THREE.LineBasicMaterial({
        color: 0x3f51b5,
        // transparent: true,
        // opacity: 0.9,
      });

      // line
      lineBetween.current.material = material;
      lineBetween.current.name = "shardsLine";
      lineBetween.current.geometry.setDrawRange(0, numberOfShards * 3);
      console.log(
        "set lineBetween.current.geometry",
        lineBetween.current.geometry
      );
      sceneToSet.add(lineBetween.current);
    };
    const generateHelperLine = () => {
      const material = new THREE.LineBasicMaterial({
        color: 0x0000ff,
      });

      const points = [];
      points.push(new THREE.Vector3(0, 0, 0));
      points.push(new THREE.Vector3(0, 97.5, 350));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      helperLine = new THREE.Line(geometry, material);
      sceneToSet.add(helperLine);
    };

    // const generateHelperPoint = ({ x, y, z }) => {
    //   var dotGeometry = new THREE.BufferGeometry();
    //   dotGeometry.setAttribute(
    //     "position",
    //     new THREE.Float32BufferAttribute(new THREE.Vector3().toArray(), 3)
    //   );
    //   var dotMaterial = new THREE.PointsMaterial({ size: 10 });
    //   var dot = new THREE.Points(dotGeometry, dotMaterial);
    //   scene.add(dot);
    //   dot.position.set(x, y, z);
    // };
    // const generateTargetPoint = () => {
    //   const spherical = new THREE.Spherical();
    //   const targetGeometry = new THREE.SphereGeometry(50.05);
    //   const targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    //   const target = new THREE.Mesh(targetGeometry, targetMaterial);
    //   sceneToSet.add(target);
    //   spherical.theta = 0; //-Math.PI/2 ;
    //   spherical.phi = Math.PI / 2; //0;//Math.acos( ( 2 * Math.random() ) - 1 );
    //   spherical.radius = 360;

    //   target.position.setFromSpherical(spherical);
    // };

    const generateScene = () => {
      //scene
      sceneToSet.background = new THREE.Color(0x37474f); //null;//new THREE.Color(0x37474f);
      sceneToSet.fog = new THREE.FogExp2(0xcccccc, 0.001);
      camera.position.set(initCameraPos);
      camera.lookAt(cameraLookAt);
      renderer.setSize(window.innerWidth, window.innerHeight);
      setFocusCamera(camera.clone());
      // setFocusScene(new THREE.Scene());
      mountRef.current.appendChild(renderer.domElement);
    };
    const addSphereHelper = () => {
      const axesHelper = new THREE.AxesHelper(305);
      sphere.current.add(axesHelper);
    };

    const generateSphere = () => {
      sphere.current = new THREE.Mesh();
      sphere.current.geometry = new THREE.SphereGeometry(9, segments, segments);
      sphere.current.material = [];
      // sphere.current.wireframe = true;
      sceneToSet.add(sphere.current);
      // addSphereHelper();
    };

    const generateSphereClone = () => {
      const material = new THREE.MeshNormalMaterial({
        // side: THREE.DoubleSide,
        vertexColors: true,
        // color: 0xf1f2f3,
        // wireframe: true,
        transparent: true,
        opacity: 0.15,
      });
      const sphereClone = new THREE.Mesh(sphere.current.geometry, material); //materials[0]
      sphereClone.scale.set(0.99, 0.99, 0.99);
      sceneToSet.add(sphereClone);
    };

    const shardsCallback = () => {
      console.log("shardsCallback");
      setShardsFocusAnimSet(true);
    };

    const generateShards = () => {
      shardCurves.current = new Shards({ numberOfShards, shardsCallback });
      sceneToSet.add(shardCurves.current.shardsMesh);
    };

    // const setupControls = () => {
    //   //controls
    //   controls = new OrbitControls(sphere.current, renderer.domElement); //camera
    //   // controls = new MapControls(camera, renderer.domElement); //camera
    //   controls.enableDamping = true;
    //   controls.dampingFactor = 0.015;
    //   controls.screenSpacePanning = false;
    //   controls.minDistance = 0.2; //??
    //   // controls.maxPolarAngle = Math.PI / 2;
    // };

    // const setupObjOrbitControls = () => {
    //   //controls
    //   controls = new ObjControls(sphere.current, renderer.domElement); //camera
    //   // controls = new MapControls(camera, renderer.domElement); //camera
    //   controls.enableDamping = true;
    //   controls.dampingFactor = 0.015;
    //   controls.screenSpacePanning = false;
    //   controls.minDistance = 8;
    //   controls.maxPolarAngle = Math.PI / 2;
    // };

    const generateLight = () => {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(2, 6.3, 9.3);
      sceneToSet.add(directionalLight);
    };

    const generateLinesToPic = () => {
      linesToPicsMesh.material = new THREE.LineBasicMaterial({
        color: 0x3f51b5, //0x3f51b5,
        transparent: true,
        opacity: 0.9,
      });
      const geometry = new THREE.BufferGeometry();

      // attributes
      const numberOfImages = 50;
      const ipositions = new Float32Array(numberOfImages * 2 * 3); // 3 vertices per point
      const ipositions2 = new Float32Array(numberOfImages * 2 * 3); // 3 vertices per point

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(ipositions, 3)
      );
      geometry.setAttribute(
        "originalPosition",
        new THREE.BufferAttribute(ipositions2, 3)
      );
      linesToPicsMesh.geometry = geometry;
      linesToPicsMesh.geometry.setDrawRange(0, 0);

      // sceneToSet.add(linesToPicsMesh);
      sceneToSet.add(linesToPicsMesh);
    };

    const setUpObjControls = () => {
      setObjControls(
        new ObjControls(sphere.current, renderer.domElement, camera)
      );

      console.log("images added");
    };

    const initStats = () => {
      stats.current = new Stats();
      stats.current.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      let statDom = stats.current.dom;
      statDom.style.top = "50px";
      document.body.appendChild(statDom);
    };

    generateScene();
    generateSphere();

    generateShards();
    generateSphereClone();
    setUpObjControls();

    generateLight();
    generateLinesBetweenShards();
    generateLinesToPic();
    generateHelperLine();
    setScene(sceneToSet);
    initStats();

    let onWindowResize = function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      // insetScene();
    };
    window.addEventListener("resize", onWindowResize, false);
    const cleanUp = mountRef.current;
    console.log("with canvas, ",CanvasPrimary)
    return () => {
      cleanUp.removeChild(renderer.domElement);
      window.removeEventListener("resize", onWindowResize, false);
    };
  }, [CanvasPrimary]);

  const updateLines = () => {
    if (lineBetween.current?.geometry) {
      const linesBetweenShards =
        lineBetween.current.geometry.attributes.position.array;
      const linesToPicsPositions =
        linesToPicsMesh.geometry.attributes.position.array;
      let index = 0;
      let orig = linesToPicsMesh.geometry.getAttribute("originalPosition");

      for (let i = 0, l = numberOfShards; i < l; i++) {
        // shardPosHolder.fromArray(shardpositions, index);
        shardPosHolder.copy(shardCurves.current.positions[i]);
        // generateHelperPoint(shardPosHolder);
        let { x, y, z } = shardPosHolder;
        linesBetweenShards[index++] = x;
        linesBetweenShards[index++] = y;
        linesBetweenShards[index++] = z;
        if (linesToPicsMesh.geometry.drawRange.count > i * 6 + 3) {
          picPosHolder.fromBufferAttribute(orig, i * 2 + 1);
          picPosHolder = sphere.current.localToWorld(picPosHolder);
          linesToPicsPositions[i * 6] = x;
          linesToPicsPositions[i * 6 + 1] = y;
          linesToPicsPositions[i * 6 + 2] = z;
          linesToPicsPositions[i * 6 + 3] = picPosHolder.x;
          linesToPicsPositions[i * 6 + 4] = picPosHolder.y;
          linesToPicsPositions[i * 6 + 5] = picPosHolder.z;
        }
      }
      linesToPicsMesh.geometry.attributes.position.needsUpdate = true;
      lineBetween.current.geometry.attributes.position.needsUpdate = true;
    } else {
      // console.log("line",line)
    }
  };

  useEffect(() => {
    var animate = function () {
      stats.current.begin();
      objControls?.update();
      shardCurves.current.update();
      updateLines();
      renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
      stats.current.end();
      requestRef.current = requestAnimationFrame(animate);
    };
    var animateWithInset = function () {
      stats.current.begin();

      objControls?.update();
      shardCurves.current.update();
      updateLines();
      renderer.autoClear = false;
      renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.setViewport(...insetSceneViewport.current);
      renderer.render(focusScene, focusCamera);
      renderer.autoClear = true;
      stats.current.end();
      requestRef.current = requestAnimationFrame(animateWithInset);
    };
    if (scene && renderer) {
      cancelAnimationFrame(requestRef.current);
      console.log("cancelAnimationFrame", requestRef.current);
      if (shardsFocusAnimSet) {
    console.log("run animateWithInset",insetSceneViewport.current);

        requestRef.current = requestAnimationFrame(animateWithInset);
      } else {
    console.log("run animate");

        requestRef.current = requestAnimationFrame(animate);
      }
    }
    // }
    return () => cancelAnimationFrame(requestRef.current);
  }, [scene, renderer, focusScene, focusCamera, shardsFocusAnimSet]); // Make sure the effect runs only once//, focusScene, focusCamera

  useEffect(() => {
    // create a timeline instance
    const rotateSphere = new gsap.timeline({ id: "cameraRotation" });
    rotateSphere.to(
      camera.position,
      {
        duration: 0.5, //5
        x: finalCameraPos.x,
        y: finalCameraPos.y,
        z: finalCameraPos.z,
        ease: "power1.inOut",
        delay: 1,
        onUpdate: function () {
          camera.lookAt(cameraLookAt);
          sphere.current.updateMatrix();
        },
        onCompleteParams: [],
        onComplete: (index, target) => {
          console.log(
            "init rotate complete",
            rotateSphere.killTweensOf(camera.position)
          );
        },
      },
      "cameraRotationO"
    );
    animTl.current = getRotateSphere();
  }, []);

  const getRotateSphere = () => {
    const source = {
      phi: sphere.current.rotation.x,
      theta: sphere.current.rotation.y,
    };
    console.log(
      "getRotateSphere sphere.current.rotation.y",
      sphere.current.rotation.y
    );
    let targetRotation = {
      p: sphere.current.rotation.x,
      theta: sphere.current.rotation.y + Math.PI * 2,
    };

    return gsap.to(
      source,
      {
        duration: 10,
        repeat: -1,
        phi: targetRotation.p,
        theta: targetRotation.theta,
        ease: "none",
        paused: true,

        //onUpdate fires each time the tween updates; we'll explain callbacks later.
        onUpdate: function () {
          sphere.current.rotation.y += 0.00318;
        },
      },
      "rotateSphere"
    );
  };

  const getFocusSphere = () => {
    let vectorStart = focusGallery.centerVec;
    console.log("vectorStart", vectorStart);
    startSpherical.setFromVector3(
      new THREE.Vector3(vectorStart.x, vectorStart.y, vectorStart.z)
    );

    worldFrontVec.copy(sphere.current.worldToLocal(worldFront.clone()));

    const endSpherical = new THREE.Spherical();
    endSpherical.setFromVector3(worldFrontVec);

    const source = {
      phi: sphere.current.rotation.x,
      theta: sphere.current.rotation.y,
    };
    let targetRotation = {
      phi: sphere.current.rotation.x + endSpherical.phi - startSpherical.phi,
      theta:
        sphere.current.rotation.y + endSpherical.theta - startSpherical.theta,
    };

    endSpherical.makeSafe();

    const duration =
      Math.abs(targetRotation.phi - source.phi) +
      Math.abs(targetRotation.theta - source.theta);
    return gsap.to(
      source,
      {
        duration: 2,
        ease: "power2.out",
        phi: targetRotation.phi,
        theta: targetRotation.theta,
        paused: true,
        onUpdate: function () {
          sphere.current.rotation.x = source.phi;
          sphere.current.rotation.y = source.theta; //optimize with duummy?
          sphere.current.updateMatrix();
        },
      },
      "focusSphere"
    );
  };

  // useEffect(() => {
  //   objControls?.addEventListener("start", (event) => {
  //     if (event.type === "start") {
  //       console.log("objcontrols start");
  //       // pauseTimeline();
  //     }
  //   });

  //   objControls?.addEventListener("change", (event) => {});
  // }, [objControls]);

  useEffect(() => {
    const setImages = () => {
      let holderArray = [];
      let centerTopLeftVec = new THREE.Vector3();
      let centerBottomRightVec = new THREE.Vector3();
      let spherePositions = sphere.current.geometry.getAttribute("position");
      let sphereIndex = sphere.current.geometry.index;
      const loader = new THREE.TextureLoader();
      let loadedCounter = 0;
      let timeoutCounter = 0;
      const cutImages = galleries.list
        .filter((item) => {
           return item.galleryImg.thumb;
        })
        .splice(0, numberOfShards);
      console.log("cutImages", cutImages);

      cutImages.forEach((item) => {
        //imageArray
        loader.load(
          // resource URL
          item.galleryImg.thumb,
          // onLoad callback
          function (texture) {
            const minimumTime = 2 / cutImages.length; //5
            loadedCounter++;
            setTimeout(() => {
              addImagesToSphere(texture, timeoutCounter, item);
              timeoutCounter++;
              if (timeoutCounter === cutImages.length) {
                animTl.current.play();
              }
            }, loadedCounter * 1000 * minimumTime);
          },

          // onProgress callback currently not supported
          undefined,

          // onError callback
          function (err) {
            console.error("An error happened.");
          }
        );
      });

      const addImagesToSphere = (tex, index, item) => {
        sphere.current.material.push(
          //materials
          new THREE.MeshBasicMaterial({
            map: tex,
            side: THREE.DoubleSide,
          })
        );
        // sphere.current.material.opacity = 0.1;
        var imageAspect = tex.image.height / tex.image.width;

        tex.matrixAutoUpdate = false;
        const aspectArray =
          imageAspect > 1
            ? [segments, segments * imageAspect]
            : [segments * imageAspect, segments];
        let i = 0;
        const getRandomRowCol = () => {
          return {
            row: Math.floor(Math.random() * (segments - 14)) + 7,
            col: Math.floor(Math.random() * segments),
          };
        };
        let { row, col } = getRandomRowCol();
        for (; i <= index; i++) {
          if (holderArray[i]?.row === row && holderArray[i]?.col === col) {
            i = 0;
            let rnds = getRandomRowCol();
            row = rnds.row;
            col = rnds.col;
          }
        }
        tex.matrix.setUvTransform(
          0,
          0,
          ...aspectArray,
          0,
          col / (segments - 1),
          (segments - 1 - row) / (segments - 1)
        );

        let quadIndex = (row - 1) * segments + col;
        let calcIndex = quadIndex * 6 + polesIndexCount;
        function getPointInBetweenByPerc(pointA, pointB, percentage) {
          var dir = pointB.clone().sub(pointA);
          var len = dir.length();
          dir = dir.normalize().multiplyScalar(len * percentage);
          return pointA.clone().add(dir);
        }
        let x = sphereIndex.array[calcIndex + 1]; //topleft
        let pos = x * 3;

        centerTopLeftVec.set(
          spherePositions.array[pos],
          spherePositions.array[pos + 1],
          spherePositions.array[pos + 2]
        );
        x = sphereIndex.array[calcIndex + 2]; //topleft

        pos = x * 3;
        centerBottomRightVec.set(
          spherePositions.array[pos],
          spherePositions.array[pos + 1],
          spherePositions.array[pos + 2]
        );

        let centerVec = getPointInBetweenByPerc(
          centerTopLeftVec,
          centerBottomRightVec,
          0.5
        );
        addLineToPic(centerVec, index);

        let holder = { item, tex, index, calcIndex, row, col, centerVec };
        holderArray.push(holder);
        setGalleriesArray(holderArray);
        sphere.current.geometry.addGroup(
          calcIndex,
          6,
          sphere.current.material.length - 1
        );
        sphere.current.material.needsUpdate = true;
      };
    };

    const addLineToPic = (centerVec, index) => {
      const positions = linesToPicsMesh.geometry.attributes.position.array;
      const originalPositions =
        linesToPicsMesh.geometry.attributes.originalPosition.array;
      positions[index * 6 + 3] = originalPositions[index * 6 + 3] = centerVec.x;
      positions[index * 6 + 4] = originalPositions[index * 6 + 4] = centerVec.y;
      positions[index * 6 + 5] = originalPositions[index * 6 + 5] = centerVec.z;
      linesToPicsMesh.geometry.setDrawRange(0, (index + 1) * 6);
      linesToPicsMesh.geometry.attributes.position.needsUpdate = true;
      linesToPicsMesh.geometry.attributes.originalPosition.needsUpdate = true;
    };

    if (sphere.current) setImages();
  }, [galleries.list]);

  useEffect(() => {
    const doFocus = () => {
      console.log("dofocus", focusGallery);
      console.log("stats.current", stats.current);
      if (focusGallery.index !== null) {
        animTl.current.pause();
        setShardsFocusAnimSet(false);
        animTlfocusSphere.current = getFocusSphere();
        animTlfocusSphere.current.restart();
        shardCurves.current.focus(focusGallery.index);
      }
    };

    const doUnfocus = () => {
      console.log("doUnfocus", focusGallery);
      shardCurves.current.unfocus();
      setShardsFocusAnimSet(false);
      animTlfocusSphere.current?.kill();
      animTl.current.play();
    };
    console.log("useEffect focus", focusGallery);
    if (focusGallery.index !== null) {
      doFocus();
    } else {
      doUnfocus();
    }
  }, [focusGallery.index]);

  useEffect(() => {
    const raycast = function (e) {
      //1. sets the mouse position with a coordinate system where the center
      //   of the screen is the origin
      var rect = renderer.domElement.getBoundingClientRect();
      let mouse = {};
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      //2. set the picking ray from the camera position and mouse coordinates
      raycaster.setFromCamera(mouse, camera);

      //3. compute intersections
      var intersects = raycaster.intersectObject(sphere.current);

      let hit = { index: null, hit: hit };
      if (intersects[0]) {
        hit = galleriesArrayRef.current[intersects[0].face.materialIndex];
      }
      console.log("raycast focusGallery.index", hit, focusGallery.index);
      setFocusGallery(hit);
    };
    renderer.domElement.addEventListener("click", raycast, false);
    return function removeListener() {
      renderer.domElement.removeEventListener("click", raycast);
    };
  }, []);

  const handleInsetGalleryLoaded = (data) => {
    console.log("handleInsetScene", data);
    setFocusCamera(data.camera);
  };

  const setInsetScene = (data) => {
    console.log("setInsetScene",data)
    insetSceneViewport.current = data;
  };

  return (
    <div ref={mountRef}>
      {CanvasPrimary.render()}
      <ShardFocus
        renderer={renderer}
        camera={camera}
        scene={scene}
        focusGallery={focusGallery}
        setInsetScene={setInsetScene}
        onInsetGalleryLoaded={handleInsetGalleryLoaded}
        shardsFocusAnimSet={shardsFocusAnimSet}
      />
    </div>
  );
};

const mapStateToProps = (state) => {
  console.log("animation scene state", state, state.scene.children);
  return { focusScene: state.scene, galleries: state.galleries };
};

export default connect(mapStateToProps)(withCanvas(LandingAnimationScene));
