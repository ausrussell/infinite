import { useEffect, useState } from "react";

import { connect } from "react-redux";
import { withFirebase } from "../Firebase";
import Art from "./Art";

const ArtFromWalls = ({ art, owner, firebase }) => {
  const [artAr, setArtAr] = useState([]);
  useEffect(() => {
    console.log("art, owner,firebase 2", art, owner, firebase);
    if (art?.length > 0) {
      const { getAsset } = firebase;
      const options = {
        refPath: `users/${owner}/art`,
        once: true,

        callback: (snap) => {
          console.log("snap.val()", snap.val());
          const artData = snap.val();
          const artFiltered = [];
          art.forEach((key) => {
            if (artData[key]) {
              artFiltered.push(artData[key]);
            }
          });
          setArtAr(artFiltered);
        },
      };
      getAsset(options);
    }
  }, [art, owner, firebase]);

//   useEffect(() => {
//     console.log("artAr", artAr);

//     if (artAr?.length > 0) {
//       artAr.forEach((item, index) => {
//         new Art(item, index);
//       });
//     }
//   }, [artAr]);
  return artAr.map((art, index) => (<Art art={art} index={index} key={`art_${index}`} />));
};

const mapStateToProps = (state) => {
  const { art, owner } = state.sceneData;

  return { art, owner, sceneData: state.sceneData };
};

export default connect(mapStateToProps)(withFirebase(ArtFromWalls));
