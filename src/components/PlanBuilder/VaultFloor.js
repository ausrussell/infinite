import React, { Component } from "react";
import { withFirebase } from "../Firebase";

class VaultFloor extends Component {
  state = {
    tilesData: []
  };
  constructor(props) {
    //console.log("VaultFloor props", props);
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
    // console.log("getTilesCallback", data);
    if (data) {
      data.forEach(function(childSnapshot) {
        const itemKey = list.push(childSnapshot);
        listObj[childSnapshot.key] = childSnapshot;
      });
    }
    this.setState({ tilesData: list });
    // console.log("getTilesCallback", list);
  };

  tileClickHandler = (item, tile) => {
    console.log("item", item, tile);
    this.tileCallback(item, tile);
  };

  renderTile(snapshot) {
    //console.log("renderTile(snapshot)", snapshot);
    const tileData = snapshot.val();
    const { url, color } = tileData;
    const { key } = snapshot;
    tileData.key = key;
    const { draggable } = this.props;
    const style = {
      backgroundColor: color || "#FFFFFF",
      backgroundImage: "url(" + url + ")",
      backgroundSize: "cover"
    };
    //style={style} onClick={() => this.tileClickHandler(tileData)}
    // return  ({draggable ? (<Draggable><Tile  /></Draggable> ): (<Tile />)})
    //
    // <Draggable key={key}>
    //   <Tile
    //     style={style}
    //     onClick={() => this.tileClickHandler(tileData)}
    //   />
    // </Draggable>

    return draggable ? (
      <Tile
        key={key}
        style={style}
        onMouseDown={() => this.tileClickHandler(tileData)}
      />
    ) : (
      <Tile
        style={style}
        onClick={() => this.tileClickHandler(tileData, "not draggable")}
        key={key}
      />
    );
    // <div
    //   key={key}
    //   className="tile"
    //   onClick={() => this.tileClickHandler(tileData)}
    // >
    //   <div className="tile-image" style={style} />
    // </div>
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
  const { style, onClick, onMouseDown } = props;
  //console.log("Tile", props);
  return (
    <div className="tile" onClick={onClick}>
      <div className="tile-image" style={style} onMouseDown={onMouseDown} />
    </div>
  );
};

export default withFirebase(VaultFloor);
