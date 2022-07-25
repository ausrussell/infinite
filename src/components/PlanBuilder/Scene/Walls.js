import { useEffect, useState } from "react";
import { connect } from "react-redux";
import Wall from "./Wall";

const Walls = ({ walls, scene, floorplan }) => {
  useEffect(() => {
    const old =
      scene?.children.filter((item) => item.name === "wall") || [];
    old.forEach((item) => {
      item.removeGroup();
    });
    if (walls) {
      walls.forEach((wall) => {
        const options = {
          scene,
          wall,
          floorplan,
        };
        new Wall(options);
      });
    }
  }, [walls, scene]);
  return null;
};

const mapStateToProps = ({ sceneData, scene }) => {
  console.log("Walls state ", scene);
  const { walls, floorplan } = sceneData;

  return { walls, floorplan, scene };
};

export default connect(mapStateToProps)(Walls);
