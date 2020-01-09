import React, { Component } from "react";
import { withFirebase } from "../Firebase";

class VaultFloor extends Component {
  state = {
    tilesData: []
  };
  constructor(props) {
    console.log("VaultFloor props", props);
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
    console.log("getTilesCallback", data);
    if (data) {
      data.forEach(function(childSnapshot) {
        list.push(childSnapshot);
      });
    }
    this.setState({ tilesData: list });
    console.log("getTilesCallback", list);
  };

  tileClickHandler = item => {
    console.log("item", item);
    this.tileCallback(item);
  };

  renderTile(snapshot) {
    console.log("renderTile(snapshot)", snapshot);
    console.log(snapshot.val());
    const tileData = snapshot.val();
    const { url, color } = tileData;
    const { key } = snapshot;
    const style = {
      backgroundColor: color || "#FFFFFF",
      backgroundImage: "url(" + url + ")",
      backgroundSize: "cover"
    };
    return (
      <div
        key={key}
        className="tile"
        onClick={() => this.tileClickHandler(tileData)}
      >
        <div className="tile-image" style={style} />
      </div>
    );
  }

  render() {
    const { tilesData } = this.state;
    return (
      <div className="tile-holder">
        {tilesData.map(data => this.renderTile(data))}
      </div>
    );
  }
}

const Tile = props => {
  const { color, url, type } = props.item;

  const style = {
    backgroundColor: color,
    backgroundImage: "url(" + url + ")"
    // fontSize: "55px"
  };
  return <div className="tile" style={style} />;
};

export default withFirebase(VaultFloor);
