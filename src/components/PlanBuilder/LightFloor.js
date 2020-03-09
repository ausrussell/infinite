import React, { Component, useState } from "react";
import { withFirebase } from "../Firebase";
import { CompactPicker } from "react-color";
import { Slider, Row, Col, Button } from "antd";

const GeneralLightControls = props => {
  const generalLight = props.generalLight;
  console.log("generalLight", generalLight);
  // if (!generalLight) return null; //should get changed when working out general Lights

  const [intensity, setIntensity] = useState(generalLight.intensity * 100);
  const [color, setColor] = useState("#ffffff");
  generalLight.intensity = intensity / 100;
  generalLight.color.set(color);

  const handleChangeComplete = color => {
    console.log("color", color);
    setColor(color.hex);
  };
  return (
    <Row gutter={16}>
      <Col className="gutter-inner-row" span={12}>
        <div className="control-item">
          <div className="control-slider">
            <div className="control-item-name">Intensity</div>
            <div className="control-slider-control">
              <Slider {...props} onChange={setIntensity} value={intensity} />
            </div>
          </div>
        </div>
      </Col>
      <Col className="gutter-inner-row" span={12}>
        <CompactPicker color={color} onChangeComplete={handleChangeComplete} />
      </Col>
    </Row>
  );
};

const SpotlightControls = props => {
  const selectedSpotlight = props.selectedSpotlight.children[0];
  const controllerClass = props.selectedSpotlight.controllerClass;
  const [intensity, setIntensity] = useState(selectedSpotlight.intensity * 100);
  const [color, setColor] = useState("#ffffff");
  // const [transform, setTransform] = useState("translate");

  selectedSpotlight.intensity = intensity / 100;

  selectedSpotlight.color.set(color);
  const handleChangeComplete = color => {
    console.log("color", color);
    setColor(color.hex);
  };

  const transformClickHandler = e => {
    console.log("transformClickHandler", e, e.target.id);
    console.log("controller", props.selectedSpotlight.controllerClass);
    controllerClass.setTransformMode(e.target.id);
  };

  const desectClickHandler = () => {
    controllerClass.deselectSpotlight();
  };
  return (
    <Row gutter={16}>
      <Col className="gutter-inner-row" span={12}>
        <div className="control-item">
          <div className="control-slider">
            <div className="control-item-name">Intensity</div>
            <div className="control-slider-control">
              <Slider {...props} onChange={setIntensity} value={intensity} />
            </div>
          </div>
        </div>
        <div className="control-item">
          <Button id="translate" onClick={transformClickHandler}>
            Move (z)
          </Button>
          <Button id="rotate" onClick={transformClickHandler}>
            Rotate (x)
          </Button>
        </div>
        <div className="control-item">
          <Button id="remove" onClick={desectClickHandler}>
            Deselect (Enter)
          </Button>
          <Button id="remove" onClick={transformClickHandler}>
            Remove
          </Button>
        </div>
      </Col>
      <Col className="gutter-inner-row" span={12}>
        <CompactPicker color={color} onChangeComplete={handleChangeComplete} />
      </Col>
    </Row>
  );
};

class LightFloor extends Component {
  state = {
    selectedSpotlight: null
  };
  constructor(props) {
    // console.log("VaultFloor props", props);
    super(props);
    this.generalLight = props.generalLight;
    console.log("LightFloor props", props);
  }
  componentDidMount() {
    console.log("lightfloor mounted");
  }

  componentDidUpdate(props) {
    console.log("lightfloor componentDidUpdate", props, this.props);
    if (props.selectedSpotlight !== this.props.selectedSpotlight) {
      this.setState({ selectedSpotlight: this.props.selectedSpotlight });
    }
  }

  componentWillUnmount() {}

  test() {
    debugger;
  }

  render() {
    //console.log("tilesData", tilesData, tilesData.length);
    const { selectedSpotlight } = this.state;
    // const style = { background: '#0092ff', padding: '8px 0' };
    // <div className="spotlight-controls-holder">
    //   <h3>Spotlights</h3>
    //   <div className="spotlight-controls-holder">
    //     Click a cone to alter a spotLight
    //   </div>
    // </div>
    return (
      <Row gutter={16} className="lights-gutter-row">
        <Col className="gutter-row" span={12}>
          <div className="gutter-box">
            <h3>Spotlights</h3>
            {selectedSpotlight ? (
              <SpotlightControls selectedSpotlight={selectedSpotlight} />
            ) : (
              <h2> Click a cone to alter a spotLight</h2>
            )}
          </div>
        </Col>
        <Col className="gutter-row" span={12}>
          <div className="gutter-box">
            <h3>General Lighting</h3>
            <GeneralLightControls generalLight={this.generalLight} />
          </div>
        </Col>
      </Row>
    );
  }
}

export default withFirebase(LightFloor);
