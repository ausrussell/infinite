import * as THREE from "three";

class Frame {
  constructor(props) {
    // super(props);
    this.wall = props;
    const { wallDepth, wallWidth, wallHeight } = this.wall;
    this.wallDepth = wallDepth;
    this.wallWidth = wallWidth;
    this.wallHeight = wallHeight;
    this.maxFrameWidth = this.wallWidth * 0.8;
    this.maxFrameHeight = wallHeight * 0.8;
    this.hasArt = false;
    this.loader = new THREE.TextureLoader();
    this.setFrameMesh();
  }
  setFrameMesh(totalWidth = this.wallWidth * 0.8, totalHeight = 20) {
    // let totalWidth = this.wallWidth * 0.8;
    //
    // let totalHeight = 20;
    // , color = 0x567866
    if (this.mesh) this.group.remove(this.mesh);

    console.log("setFrameMesh", totalWidth, totalHeight);
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
    // shape.extrude(extrudeSettings);

    const texture1 = this.loader.load("../textures/wood/wood3.png");
    this.fgeometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
    // this.fmaterial = new THREE.MeshLambertMaterial({
    //
    //
    //   color: 0x666666,
    //   side: THREE.DoubleSide,
    //   transparent: true,
    //   opacity: 0,
    //   map: texture1
    // });

    this.fmaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      side: THREE.DoubleSide,
      // transparent: true,
      opacity: 0
      // map: texture1
    });

    this.mesh = new THREE.Mesh(this.fgeometry, this.fmaterial);

    const wallMatrix = this.wall.mesh.matrixWorld;

    const shiftedLeft = wallMatrix.makeTranslation(
      -(totalWidth / 2),
      -(totalHeight / 2),
      this.wallDepth / 2
    );
    this.mesh.position.setFromMatrixPosition(shiftedLeft);
    this.mesh.castShadow = true;
    this.totalWidth = totalWidth;
    this.totalHeight = totalHeight;
    this.holeWidth = totalWidth - frameWidth * 2;
    this.holeHeight = totalHeight - frameWidth * 2;

    //   this.artPlane = new THREE.PlaneGeometry()
    // this.iMaterial = new THREE.MeshBasicMaterial();
    // this.mesh = mesh;
    if (!this.group) {
      this.group = new THREE.Group();
      // this.group.add(this.addArt());
    }
    this.group.add(this.mesh);
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
    const maxFramDimensions = this.totalWidth / this.maxFrameHeight;
    const returnDimensions = [];

    let checkW = this.totalWidth / w;
    if (h * checkW < this.maxFrameHeight) {
      //usae Width
      returnDimensions.push(this.holeWidth, this.holeWidth / imageDimensions);
    } else {
      let hChange = this.maxFrameHeight / h;
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
      10
    );
    if (!this.iMaterial) {
      this.iMaterial = new THREE.MeshBasicMaterial({
        // color: 0xfff0f0,
        // side: THREE.DoubleSide,
        map: texture
      });
    } else {
      this.iMaterial.map = texture;
    }
    if (this.artMesh) this.group.remove(this.artMesh);
    this.artMesh = new THREE.Mesh(artPlane, this.iMaterial);
    const frameMatrix = this.mesh.matrixWorld;
    const shifted = frameMatrix.makeTranslation(0, 0, this.wallDepth);
    this.artMesh.position.setFromMatrixPosition(shifted);
    this.setFrameMesh(artDimensions[0], artDimensions[1]);
    // if (!this.hasArt) {
    this.group.add(this.artMesh);
    // }
    this.hasArt = true;
    this.mesh.material.opacity = 1;
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
}

export default Frame;
