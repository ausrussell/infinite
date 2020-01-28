import * as THREE from "three";
import GLTFLoader from "three-gltf-loader";

class Frame {
  constructor(props) {
    const { artMesh, frameMesh, position, side, wall } = props;
    console.log("Frame", artMesh, frameMesh, position, side, wall);
    this.artMeshData = artMesh;
    this.convertArtMeshData();
    this.frameMeshData = frameMesh;
    this.convertFrameMeshData();
    this.offset = position;
    this.side = side;

    this.wall = wall;

    this.wallWidth = 20;
    this.wallHeight = 60;
    this.wallDepth = 5;

    this.group = new THREE.Group();
    this.group.name = "artHolder";
    this.gltfLoader = new GLTFLoader();
  }

  convertArtMeshData() {
    const loader = new GLTFLoader();
    console.log("this.artMeshData", this.artMeshData);
    debugger;

    loader.parse(this.artMeshData, gltf => {
      console.log("artMesh = ", gltf);
    });
    // const artPlane = new THREE.PlaneGeometry(
    //   this.artMeshData.width,
    //   this.artMeshData.height,
    //   0
    // );
    //
    // const loader = new THREE.TextureLoader();
    // var texture = loader.load(this.artMeshData.src);
    //
    // const iMaterial = new THREE.MeshBasicMaterial({
    //   side: THREE.DoubleSide,
    //   map: texture,
    //   opacity: 1
    // });
    // this.artMesh = new THREE.Mesh(artPlane, iMaterial);
  }

  convertFrameMeshData() {
    console.log("this.frameMeshData.shapes", this.frameMeshData);

    var loader = new THREE.ObjectLoader();

    const fgeometry = new THREE.ExtrudeBufferGeometry(
      this.frameMeshData.shapes,
      this.frameMeshData.options
    );
    const fmaterial = new THREE.MeshLambertMaterial({
      color: 0x666666,
      side: THREE.DoubleSide
      // transparent: true,
      // map: texture1
    });

    this.frameMesh = new THREE.Mesh(fgeometry, fmaterial);
    this.setFramePosition();
    this.group.add(this.frameMesh);
  }

  setFramePosition() {
    const wallMatrix = this.wall.wallMesh.matrixWorld;
    const shiftedLeft = wallMatrix.makeTranslation(
      (-this.artMesh.geometry.parameters.width * this.artMesh.scale.x) / 2, //-(this.totalWidth / 2),
      (-this.artMesh.geometry.parameters.height * this.artMesh.scale.y) / 2,
      0 // this.side === "back" ? -(this.wallDepth * 1.5) : this.wallDepth * 0.5
    );
    this.frameMesh.position.setFromMatrixPosition(shiftedLeft);
  }

  renderArt() {
    console.log("renderArt", this);
    console.log("this.artMesh", this.artMesh);
    debugger;
    this.artMesh.position.set(0, 0, this.wallDepth);
    this.group.add(this.artMesh);
    if (this.side === "back") this.group.rotateY(Math.PI);
    this.wall.wallGroup.add(this.group);
    this.artMesh.translateZ(this.wallDepth);
  }
}

export default Frame;
