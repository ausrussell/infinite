import { useEffect } from "react";
import { connect } from "react-redux";
import Light from "./Light";
import {disposeNode} from "../../../Helpers/TextureAdder";


const Lights = ({ lights, scene }) => {
  useEffect(() => {
    console.log("Lights effect ",lights)
    const old =
      scene?.children.filter((item) => item.name === "light") || [];
    old.forEach((item) => {
      disposeNode(item);
      scene.remove(item);
    });
    if (lights) {
      lights.forEach((light) => {
          console.log("light loop",light)
        new Light(scene, light);
        // sobj.setDataToMaterial(sculpture);
      });
    }
  }, [lights, scene]);
  return null;
};

const mapStateToProps = ({ sceneData, scene }) => {
  console.log("lights state ",sceneData, scene);
  const { lights } = sceneData;
  console.log("lights  ",lights, lights?.length);

  return { lights, scene };
};

export default connect(mapStateToProps)(Lights);