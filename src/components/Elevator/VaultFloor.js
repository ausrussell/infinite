import React, { Component } from "react";
import { withFirebase } from "../Firebase";

class VaultFloor extends Component {
  state = {
    tilesData: [],
    selectedTile: null
  };
  constructor(props) {
    // console.log("VaultFloor props", props);
    super(props);
    // this.refPath = props.refPath;
    this.tileCallback = props.tileCallback;
  }
  componentDidMount() {
    console.log("mounted vault UID", this.props.firebase.currentUID);
    const { refPath } = this.props;
    this.props.firebase.getTiles(refPath, this.getTilesCallback);
  }

  componentWillUnmount() {
    this.props.firebase.detachGetTiles();
  }

  getTilesCallback = data => {
    const list = [];
    const listObj = {};
    console.log("getTilesCallback", data);
    let selectedTilePresent = false;
    if (data) {
      data.forEach((childSnapshot) => {
        list.push(childSnapshot);
        listObj[childSnapshot.key] = childSnapshot;
        if  (this.state.selectedTile === childSnapshot.key && !selectedTilePresent) selectedTilePresent = true
        console.log("childSnapshot.key",childSnapshot.key)
      });
    }
    if (this.state.selectedTile && !selectedTilePresent) {
      console.log("",this.state.selectedTile,selectedTilePresent )
      this.clearSelected()}
    this.setState({ tilesData: list });
    console.log("getTilesCallback list", list);
  };
  clearSelected(){
    this.setState({selectedTile: null});
    this.tileCallback(null);

  }

  tileClickHandler = (item, tile) => {
    console.log("tileClickHandler",item)
    this.tileCallback(item, tile);
    this.setState({selectedTile: item.key});
  };

  renderTile(snapshot) {
    // console.log("renderTile(snapshot)", snapshot);
    const tileData = snapshot.val();
    const { url, color, ny, title } = tileData;//ny for cubeboxes
    // console.log("renderTile, url, color, ny", url, color, ny);
    const tileUrl = url || ny;
    const { key, ref } = snapshot;
    tileData.key = key;
    tileData.ref = ref;
    const { draggable } = this.props;
    const style = {
      backgroundColor: color || "#FFFFFF",
      backgroundImage: "url(" + tileUrl + ")",
      backgroundSize: "cover"
    };


    return draggable ? (
      <Tile
        key={key}
        style={style}
        onMouseDown={() => this.tileClickHandler(tileData)}
        title={title}
      />
    ) : (
      <Tile
        style={style}
        onClick={() => this.tileClickHandler(tileData, "not draggable")}
        key={key}
        title={title}
      />
    );
  }

  render() {
    const { tilesData } = this.state;
    //console.log("tilesData", tilesData, tilesData.length);
    return (
      <div className="tile-holder">
        {tilesData.length > 0 ? (
          tilesData.map(data => this.renderTile(data))
        ) : (
          <div className="vault-floor-empty">Nothing on this floor, yet!</div>
        )}
      </div>
    );
  }
}

const Tile = props => {
  const { style, onClick, onMouseDown, title } = props;
  //console.log("Tile", props);
  return (
    <div className="tile" onClick={onClick}>
      <div className="tile-title">{title}</div>
      <div className="tile-image" style={style} onMouseDown={onMouseDown} />
    </div>
  );
};

export default withFirebase(VaultFloor);
