import * as THREE from "three";

import { TransformControls } from "./TransformControls";

class Frame {
  constructor(props, side = "front") {
    // super(props);
    this.wall = props;
    const { wallDepth, wallWidth, wallHeight } = this.wall;
    this.wallDepth = wallDepth;
    this.wallWidth = wallWidth;
    this.wallHeight = wallHeight;
    this.maxFrameWidth = this.wallWidth * 0.8;
    this.maxFrameHeight = wallHeight * 0.8;
    this.hasArt = this.wall.sides[side].hasArt;
    this.loader = new THREE.TextureLoader();
    this.side = side;
  }
  setFrameMesh(options) {
    const { totalWidth, totalHeight, defaultFrame } = options;
    console.log(
      "setFrameMesh",
      totalWidth,
      totalHeight,
      "this.mesh",
      this.mesh
    );
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, totalHeight);
    shape.lineTo(totalWidth, totalHeight);
    shape.lineTo(totalWidth, 0);
    shape.lineTo(0, 0);

    const hole = new THREE.Shape();
    const frameWidth = 1;
    hole.moveTo(frameWidth, frameWidth);
    hole.lineTo(frameWidth, totalHeight - frameWidth);
    hole.lineTo(totalWidth - frameWidth, totalHeight - frameWidth);
    hole.lineTo(totalWidth - frameWidth, frameWidth);
    hole.lineTo(frameWidth, frameWidth);
    shape.holes.push(hole);

    const extrudeSettings = {
      steps: 2,
      depth: this.wallDepth,
      bevelEnabled: true,
      bevelThickness: 0.5,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 8
    };

    const texture1 = this.loader.load("../textures/wood/wood3.png");
    this.fgeometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
    this.fmaterial = new THREE.MeshLambertMaterial({
      color: 0x666666,
      side: THREE.DoubleSide,
      transparent: true,
      map: texture1
    });

    const mesh = new THREE.Mesh(this.fgeometry, this.fmaterial);

    const wallMatrix = this.wall.wallMesh.matrixWorld;

    const shiftedLeft = wallMatrix.makeTranslation(
      -(totalWidth / 2),
      -(totalHeight / 2),
      // 20,
      this.side === "back" ? -(this.wallDepth * 1.5) : this.wallDepth * 0.5
    );
    mesh.position.setFromMatrixPosition(shiftedLeft);
    mesh.updateMatrix();
    mesh.castShadow = true;
    this.totalWidth = totalWidth;
    this.totalHeight = totalHeight;
    this.holeWidth = totalWidth - frameWidth * 2;
    this.holeHeight = totalHeight - frameWidth * 2;

    if (!this.group) {
      this.group = new THREE.Group();
      this.group.side = this.side;
      this.group.wallPos = this.wall.pos;
    }

