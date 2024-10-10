import { useEffect, useState } from "react";
import { connect } from "react-redux";
import Wall from "./Wall";
import { createScene } from "../../../redux/actions";

const Walls = ({ walls, scene, floorplan,createScene }) => {
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
    createScene(scene)
  }, [walls, scene]);
  return null;
};

const mapStateToProps = ({ sceneData, scene }) => {
  console.log("Walls state ", scene);
  const { walls, floorplan } = sceneData;

  return { walls, floorplan, scene };
};

export default connect(mapStateToProps, {createScene})(Walls);
