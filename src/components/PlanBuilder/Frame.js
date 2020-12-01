import * as THREE from "three";
import Animate from "../../Helpers/animate";
import TextureAdder from "../../Helpers/TextureAdder"

class Frame {
  constructor(props, side = "front") {
    this.textureLoader = new THREE.TextureLoader();
    this.offset = new THREE.Vector3();
    this.group = new THREE.Group();
    this.group.name = "artHolder";
    this.group.holderClass = this;
    this.group.side = side;
    this.group.setFrameColor = frameData => this.setDataToMaterial(frameData);
    this.group.removeTexture = () => this.removeTexture();

    this.frameData = { color: 0x666666 }; //default frame color

    this.frameWidth = 1;
    this.export = {};

    if (props) {//i.e. made by WallObject
      this.wall = props;
      const { wallDepth, wallWidth, wallHeight } = this.wall;

      //defaults for frame
      this.wallDepth = wallDepth;
      this.wallWidth = wallWidth;
      this.wallHeight = wallHeight;
      this.maxFrameWidth = this.wallWidth * 0.8;
      this.maxFrameHeight = wallHeight * 0.8;
      this.hasArt = this.wall.sides[side].hasArt;

      this.side = side;
      this.group.wallPos = this.wall.pos;
    }

  }

  getExport() {
    this.export.groupPosition = this.group.position;
    this.export.frame = this.frameData;
    this.export.side = this.side;
    if (!this.artKey) this.artKey = this.getKeyFromFile();
    this.export.art = {
      file: this.artMesh.file, //iMaterial.map,
      width: this.artMesh.geometry.parameters.width * this.artMesh.scale.x,
      height: this.artMesh.geometry.parameters.height * this.artMesh.scale.y,
      key: this.artKey
    };
    return this.export;
  }

  setDefaultFrameMaterial() {
    // const texture1 = this.textureLoader.load("../textures/wood/wood3.png");
    // this.fmaterial = new THREE.MeshLambertMaterial({
    this.fmaterial = new THREE.MeshStandardMaterial({

      color: this.frameData.color,
      side: THREE.DoubleSide,
      transparent: true
      // map: texture1
    });
    this.textureAdder = new TextureAdder({ material: this.fmaterial });


  }

  removeTexture() {
    //console.log("remove frame texture")
    this.fmaterial.dispose();
    this.frameMesh.material = null;
    this.setDefaultFrameMaterial();
    this.frameMesh.material = this.fmaterial
  }

