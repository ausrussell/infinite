import React, { createRef, useState, useRef } from "react";
import "../../css/elevator.css";
// import { Spring, config } from "react-spring/renderprops"; //Transition,
import { useSpring, animated } from 'react-spring'
import { List } from 'antd'
import { LeftCircleOutlined, DownCircleOutlined } from '@ant-design/icons';


const FloorWrapper = React.forwardRef((props, ref) => {
  const { title, children } = props;
  return (
    <div className="floor-container" key="title" ref={ref}>
      <h4 className="floor-title">{title}</h4>
      <div className="floor-wrapper">{children}</div>
    </div>
  );
})
// const floorRefs = [];

const Elevator = (props) => {
  const [springProps, setSpringProps, stopSpringProps] = useSpring(() => ({ scroll: 1 }))
  // console.log("Elevator props",props)
  const [vaultOpen, setVaultOpen] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(0);
  const floorRefs = useRef([])
  const floorsLength = Object.keys(props.floors).length;

  const animatedDiv = useRef();

  if (floorRefs.current.length !== floorsLength) {
    // add or remove refs in initial setup
    floorRefs.current = Array(floorsLength).fill().map((_, i) => floorRefs.current[i] || createRef())
  }

  const vaultButtonHandler = () => {
    setVaultOpen(!vaultOpen)
  }

  const floorClickHandler = (no) => {
    console.log("animatedDiv", animatedDiv.current.scrollTop)
    setSpringProps({ scroll: floorRefs.current[no].current.offsetTop });
    setCurrentFloor(no);
    props.floorCalledCallback(props.floors[no])
  }
  return (
    <div className={`vault-container ${vaultOpen ? "open" : "closed"}`}>
      {vaultOpen && (<div draggable="true" />)}
      <div className="vault-doors" >
        {vaultOpen && (
          <animated.div
            ref={animatedDiv}
            className="vault-floors-container"
            scrollTop={springProps.scroll}
            onWheel={stopSpringProps}>
            {Object.values(props.floors).map((floor, i) => {
              return (
                <FloorWrapper title={floor.name} key={floor.level} ref={floorRefs.current[i]} >
                  {floor.floorComponent instanceof Function
                    ? floor.floorComponent(floor)
                    : floor.floorComponent}
                </FloorWrapper>
              );
            })}

          </animated.div>
        )}
        <ElevatorPanel floors={props.floors} currentFloor={currentFloor} floorClickHandler={floorClickHandler} />

      </div>
      <VaultButton vaultButtonHandler={vaultButtonHandler} vaultOpen={vaultOpen} name={props.name} />

    </div>
  );
}

const VaultButton = props => {
  return (
    <div className="vault-button-panel">
      <div
        onClick={props.vaultButtonHandler}
        className="vault-button"
      >
        {props.vaultOpen ? (<div>Close
          <br />
          {props.name}
          <br />
          <DownCircleOutlined style={{ fontSize: 26, marginTop: 5, marginBottom: 5 }} /></div>) : (<div>Open<br />
            {props.name}
            <br />
            <LeftCircleOutlined style={{ fontSize: 26, marginTop: 5, marginBottom: 5 }} /></div>)}
      </div>
    </div>
  )
}


const ElevatorPanel = (props) => {
  const floorClickHandler = (no) => {
    console.log("ElevatorPanel", no);
    props.floorClickHandler(no)
  }
  return (<div className="elevator-panel">
    <div className="elevator header">
      <div className="elevator-current-floor">
        {props.currentFloor +
          " " +
          props.floors[props.currentFloor].name}
      </div>
    </div>
    <div className="elevator-floors-list">
      <List>
        {Object.values(props.floors).map(floor => {
          return (
            <List.Item
              key={floor.level}

              className="elevator-floors-list-item"
              onClick={() => floorClickHandler(floor.level)}
            >
              {floor.level}. {floor.name}
            </List.Item>
          );
        })}
      </List>
    </div>
  </div>)
}

export default Elevator;
