import React, { Component, useState } from "react";
import { withFirebase } from "../Firebase";
import { ChromePicker } from "react-color";
import { Slider, Row, Col } from "antd";

const SpotlightControls = props => {
  console.log("SpotlightControls", props);
  const selectedSpotlight = props.selectedSpotlight.children[0];
  const [intensity, setIntensity] = useState(80);
  const [color, setColor] = useState("#ffffff");

  selectedSpotlight.intensity = intensity / 100;

  selectedSpotlight.color.set(color);
  const handleChangeComplete = color => {
    console.log("color", color);
    setColor(color.hex);
  };

  // setIntensity = e => {
  //   this.setState({ intensity: e.target.value });
  // };
  // use 'change' instead to see the difference in response
  // <input
  //   type="range"
  //   min="0"
  //   max="100"
  //   value={intensity}
  //   step="1"
  //   name="intensity"
  //   onChange={e => setIntensity(e.target.value)}
  // />
  // <output>{intensity}</output>
  return (
    <Row gutter={16}>
      <Col className="gutter-row" span={12}>
        <Slider {...props} onChange={setIntensity} value={intensity} />
      </Col>
      <Col className="gutter-row" span={12}>
        <ChromePicker
          color={color}
          onChangeComplete={handleChangeComplete}
          disableAlpha={true}
        />
        <output>{color}</output>
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
    return (
      <Row gutter={16}>
        <Col className="gutter-row" span={8}>
          <div className="spotlight-controls-holder">
            <h3>Spotlights</h3>
            <div className="spotlight-controls-holder">
              Click a cone to alter a spotLight
              {selectedSpotlight && (
                <SpotlightControls selectedSpotlight={selectedSpotlight} />
              )}
            </div>
          </div>
        </Col>
        <Col className="gutter-row" span={8}>
          <h3>General Lighting</h3>
        </Col>
      </Row>
    );
  }
}

export default withFirebase(LightFloor);
