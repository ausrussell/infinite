import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import * as THREE from "three";

const texturesPath = "../textures/";
export const floorData = [
  {
    type: "texture-array",
    url: texturesPath + "wood/hardwood2_diffuse.jpg",
    floorMat: new THREE.MeshStandardMaterial({
      roughness: 0.8,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.0005
    }),
    map: texturesPath + "wood/hardwood2_diffuse.jpg",
    bumpMap: texturesPath + "wood/hardwood2_bump.jpg",
    roughnessMap: texturesPath + "wood/hardwood2_roughness.jpg"
  },
  {
    type: "texture-array",
    url: texturesPath + "concrete_stone/concrete01_diff.jpg",
    floorMat: new THREE.MeshStandardMaterial({
      roughness: 0.8,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.0005
    }),
    map: texturesPath + "concrete_stone/concrete01_diff.jpg",
    bumpMap: texturesPath + "concrete_stone/concrete01_norm.jpg",
    roughnessMap: texturesPath + "concrete_stone/concrete01_spec.jpg"
  },
  {
    type: "texture",
    url: "../textures/concrete_stone/concrete01_diff.jpg"
  },
  {
    type: "texture",
    url: "../textures/concrete_stone/stonetiles_001_diff.jpg"
  },
  {
    type: "texture",
    url: "../textures/concrete_stone/stonetiles_002_diff.jpg"
  },
  {
    type: "texture",
    url: "../textures/concrete_stone/stonetiles_003_diff.jpg"
  },
  { type: "color", color: "#F9FBE7" },
  { color: "#F0F4C3", type: "color" },
  { type: "color", color: "#FFECB3" },
  { type: "color", color: "#FFCC80" },
  { type: "texture", url: "../textures/wood/hardwood.jpg" }
];
export const floorDataX = [
  {
    key: 0,
    type: "texture-array",
    url: texturesPath + "wood/hardwood2_diffuse.jpg",
    floorMat: new THREE.MeshStandardMaterial({
      roughness: 0.8,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.0005
    }),
    map: texturesPath + "wood/hardwood2_diffuse.jpg",
    bumpMap: texturesPath + "wood/hardwood2_bump.jpg",
    roughnessMap: texturesPath + "wood/hardwood2_roughness.jpg"
  },
  {
    key: 1,
    type: "texture-array",
    url: texturesPath + "concrete_stone/concrete01_diff.jpg",
    floorMat: new THREE.MeshStandardMaterial({
      roughness: 0.8,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.0005
    }),
    map: texturesPath + "concrete_stone/concrete01_diff.jpg",
    bumpMap: texturesPath + "concrete_stone/concrete01_norm.jpg",
    roughnessMap: texturesPath + "concrete_stone/concrete01_spec.jpg"
  },
  {
    key: 5,
    type: "texture",
    url: "../textures/concrete_stone/concrete01_diff.jpg"
  },
  {
    key: 6,
    type: "texture",
    url: "../textures/concrete_stone/stonetiles_001_diff.jpg"
  },
  {
    key: 7,
    type: "texture",
    url: "../textures/concrete_stone/stonetiles_002_diff.jpg"
  },
  {
    key: 8,
    type: "texture",
    url: "../textures/concrete_stone/stonetiles_003_diff.jpg"
  },
  { key: 9, type: "color", color: "#F9FBE7" },
  { key: 10, color: "#F0F4C3", type: "color" },
  { key: 2, type: "color", color: "#FFECB3" },
  { key: 3, type: "color", color: "#FFCC80" },
  { key: 4, type: "texture", url: "../textures/wood/hardwood.jpg" }
];

const Tile = props => {
  console.log("add this tile", props);
  // this.props.firebase.addFloorTile(props.item);

  const { color, url, type } = props.item;

  const style = {
    backgroundColor: color,
    backgroundImage: "url(" + url + ")"
    // fontSize: "55px"
  };
  return <div className="tile" style={style} />;
};

class TilesFloor extends Component {
  constructor(props) {
    super(props);
    this.tileCallback = props.tileCallback;
    // props.tilesData.map(item => {
    //   this.props.firebase.addFrameTile(item);
    // });
  }

  tileClickHandler = item => {
    console.log("item", item);
    this.tileCallback(item);
  };
  render() {
    const { tilesData } = this.props;
    return (
      <div className="tile-holder">
        {tilesData.map(item => {
          return (
            <div onClick={e => this.tileClickHandler(item)}>
              <Tile item={item} />
            </div>
          );
        })}
      </div>
    );
  }
}

export default withFirebase(TilesFloor);
