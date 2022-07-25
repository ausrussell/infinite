import { SET_GALLERIES_LIST } from "./actionTypes";

const placeholderImage = {thumb:"/imagery/foot.png"}

export const fetchGalleries = () => {
  console.log("fetchGalleries fn")
  return async (dispatch, getState, getFirebase) => {
    const firebase = getFirebase();
    console.log("fetch firebase",firebase)
    firebase.ref("publicGalleries").on("value", (snap) => {
      let galleriesData = snap.val();
      console.log("fetchGalleries publicGalleries",galleriesData)

      const galleryPromises = [];
      for (const galleryKey in galleriesData) {
        if (!galleriesData[galleryKey].galleryImg) {
          const aPromise = new Promise((resolve, reject) => {
            galleriesData[galleryKey].galleryImg = "needs one";
            const pathForGalleryArt = galleriesData[galleryKey].dataPath;
            const artsOnce = firebase
              .ref(`${pathForGalleryArt}/art`)
              .once("value");
            artsOnce.then((snap) => {
              const arts = snap.val();
              if (arts) {
                const owner =
                  galleriesData[galleryKey].owner ||
                  pathForGalleryArt.split("/")[1];
                const ranodomSelectArt = arts[Math.floor(Math.random() * arts.length)];
                const artOnce = firebase
                  .ref(`users/${owner}/art/${ranodomSelectArt}`)
                  .once("value");
                artOnce.then((snap) => {
                  galleriesData[galleryKey].galleryImg = snap.val() || placeholderImage;
                  resolve();
                });
              } else {
                galleriesData[galleryKey].galleryImg = placeholderImage;
                resolve();
              }
            });
          });
          galleryPromises.push(aPromise);
        }
      }
      Promise.all(galleryPromises).then(() => {
        dispatch({ type: SET_GALLERIES_LIST, payload:Object.values(galleriesData)});
      });
    })
    };
  };

