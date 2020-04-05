import React from "react";
import styled, { css } from "styled-components";

export default class Draggable extends React.Component {
  state = {
    isDragging: false,

    originalX: 0,
    originalY: 0,

    translateX: 0,
    translateY: 0,

    lastTranslateX: 0,
    lastTranslateY: 0
  };

  constructor(props) {
    console.log("Draggable constructor", props)
    super(props);
    this.itemDragover = props.itemDragover;
    this.itemDrop = props.itemDrop;
    this.itemData = props.itemData;
  }

  componentDidMount() {
    console.log("draggable componentDidMount");
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);

    if (this.props.onDragStart) {
      this.props.onDragStart();
    }

    this.setState({
      originalX: 0,
      originalY: 0,
      isDragging: true
    });
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
  }

  handleMouseDown = ({ clientX, clientY }) => {
    console.log("handleMouseDown");
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);

    if (this.props.onDragStart) {
      this.props.onDragStart();
    }

    this.setState({
      originalX: clientX,
      originalY: clientY,
      isDragging: true
    });
  };

  handleMouseMove = e => {
    const { clientX, clientY } = e;
    const { isDragging } = this.state;
    const { onDrag } = this.props;

    if (!isDragging) {
      return;
    }

    this.setState(
      prevState => ({
        translateX: clientX - prevState.originalX + prevState.lastTranslateX,
        translateY: clientY - prevState.originalY + prevState.lastTranslateY
      }),
      () => {
        if (onDrag) {
          onDrag({
            translateX: this.state.translateX,
            translateY: this.state.translateY
          });
        }
      }
    );
    this.itemDragover(e);
  };

  handleMouseUp = () => {
    console.log("handleMouseUp");
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);

    this.setState(
      {
        originalX: 0,
        originalY: 0,
        lastTranslateX: this.state.translateX,
        lastTranslateY: this.state.translateY,

        isDragging: false
      },
      () => {
        if (this.props.onDragEnd) {
          this.props.onDragEnd();
        }
      }
    );
    this.itemDrop(this.itemData);
  };

  render() {
    const { children } = this.props;
    const { translateX, translateY, isDragging } = this.state;
    return (
      <Container
        onMouseDown={this.handleMouseDown}
        x={translateX}
        y={translateY}
        isDragging={isDragging}
      >
        {children}
      </Container>
    );
  }
}

const Container = styled.div.attrs(props => ({
  // we can define static props
  type: "password",

  // or we can define dynamic ones
  size: props.x || "1em",
}))`
  position: absolute;
  border: 2px solid #666;
  border-radius: 3px;

  /* here we use the dynamically computed prop */
  top:${props => props.y}px;
  left: ${props => props.x}px;
  cursor: grabbing;
       opacity: 0.8;

`;

