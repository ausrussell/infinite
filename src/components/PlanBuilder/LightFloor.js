import React, { Component, useState } from "react";
import { withFirebase } from "../Firebase";
import { CompactPicker } from "react-color";
import { Slider, Row, Col, Button, Icon, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const GeneralLightControls = props => {
  const generalLight = props.generalLight;
  console.log("generalLight", generalLight);
  if (!generalLight) return null; //should get changed when working out general Lights

  const [intensity, setIntensity] = useState(generalLight.intensity * 100);
  const [color, setColor] = useState();
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
  if (!selectedSpotlight) return null;
  const controllerClass = props.selectedSpotlight.controllerClass;
  const [intensity, setIntensity] = useState(selectedSpotlight.intensity * 100);
  const [color, setColor] = useState();
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
  const removeClickHandler = () => {
    controllerClass.removeSpotlight(selectedSpotlight);
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
          <Button id="remove" onClick={removeClickHandler}>
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
    selectedSpotlight: null,
    generalLight: null
  };
  constructor(props) {
    // console.log("VaultFloor props", props);
    super(props);
    this.generalLight = props.generalLight;
    this.addSpotlLightCallback = props.addSpotlightHandler;
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
    if (props.generalLight !== this.props.generalLight) {
      this.setState({ generalLight: this.props.generalLight });
    }
  }

  componentWillUnmount() {}

  addSpotlightHandler = () => {
    this.addSpotlLightCallback();
  };

  render() {
    //console.log("tilesData", tilesData, tilesData.length);
    const { selectedSpotlight, generalLight } = this.state;

    console.log("selectedSpotlight", selectedSpotlight);
    return (
      <Row gutter={16} className="lights-gutter-row">
        <Col className="gutter-row" span={12}>
          <div className="gutter-box">
            <h3>Spotlights</h3>
            <Tooltip title="Add a spotlight">
              <Button
                type="primary"
                shape="round"
                onClick={() => this.addSpotlightHandler()}
              >
                <PlusOutlined />
                Add Spotlight
              </Button>
            </Tooltip>
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
            <GeneralLightControls generalLight={this.state.generalLight} />
          </div>
        </Col>
      </Row>
    );
  }
}

export default withFirebase(LightFloor);
