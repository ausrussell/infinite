import React, { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";

const useMousePosition = () => {
  const [position, setPosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  useEffect(() => {
    const setFromEvent = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", setFromEvent);
    return () => {
      window.removeEventListener("mousemove", setFromEvent);
    };
  }, []);
  return position;
};

export const FocusEye = ({ focusEye }) => {
  const position = useMousePosition();
  useEffect(() => {
    const clickHandler = (e) => {
      // debugger;
      if (
        e.x < focusEye.x ||
        e.x > focusEye.mount.offsetWidth - focusEye.x ||
        e.y < focusEye.y ||
        e.y > focusEye.mount.offsetHeight - focusEye.y
      ) {
        console.log("setBorderON");
        focusEye.leaveHandler();
      }
    };

    focusEye.mount.addEventListener("click", (e) => clickHandler(e));
    return () => {
      focusEye.mount.removeEventListener("click", (e) => clickHandler(e));
    };
  }, [focusEye]);

  const props = useSpring({
    from: {
      width: 20,
      height: 20,
      // borderRadius: "50%",
      top: focusEye.center.y - 10,
      left: focusEye.center.x - 10,
    },
    to: {
      top: focusEye.mount.offsetTop,
      left: 0,
      width: focusEye.mount.offsetWidth,
      height: focusEye.mount.offsetHeight,
      borderLeftWidth: focusEye.x,
      borderRightWidth: focusEye.x,
      borderTopWidth: focusEye.y,
      borderBottomWidth: focusEye.y,
    },
    config: { mass: 1, tension: 580, friction: 60 },
  });

  return (
    <div className="focus-screen">
      <animated.div className="focus-eye" style={props}></animated.div>
      <animated.div
        className="focus-cursor"
        style={{ top: position.y - 20, left: position.x - 20 }}
      ></animated.div>
      <div className="focus-escape"></div>
    </div>
  );
};
