import React from "react";

const MainCanvas = props => {
  return <div id="boardCanvas" ref={mount => props.refer(mount)} />;
};

export default MainCanvas;
