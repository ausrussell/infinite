import { useEffect } from "react";
import { connect } from "react-redux";
import Sculpture from "./Sculpture";
import {disposeNode} from "../../../Helpers/TextureAdder";


const Sculptures = ({ sculptures, scene }) => {
  useEffect(() => {
    const old =
      scene?.children.filter((item) => item.name === "sculpture") || [];
    old.forEach((item) => {
      disposeNode(item);
      scene.remove(item);
    });
    if (sculptures) {
      sculptures.forEach((sculpture) => {
        const sobj = new Sculpture(scene);
        sobj.setDataToMaterial(sculpture);
      });
    }
  }, [sculptures, scene]);
  return null;
};

const mapStateToProps = ({ sceneData, scene }) => {
  console.log("sculptures state ", scene);
  const { sculptures } = sceneData;
  return { sculptures, scene };
};

export default connect(mapStateToProps)(Sculptures);
