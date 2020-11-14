import React from "react";
import styled from "styled-components";
import { useSpring, animated } from "react-spring";

export const FocusEye = ({ focusEye }) => {
  console.log("FocusEye", focusEye);

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
    <>
      <animated.div className="focus-eye" style={props}></animated.div>
    </>
  );
};

const EyeBorder = styled.div`
  /* Adapt the colors based on primary prop */
  background: white;
  font-size: 1em;
  border: 4px solid palevioletred;
  border-radius: 3px;
  position: absolute;
  top: ${(props) => props.focusEye.y}px;
  left: ${(props) => props.focusEye.x}px;
  width: ${(props) => props.focusEye.width}px;
  z-index: 2;
  height: ${(props) => props.focusEye.height}px;
  opacity: 0.5;
`;
