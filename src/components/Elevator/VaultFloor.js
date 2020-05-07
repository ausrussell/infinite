import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import { Card, Row, Col, Button } from "antd";

import { UploaderTile } from "../Uploader"

const masterRefPath = 'users/0XHMilIweAghhLcophtPU4Ekv7D3'
class VaultFloor extends Component {
  state = {
    tilesData: [],
    selectedTile: null
  };
  constructor(props) {
    console.log("VaultFloor props", props);
    super(props);
    this.tileCallback = props.tileCallback;
    this.refPath = props.refPath;

  }
  componentDidMount() {
    // console.log("this.needToAddMaster",this.needToAddMaster)
    // if (this.props.addMaster) {
    //   this.needToAddMaster = true;
    // }
    this.tilesCall = this.props.firebase.getTiles(this.refPath, this.getTilesCallback);
  }

  componentWillUnmount() {
    this.props.firebase.detachRefListener(this.tilesCall);
    this.masterTilesCall && this.props.firebase.detachRefListener(this.masterTilesCall);

  }

  addMasterTiles() {
    const pathParts = this.refPath.split('/');
    this.tilesCall = this.props.firebase.getTiles(masterRefPath + '/' + pathParts[2], this.addMasterTilesCallback);

  }
  addMasterTilesCallback = (data) => {
    const masterTiles =this.state.tilesData;
    if (data) {
      data.forEach((childSnapshot) => {
        masterTiles.push(childSnapshot);
      });
    }
    this.setState({tilesData:masterTiles})
  }

  setInitialList() {
    this.list = [];
    if (this.props.addUploader) {
      this.list.push(<UploaderTile />)
    }
  }

  getTilesCallback = (data) => {
    console.log("getTilesCallback this.needToAddMaster",this.needToAddMaster)
      this.list = [];
    this.setInitialList();
    const listObj = {};
    let selectedTilePresent = false;
    if (data) {
      data.forEach((childSnapshot) => {
        this.list.push(childSnapshot);
        listObj[childSnapshot.key] = childSnapshot;
        if (this.state.selectedTile === childSnapshot.key && !selectedTilePresent) selectedTilePresent = true
      });
    }

    if (this.state.selectedTile && !selectedTilePresent) {
      this.clearSelected()
    }
    this.setState({ tilesData: this.list }, this.props.addMaster && this.addMasterTiles);
  };

  clearSelected = () => {
    console.log("clearSelected");
    this.setState({ selectedTile: null });
    this.tileCallback(null);

  }
  unsetSelected = () => {
    this.setState({ selectedTile: null });

  }

  tileClickHandler = (item, tile) => {
    this.tileCallback(item, tile);

    this.setState({ selectedTile: item.key });
  };

  coverStyle = {
    backgroundSize: "cover",
    height: 100,
    width: "100%"
  };

  fullCoverStyle = {
    height: "100%",
    width: "100%"
  };

  getReactTile(element) {
    const tileInfo = {};
    tileInfo.cover = (<div style={this.fullCoverStyle} >
      {element}
    </div>);
    tileInfo.key = "uploader";
    tileInfo.tileClicker = null;
    tileInfo.reactElement = true;
    tileInfo.headStyle = { display: "none" }
    return tileInfo

  }
  getDataTile(snapshot) {
    const tileData = snapshot.val();
    const tileInfo = {};
    tileInfo.tileData = tileData;
    const { thumb, url, color, px, map, normalMap, bumpMap, title } = tileData;//ny for cubeboxes
    tileInfo.title = title
    // console.log("renderTile, url, color, ny", url, color, ny, map);
    tileInfo.tileUrl = thumb || url || px || map || normalMap || bumpMap;
    const { key, ref } = snapshot;
    tileInfo.key = tileInfo.tileData.key = key;
    tileInfo.ref = ref;
    const specificTileStyle = {
      backgroundImage: "url(" + tileInfo.tileUrl + ")",
      backgroundColor: color || "#FFFFFF"
    }
    Object.assign(specificTileStyle, this.coverStyle)
    const { selectable } = this.props;
    const isSelected = (tileInfo.key === this.state.selectedTile);
    if (isSelected) console.log("isSelected", tileInfo.key, this.state.selectedTile);
    tileInfo.tileClicker = isSelected ? () => this.unsetSelected() : () => this.tileClickHandler(tileData, "not draggable");

    tileInfo.cover = (<div style={specificTileStyle} >
      {selectable && isSelected && (<div className="tile-selected-cancel"><div>Selected: Click above to apply</div><Button loading>Cancel</Button></div>)}
    </div>);
    tileInfo.isSelected = (tileData.key === this.state.selectedTile)
    tileInfo.headStyle = (title) ? null : {
      color: 666,
      fontStyle: "italic"
    }
    return tileInfo
  }

  renderTile(snapshot) {
    // console.log("renderTile(snapshot)", snapshot);
    // if (!snapshot.val) debugger;
    const tileInfo = (React.isValidElement(snapshot)) ? this.getReactTile(snapshot) : this.getDataTile(snapshot);

    const { draggable } = this.props;

    const { key, tileData, title, tileUrl, cover, headStyle, tileClicker, isSelected, reactElement } = tileInfo;
    return (draggable && !reactElement) ? (
      <Tile
        key={key}
        onMouseDown={() => this.tileClickHandler(tileData)}
        title={title || "Untitled"}
        tileUrl={tileUrl}
        cover={cover}
        headStyle={headStyle}
      />
    ) : (
        <Tile
          onClick={tileClicker}
          key={key}
          title={title || "Untitled"}
          tileUrl={tileUrl || null}
          cover={cover}
          headStyle={headStyle}
          hoverable={true}
          isSelected={isSelected}
        />
      );
  }

  render() {
    const { tilesData } = this.state;
    //console.log("tilesData", tilesData, tilesData.length);
    return (
      <div className="tile-holder">
        {tilesData.length > 0 ? (
          <Row gutter={[16, 16]}>
            {tilesData.map(data => this.renderTile(data))}
          </Row>
        ) : (
            <div className="vault-floor-empty">Nothing on this floor, yet!</div>
          )}
      </div>
    );
  }
}

const cardStyle = {
  height: 140,
  width: 140,
}

const Tile = props => {
  const { onClick, onMouseDown, title, hoverable, cover, headStyle } = props;

  return (
    <Col>
      <Card size="small" style={cardStyle}
        title={title}
        cover={cover}
        headStyle={headStyle}
        hoverable={hoverable}
        onClick={onClick}
        onMouseDown={onMouseDown}
        bodyStyle={{display:"none"}}

      />
    </Col>
  );
};

export default withFirebase(VaultFloor);