    if (defaultFrame) {
      this.defaultMesh = mesh;
    } else {
      this.group.remove(this.artFrame);
      this.artFrame = mesh;
      this.artFrame.name = "this.artFrame";
    }
  }
  //
  // addRemoveTransformControls() {}
  // clickOffListener(event) {
  //   const intersectedData = this.wall.builder.checkForIntersecting();
  //   // debugger;
  // }
  // addRemoveTransformControlsListener() {
  //   console.log("addRemoveTransformControlsListener");
  //   if (this.transformControlsOn) {
  //     window.addEventListener("mousedown", this.clickOffListener.bind(this));
  //   } else {
  //     window.removeEventListener("mousedown", this.clickOffListener);
  //   }
  // }

  addListeners() {
    window.addEventListener("keydown", event => {
      switch (event.keyCode) {
        case 81: // Q
          this.transformControls.setSpace(
            this.transformControls.space === "local" ? "world" : "local"
          );
          break;

        case 17: // Ctrl
          this.transformControls.setTranslationSnap(100);
          this.transformControls.setRotationSnap(Math.degToRad(15));
          break;

        case 87: // W
          this.transformControls.setMode("translate");
          break;

        case 69: // E
          this.transformControls.setMode("rotate");
          break;

        case 82: // R
          this.transformControls.setMode("scale");
          break;

        case 187:
        case 107: // +, =, num+
          this.transformControls.setSize(this.transformControls.size + 0.1);
          break;

        case 189:
        case 109: // -, _, num-
          this.transformControls.setSize(
            Math.max(this.transformControls.size - 0.1, 0.1)
          );
          break;

        case 88: // X
          this.transformControls.showX = !this.transformControls.showX;
          break;

        case 89: // Y
          this.transformControls.showY = !this.transformControls.showY;
          break;

        case 90: // Z
          this.transformControls.showZ = !this.transformControls.showZ;
          break;

        case 32: // Spacebar
          this.transformControls.enabled = !this.transformControls.enabled;
          break;
        default:
          break;
      }
    });
  }
  addDefault() {
    this.group.add(this.defaultMesh);
  }
  removeDefault() {
    this.group.remove(this.defaultMesh);
  }
  showDefaultFrame() {
    this.defaultMesh.material.opacity = 1;
  }
  hideDefaultFrame() {
    this.defaultMesh.material.opacity = 0;
  }

  getFrameGroup() {
    return this.group;
  }
  addArt(file) {
    console.log("addART", file);
    const image = new Image();
    image.src = file;
    image.onload = image => this.imageLoadedHandler(file, image);
  }

  fitToFrame(w, h) {
    let imageDimensions = w / h;
    const returnDimensions = [];

    let checkW = this.totalWidth / w;
    if (h * checkW < this.maxFrameHeight) {
      //usae Width
      returnDimensions.push(this.holeWidth, this.holeWidth / imageDimensions);
    } else {
      returnDimensions.push(
        this.maxFrameHeight * imageDimensions,
        this.maxFrameHeight
      );
    }

    return returnDimensions;
  }

  imageLoadedHandler(file, image) {
    const loader = new THREE.TextureLoader();
    var texture = loader.load(file);
    let imageWidth = image.target.width;
    let imageHeight = image.target.height;
    const artDimensions = this.fitToFrame(imageWidth, imageHeight);
    console.log("dimensions", artDimensions);
    const artPlane = new THREE.PlaneGeometry(
      artDimensions[0],
      artDimensions[1],
      0
    );
    if (!this.iMaterial) {
      this.iMaterial = new THREE.MeshBasicMaterial({
        // color: 0xfff0f0,
        side: THREE.DoubleSide,
        map: texture
      });
    } else {
      this.iMaterial.map = texture;
    }
    // if (this.frameMesh) this.group.remove(this.frameMesh);
    if (this.artMesh) this.group.remove(this.artMesh);
    this.artMesh = new THREE.Mesh(artPlane, this.iMaterial);

    this.defaultMesh.updateMatrixWorld();
    const frameMatrix = this.defaultMesh.matrixWorld;
    const shifted = frameMatrix.makeTranslation(
      0,
      0,
      this.side === "back" ? -this.wallDepth : this.wallDepth
    );
    this.artMesh.position.setFromMatrixPosition(shifted);
    this.artMesh.name = "artMesh";
    // this.artMesh.position.set(
    //   20,
    //   20,
    //   this.side === "back" ? -this.wallDepth : this.wallDepth
    // );
    let options = {
      totalWidth: artDimensions[0],
      totalHeight: artDimensions[1]
    };
    this.setFrameMesh(options);
    this.group.add(this.artFrame);
    this.removeDefault();
    this.group.add(this.artMesh);
    this.wall.builder.setSceneMeshes(); //maybe update method in builder
    // this.addTransformControls();
    // this.artMesh.translateX();
    // this.artFrame.add(this.artMesh);
    // this.artMesh.position.set(
    //   0,
    //   0,
    //   this.side === "back" ? -this.wallDepth : this.wallDepth
    // );

    // this.group.translateY(15);
    // const scale = new THREE.Vector3(2, 2, 2);
    // this.group.scale.set(5, 25, 42); //) = scale;
  }

  loadHandler = texture => {
    this.fmaterial.color.set("#fff");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.05, 0.05);
    this.fmaterial.map = texture;
    this.fmaterial.needsUpdate = true;
  };

  setFrameColor(item) {
    if (item.color) {
      this.fmaterial.map = null;
      this.fmaterial.needsUpdate = true;
      this.fmaterial.color.set(item.color);
    } else {
      var loader = new THREE.TextureLoader();
      // loader.crossOrigin = "";
      loader.load(item.url, texture => this.loadHandler(texture));
    }
  }
  show() {
    this.mesh.material.opacity = 1;
  }
  hide() {
    this.mesh.material.opacity = 0;
  }
}

export default Frame;