  setDefaultFrameGroup(options) {
    const { imageWidth, imageHeight } = options;
    const defaultPlane = new THREE.PlaneGeometry(imageWidth, imageHeight, 0);

    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
      // color: "#f111ff"
    });
    const defaultArtMesh = new THREE.Mesh(defaultPlane, material);
    this.group.add(defaultArtMesh);
    this.wallDepth && defaultArtMesh.translateZ(this.wallDepth);
    this.artMesh = defaultArtMesh;
    this.setDefaultFrameMaterial();
    this.setFrameMesh(defaultPlane);
    this.group.add(this.frameMesh);
    if (this.side === "back") this.group.rotateY(Math.PI);
  }

  setFrameMesh(plane) {
    // //console.log("setFrameMesh", this.frameData);
    const imageWidth = plane.parameters.width * this.artMesh.scale.x;
    const imageHeight = plane.parameters.height * this.artMesh.scale.y;
    // console.log("imageWidth", imageWidth, this.artMesh.scale.x);
    this.setFrameGeometry(imageWidth, imageHeight);
    if (!this.fmaterial) this.setDefaultFrameMaterial();
    const mesh = new THREE.Mesh(this.fgeometry, this.fmaterial);
    this.totalWidth = imageWidth + 2 * this.frameWidth;
    this.totalHeight = imageHeight + 2 * this.frameWidth;
    this.frameMesh = mesh;
    this.frameMesh.name = "frameMesh";
    this.setFramePosition();
    // console.log("setFrameMesh", this.frameData);

    return mesh;
  }

  setFramePosition() {
    if (this.wall) {
      const wallMatrix = this.wall.wallMesh.matrixWorld;
      const shiftedLeft = wallMatrix.makeTranslation(//in relation to wall
        (-this.artMesh.geometry.parameters.width * this.artMesh.scale.x) / 2,
        (-this.artMesh.geometry.parameters.height * this.artMesh.scale.y) / 2,
        0
      );
      this.frameMesh.position.setFromMatrixPosition(shiftedLeft);
    }
    else {//for Preview
      this.frameMesh.position.set(-this.artMesh.geometry.parameters.width / 2, -this.artMesh.geometry.parameters.height / 2, 0);
    }
  }

  removeFromWall = () => {
    this.wall.removeFrame(this, this.side);
  }

  setFrameMeshRescaled({ totalWidth, totalHeight }) {
    this.setFrameGeometry(totalWidth, totalHeight);
    const mesh = new THREE.Mesh(this.fgeometry, this.fmaterial);
    this.group.remove(this.frameMesh);
    this.frameMesh = mesh;
    this.frameMesh.name = "frameMesh";
  }

  getWallData = () => {
    return {
      wallOver: this.wall,
      wallSideOver: this.side
    };
  };
  rescale = () => {
    let options = {
      totalWidth: this.artMesh.geometry.parameters.width * this.artMesh.scale.x,
      totalHeight:
        this.artMesh.geometry.parameters.height * this.artMesh.scale.y
    };
    //console.log("rescale options", options);
    this.setFrameMeshRescaled(options);
    this.setFramePosition();

    this.frameMesh.material.opacity = 1;
    this.group.add(this.frameMesh);
  };

  setFrameGeometry(imageWidth, imageHeight) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, imageHeight);
    shape.lineTo(imageWidth, imageHeight);
    shape.lineTo(imageWidth, 0);
    shape.lineTo(0, 0);

    const hole = new THREE.Shape();

    hole.moveTo(0, 0);
    hole.lineTo(0, imageHeight);
    hole.lineTo(imageWidth, imageHeight);
    hole.lineTo(imageWidth, 0);
    hole.lineTo(0, 0);
    shape.holes.push(hole);

    const extrudeSettings = {
      steps: 2,
      depth: this.wallDepth || 2,
      bevelEnabled: true,
      bevelThickness: 0.5,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 8
    };
    this.fgeometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
  }

  removeArtFrame() {
    this.frameMesh.material.transparent = true;
    this.frameMesh.material.opacity = 0;
  }

  setArtMesh(artMesh) {
    //only used by positionMovedHolder in WallObject
    //console.log("setArtMesh", this.wall.col);
    this.artMesh = artMesh;
    this.oldGroup = artMesh.parent;
    this.frameData = this.oldGroup.holderClass.frameData;

    // this.group.holderClass = this;//??
    this.fmaterial = this.oldGroup.holderClass.fmaterial;
    this.frameMesh = this.oldGroup.children.find(
      item => item.name === "frameMesh"
    );
    const wallMatrix = this.wall.wallMesh.matrixWorld;

    this.offset
      .copy(artMesh.getWorldPosition())
      .sub(this.wall.wallGroup.getWorldPosition());
    let groupShifted;
    if (this.group.wallPos === 1) {
      groupShifted = wallMatrix.makeTranslation(
        this.offset.x,
        this.offset.y,
        0
      );
    } else {
      groupShifted = wallMatrix.makeTranslation(
        -this.offset.z,
        this.offset.y,
        0
      );
    }

    //console.log("this.offset", this.offset);
    this.artMesh.position.set(0, 0, this.wallDepth);
    this.artMesh.getWallData = this.getWallData;
    this.showFrameMesh();
    this.group.add(this.artMesh);
    this.group.add(this.frameMesh);
    this.group.position.setFromMatrixPosition(groupShifted);
    if (this.side === "back") {
      this.group.rotateY(Math.PI);
    }
    this.wall.wallGroup.add(this.group);
    this.wall.builder.setSceneMeshes();
  }

  showFrameMesh(opacity = 1) {
    this.frameMesh.material.opacity = 1;
  }
  addDefault() {
    this.group.add(this.defaultMesh);
    return;
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

  addArtRapid(itemData){
    const image = new Image();
    image.src = itemData.url;
    const options = {
      file: itemData.url,
      image: image,
      holder: itemData.holder
    };
    // const next = snapshot => {
    //   // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    //   var progress = snapshot.bytesTransferred / snapshot.totalBytes;
    //   if (this.artMesh) this.show(progress);
    //   //console.log("Upload is " + progress + "% done");
    //   //console.log("snapshot", snapshot.ref);
    // };

    image.onload = () => this.imageLoadedHandler(options);
    // this.show(1);

  }
  addArt(options) {//from dropping or dragging an image
    const { file, uploadTask, holder, draggableImageRef } = options;//file is itemdata or dragged file
    const addingHolder = holder || this;
    //console.log("addART", file);
    if (file.url || file.thumb) {//not sure why some old art has thumb but no url

      const options = {

        file: file.url || file.thumb,
        image: draggableImageRef.current,
        holder: addingHolder,

      };
      this.imageLoadedHandler(options);
      this.show(1);
    } else {
      const image = new Image();
      image.src = file;
      const options = {
        file: file,
        image: image,
        holder: addingHolder
      };
      const next = snapshot => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = snapshot.bytesTransferred / snapshot.totalBytes;
        if (this.artMesh) this.show(progress);
        //console.log("Upload is " + progress + "% done");
        //console.log("snapshot", snapshot.ref);
      };

      image.onload = image => this.imageLoadedHandler(options);
      uploadTask.on("state_changed", {
        next: next
        // complete: complete
      });
      uploadTask.then(snapshot => {
        //console.log("uploaded file", snapshot);
        uploadTask.snapshot.ref.getDownloadURL()
          .then(downloadURL => {
            this.artMesh.file = downloadURL;
          });
      });
    }
  }

  setGroup(groupPosition) {
    this.wall.wallGroup.add(this.group);
    this.group.position.set(groupPosition.x, groupPosition.y, 0);
  }

  setArt(art) {//from art data
    //console.log("setArt art", art);
    const texture = this.textureLoader.load(art.file);
    const artPlane = new THREE.PlaneGeometry(art.width, art.height, 0);
    this.iMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: texture,
      opacity: 0,
      transparent: true
    });
    this.artMesh = new THREE.Mesh(artPlane, this.iMaterial);
    this.artMesh.name = "artMesh";
    this.artMesh.file = art.file;
    this.wallDepth && this.artMesh.translateZ(this.wallDepth);
    this.group.add(this.artMesh);
    if (this.side === "back") this.group.rotateY(Math.PI);


    this.artKey = this.getKeyFromFile();

  }

  getKeyFromFile() {
    const fileParts = this.artMesh.file.split("/");
    //console.log("fileParts", fileParts);
    const finalBit = fileParts[fileParts.length - 1];
    const finalBits = finalBit.split("%2F")
    //console.log("finalBits", finalBits)

    const keyToAdd = finalBits[3];//art.key || 
    //console.log("keyToAdd", keyToAdd)
    return keyToAdd;
  }

  setFrame(frame) {
    //console.log("frame", frame);
    this.frameData = frame;
    this.setFrameMesh(this.artMesh.geometry);
    this.fmaterial.opacity = 0;
    //console.log("setFrame this.frameMesh", this.frameMesh);
    this.setDataToMaterial(frame)
    this.group.add(this.frameMesh);
  }

  setPreviewFrame(frame) {
    // console.log("frame", frame);
    // this.frameData = frame;
    const options = {
      imageWidth: 30,
      imageHeight: 20
    }

    this.setDefaultFrameGroup(options);
  }

  fadeFrameIn() {
    const fadeAni = new Animate({
      duration: 450,
      timing: "circ",
      draw: progress => this.fadingIn(progress)
    });
    this.finalOpacity = (this.fmaterial.opacity > 0) ? this.fmaterial.opacity : 1;
    fadeAni.animate(performance.now());
  }
  fadingIn = progress => {
    progress += 0.01;
    this.show(progress);
    if (this.frameMesh) this.fmaterial.opacity = this.finalOpacity * progress;
  };

  addFrameFromData(item) {
    const { groupPosition, art, frame } = item;
    this.setGroup(groupPosition);
    this.setArt(art);
    this.setFrame(frame);
  }

  fitToFrame(w, h, fitW, fitH) {
    //console.log("fitToFrame w,h", w, h);
    let imageDimensions = w / h;
    const returnDimensions = [];
    let checkW = fitW / w;
    if (h * checkW < this.maxFrameHeight) {
      //usae Width
      returnDimensions.push(fitW, fitW / imageDimensions);
    } else {
      returnDimensions.push(fitH * imageDimensions, fitH);
    }
    return returnDimensions;
  }

  imageLoadedHandler(options) {
    const { image, file, holder } = options;
    this.file = file;
    const loader = new THREE.TextureLoader();
    var texture = loader.load(file);
    let imageWidth = image.width;
    let imageHeight = image.height;

    const fitW =
      holder.artMesh.geometry.parameters.width * holder.artMesh.scale.x;
    const fitH =
      holder.artMesh.geometry.parameters.height * holder.artMesh.scale.y; // * this.rescale;

    const artDimensions = this.fitToFrame(imageWidth, imageHeight, fitW, fitH);
    this.artWidth = artDimensions[0];
    this.artHeight = artDimensions[1];
    const artPlane = new THREE.PlaneGeometry(this.artWidth, this.artHeight, 0);

    if (!this.iMaterial) {
      this.iMaterial = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: texture,
        opacity: 0.1,
        transparent: true
      });
    } else {
      this.iMaterial.map = texture;
    }
    if (this.artMesh) {
      this.group.remove(this.artMesh);
    }
    if (this.frameMesh) {
      this.group.remove(this.frameMesh);
    }
    this.artMesh = new THREE.Mesh(artPlane, this.iMaterial);
    this.artMesh.file = file;
    this.artMesh.name = "artMesh";
    this.artMesh.getWallData = this.getWallData;
    // this.artMesh.rescale = this.rescale;
    this.artMesh.translateZ(this.wallDepth);

    this.setFrameMesh(artPlane);

    this.group.add(this.frameMesh);
    this.group.add(this.artMesh);
    if (this.side === "back") this.group.rotateY(Math.PI);

    //console.log("add art this.group", this.group.position);

    //ONLY add if added to default
    if (!holder.hasArt) {
      this.wall.wallGroup.add(this.group);
    }
    this.wall.builder.setSceneMeshes(); //maybe update method in builder
  }

  setDataToMaterial(data) {
    this.frameData = data;
    this.textureAdder.setDataToMaterial(data);

  }
  show(opacity = 1) {
    this.artMesh.material.opacity = opacity;
  }

  hide() {
    this.mesh.material.opacity = 0;
  }
}

export default Frame;
