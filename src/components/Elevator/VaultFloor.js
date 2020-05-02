import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import { Card, Row, Col, Button } from "antd";

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
    this.refPath= props.refPath;

  }
  componentDidMount() {
    if (this.props.addMaster) {
      this.needToAddMaster = true;
      // this.tilesCall = this.props.firebase.getTiles(this.refPath, this.getMasterTilesCallback);
    }
    // else {
    //   // debugger;
      this.tilesCall = this.props.firebase.getTiles(this.refPath, this.getTilesCallback);
    // }
  }

  componentWillUnmount() {
    this.props.firebase.detachRefListener(this.tilesCall);
    this.masterTilesCall && this.props.firebase.detachRefListener(this.masterTilesCall);
     
  }

  getMasterTilesCallback = data => {
    console.log("getMasterTilesCallback",data)
    this.getTilesCallback(data);
    const pathParts = this.refPath.split('/');
    const masterKey = masterRefPath.split('/').pop();
    if (masterKey !== pathParts[1]) this.masterTilesCall = this.props.firebase.getTiles(masterRefPath + '/' + pathParts[2], this.getTilesCallback);
  }

  getTilesCallback = data => {
    if (this.needToAddMaster !== "adding") this.list = [];
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
    this.setState({ tilesData: this.list });
    if (this.needToAddMaster === "adding") {this.needToAddMaster=false}
    if (this.needToAddMaster === true) {this.needToAddMaster="adding"}
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

  renderTile(snapshot) {
    // console.log("renderTile(snapshot)", snapshot);
    const tileData = snapshot.val();
    const { url, color, px, map, normalMap, bumpMap, title } = tileData;//ny for cubeboxes
    // console.log("renderTile, url, color, ny", url, color, ny, map);
    const tileUrl = url || px || map || normalMap || bumpMap;
    const { key, ref } = snapshot;
    tileData.key = key;
    tileData.ref = ref;
    const { draggable, selectable } = this.props;
    const specificTileStyle = {
      backgroundImage: "url(" + tileUrl + ")",
      backgroundColor: color || "#FFFFFF"
    }
    Object.assign(specificTileStyle, this.coverStyle)
    const isSelected = (tileData.key === this.state.selectedTile)
    const headStyle = (title) ? null : {
      color: 666,
      fontStyle: "italic"
    }

    const cover = (<div style={specificTileStyle} >
      {selectable && isSelected && (<div className="tile-selected-cancel"><div>Selected: Click above to apply</div><Button loading>Cancel</Button></div>)}
    </div>);

    const tileClicker = isSelected ? () => this.unsetSelected() : () => this.tileClickHandler(tileData, "not draggable");

    return draggable ? (
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
          tileUrl={tileUrl}
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

      >
      </Card>
    </Col>
  );
};

export default withFirebase(VaultFloor);
