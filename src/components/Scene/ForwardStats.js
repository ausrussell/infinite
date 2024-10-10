import { forwardRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addAnimationUpdatables } from "../../redux/actions";

import Stats from "three/examples/jsm/libs/stats.module.js";

const ForwardStats = forwardRef((props, ref) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    const statDom = stats.dom;
    statDom.style.right = "0px";
    statDom.style.left = "inherit";
    document.body.appendChild(statDom);
    dispatch(addAnimationUpdatables({ stats: stats.update.bind(stats) }));
    return () => {
      document.body.removeChild(statDom);
    };
  }, []);
});

export default ForwardStats;
