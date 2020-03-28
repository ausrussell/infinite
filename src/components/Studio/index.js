import React, { Component } from "react";
// import { compose } from "recompose";
// import { FirebaseContext } from "../Firebase";
import { withFirebase } from "../Firebase";
import { Row, Col, Card, Tabs } from "antd";
import Uploader from "../Uploader";

import Elevator from "../Elevator";
import VaultFloor from "../Elevator/VaultFloor";
import AssetEditor from "./AssetEditor";

const { TabPane } = Tabs;

const CubeMapEditor = (props) => {
  console.log("CubeMapEditor props", props);

  return (<div>
    {props.item ? (<AssetEditor item={props.item} />) : (<div>Select an item from the vault below to edit or delete</div>)}
    <CubeBox />
  </div>
  )
}

const ArtEditor = (props) => {
  console.log("CubeMapEditor props", props);

  return (<div>
    {props.item ? (<AssetEditor item={props.item} />) : (<div>Select an item from the vault below to edit or delete</div>)}
  </div>
  )
}

const CubeBox = () => {

  const dragOverHandler = e => {
    console.log("cubebox over", e, e.target);
  };
  const fileDragLeaveHandler = e => {
    console.log("CubeBox fileDragLeaveHandler", e);
  };

  const fileDropHandler = (item, uploadTask) => {
    console.log("fileDropHandler item, uploadTask", item, uploadTask);
  };

  const fileLoadedHandler = (item, uploadTask) => {
    console.log("CubeBox:: fileLoadedHandler item, uploadTask", item, uploadTask);
  };

  return (
    <Card type="inner" title="Upload new asset">
      <div>Drag zip file to upload Cube boxes</div>
      <Uploader
        type="cubebox"
        button="Upload zip"
        fileDragover={dragOverHandler}
        fileDragLeaveHandler={fileDragLeaveHandler}
        fileDrop={(item, uploadTask) => fileDropHandler(item, uploadTask)}
        fileLoadedHandler={fileLoadedHandler}
      />
    </Card>
  );
};
class StudioPage extends Component {

  // const StudioPage = () => {
  // console.log("StudioPage");
  state = {
    floorCalled: 0,
    selectedItem: null
  };

  // constructor(props) {
  //   super(props);
  // }
  componentDidMount() {
    this.floors = this.getElevatorFloors()
  }

  tabClickHandler = (floorNo) => {
    console.log("tabClickHandler", floorNo);
    this.setState({ floorCalled: floorNo })
  }
  floorCalledCallback = (item) => {
    console.log("StudioPage floorCalledCallback", item, item.level);
    this.setState({ floorCalled: item.level })
    console.log("floorCalledCallback state level", this.state.floorCalled);
    this.setState({ counter: this.state.counter + 1 });
  }

  artClickHandler(item, draggableVaultElement) {
    console.log("artClickHandler", item);
    if (item)  item.type = this.floors[this.state.floorCalled].name;
    this.setState({ selectedItem: item })
  }
  frameClickHandler(item) {
    console.log("frameClickHandler", item)
  }

  floorTileCallback(item) {
    console.log("floorTileCallback", item)
  }

  surroundingsTileCallback(item) {
    console.log("surroundingsTileCallback", item)
    if (item)  item.type = this.floors[this.state.floorCalled].name;
    this.setState({ selectedItem: item })
  }

  getElevatorFloors() {
    this.cubeMapeditor = (<CubeMapEditor item={this.state.selectedItem} />);
    this.artEditor = (<ArtEditor item={this.state.selectedItem} />)

    let floorsX = {
      0: {
        name: "Art",
        y: 0,
        floorComponent: VaultFloor,
        refPath: "users/" + this.props.firebase.currentUID + "/art",
        level: 0,
        tileCallback: this.artClickHandler.bind(this),
        editorComponent: this.artEditor

        // editorComponent: cubeMapeditor()

      },
      1: {
        name: "Frames",
        y: 235,
        floorComponent: VaultFloor,
        refPath: "master/frametiles",
        level: 1,
        tileCallback: this.frameClickHandler.bind(this) //to do
      },
      2: {
        name: "Floors",
        y: 470,
        floorComponent: VaultFloor,
        refPath: "master/floortiles",
        level: 2,
        tileCallback: this.floorTileCallback.bind(this)
      },

      4: {
        name: "Surroundings",
        y: 940,
        floorComponent: VaultFloor,
        refPath: "users/" + this.props.firebase.currentUID + "/cubebox",
        level: 4,
        tileCallback: this.surroundingsTileCallback.bind(this),
        editorComponent: this.cubeMapeditor
      }
    };
    return floorsX;
  }

  renderTab = (item) => {
    console.log("renderTab item", item)
    console.log("renderTab name", item.level, item.name)

    return (<TabPane tab={item.name} key={item.level}>
      {item.editorComponent}
    </TabPane>)
  }

  render() {
    const { floorCalled } = this.state;
    console.log("render floorCalled `${floorCalled}`", floorCalled)
    const floors = this.getElevatorFloors();

    return (
      <div>
        <h1>Studio</h1>
        <Row>
          <Col span={12} offset={6} className="center-standard-form">
            <Card title="Studio">
              <Card type="inner">
                <div>Here you can upload resources for your galleries.</div>
                <Tabs activeKey={floorCalled.toString()} onChange={this.tabClickHandler}>
                  {Object.values(floors).map(floor => this.renderTab(floor))
                  }
                </Tabs>

              </Card>

            </Card>
          </Col>
        </Row>
        {this.props.firebase.currentUID && (
          <Elevator
            name="Vault"
            floors={floors}
            floorCalledCallback={this.floorCalledCallback}
            floorCalled={floorCalled}
          />
        )}
      </div>
    );
  }
};

export default withFirebase(StudioPage);
