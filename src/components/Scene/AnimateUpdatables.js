import { useEffect, useRef, useState } from "react";
// import { connect } from "react-redux";
import * as THREE from "three";
import { useSelector } from "react-redux";
const AnimateUpdatables = () => {
  const animationUpdatables = useSelector((state) => state.animationUpdatables);
  const [isAnimating, setAnimating] = useState(true);
  const controls = useRef(null);
  const clock = useRef(null);
  useEffect(() => {
    clock.current = new THREE.Clock();
  }, []);
  useEffect(() => {
    let frameId;
    const animate = () => {
      Object.values(animationUpdatables).forEach((fn) => {
        // console.log("AnimateUpdatables fn", fn);
        fn(clock.current.getDelta());
      });
      frameId = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (!frameId) {
        frameId = requestAnimationFrame(animate);
      }
    };

    const stop = () => {
      cancelAnimationFrame(frameId);
      frameId = null;
    };
    stop();
    start();

    controls.current = { start, stop };
    console.log("animationUpdatables", animationUpdatables);
    return () => {
      stop();
    };
  }, [animationUpdatables]);

  useEffect(() => {
    if (isAnimating) {
      controls.current.start();
    } else {
      controls.current.stop();
    }
  }, [isAnimating]);
  return null;
};

export default AnimateUpdatables;
