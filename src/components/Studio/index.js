import React, { Component } from "react";
// import { compose } from "recompose";
// import { FirebaseContext } from "../Firebase";
import { withFirebase } from "../Firebase";
import { Row, Col, Card, Tabs } from "antd";
import Uploader from "../Uploader";

import Elevator from "../Elevator";
import VaultFloor from "../Elevator/VaultFloor";
import AssetEditor from "./AssetEditor";

import ThreeAssetPreview from './ThreeAssetPreview';
import PageTitle from '../Navigation/PageTitle';

import {SurroundsHelp} from './SurroundsHelp'



const { TabPane } = Tabs;

const ArtEditor = (props) => {
  return (<div>
    {props.item ? (<AssetEditor item={props.item} />) : (<div>Select an item from the vault below to edit or delete</div>)}
  </div>
  )
}

class StudioPage extends Component {
  state = {
    floorCalled: 0,
    selectedItem: null
  };

  componentDidMount() {
    this.floors = this.getElevatorFloors()
  }

  tabClickHandler = (floorNo) => {
    // console.log("tabClickHandler", floorNo);
    this.setState({ floorCalled: floorNo })
  }
  floorCalledCallback = (item) => {
    this.setState({ floorCalled: item.level, selectedItem: null })
  }

  artClickHandler(item) {
    if (item) item.type = this.floors[this.state.floorCalled].name;
    this.setState({ selectedItem: item })
  }

  frameClickHandler(item) {
    console.log("frameClickHandler", item);
    this.setState({ selectedItem: item });
  }

  floorTileCallback(item) {
    console.log("Studio floorTileCallback", item);
    this.setState({ selectedItem: item })
  }

  wallTileCallback(item) {
    console.log("Studio wallTileCallback", item);
    this.setState({ selectedItem: item })
  }

  surroundingsTileCallback(item) {
    console.log("surroundingsTileCallback", item)
    // if (item) item.type = this.floors[this.state.floorCalled].name;
    this.setState({ selectedItem: item })
  }

  getElevatorFloors() {
    this.cubeMapeditor = (<ThreeAssetPreview item={this.state.selectedItem}  type="surrounds" help={SurroundsHelp} />);
    this.artEditor = (<ArtEditor item={this.state.selectedItem} />)
    this.frameEditor = (<ThreeAssetPreview item={this.state.selectedItem}  type="frame"/>)
    this.floorEditor = (<ThreeAssetPreview item={this.state.selectedItem}  type="floor"/>)
    this.wallEditor = (<ThreeAssetPreview item={this.state.selectedItem}  type="wall"/> )


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
        refPath: "users/" + this.props.firebase.currentUID + "/frame",
        // refPath: "master/frametiles",
        level: 1,
        tileCallback: this.frameClickHandler.bind(this), //to do
        editorComponent: this.frameEditor

      },
      2: {
        name: "Floors",
        y: 470,
        floorComponent: VaultFloor,
        refPath:  "users/" + this.props.firebase.currentUID + "/floor",
        level: 2,
        tileCallback: this.floorTileCallback.bind(this),
        editorComponent: this.floorEditor

      },
      3: {
        name: "Walls",
        y: 705,
        floorComponent: VaultFloor,
        refPath:  "users/" + this.props.firebase.currentUID + "/wall",
        level: 3,
        tileCallback: this.wallTileCallback.bind(this),
        editorComponent: this.wallEditor

      },

      4: {
        name: "Surrounds",
        y: 940,
        floorComponent: VaultFloor,
        refPath: "users/" + this.props.firebase.currentUID + "/surrounds",
        level: 4,
        tileCallback: this.surroundingsTileCallback.bind(this),
        editorComponent: this.cubeMapeditor
      }
    };
    return floorsX;
  }

  renderTab = (item) => {

    return (<TabPane tab={item.name} key={item.level}>
      {(this.state.floorCalled === item.level) && item.editorComponent}
    </TabPane>)
  }

  render() {
    const { floorCalled } = this.state;
    const floors = this.getElevatorFloors();

    return (
      <div>
      <PageTitle title={'Studio'} />
        <Row>
          <Col span={16} offset={4} className="center-standard-form">
            <Card>
                <div>Here you can add and edit the different resources for your galleries.</div>
                <Tabs activeKey={floorCalled.toString()} onChange={this.tabClickHandler}>
                  {Object.values(floors).map(floor => this.renderTab(floor))
                  }
                </Tabs>


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
