import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import { Card, Row, Col, Button, Tooltip, Modal, message, Popover } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { UploaderTile } from "../Uploader";
import AssetEditor from "../Studio/AssetEditor";
const { confirm } = Modal;

const masterID = "0XHMilIweAghhLcophtPU4Ekv7D3";

const untitledStyle = {
  color: 666,
  fontStyle: "italic",
};

const RestoreDefaultTile = (props) => {
  return (
    <div style={{ textAlign: "center", marginTop: 5 }}>
      <Button onClick={() => props.onClick()}>Clear</Button>
    </div>
  );
};

const SculptureController = (props) => {
  const onClick = (e) => {
    props.onClick(e);
  };
  return (
    <div className="control-item">
      <Button id="translate" onClick={onClick}>
        Move (z)
      </Button>
      <Button id="rotate" onClick={onClick}>
        Rotate (x)
      </Button>
      <Button id="scale" onClick={onClick}>
        Scale (y)
      </Button>
    </div>
  );
};

const DisplayBadge = ({ tileData }) => {
  const { ownerDisplayName, galleryTitle, borrowed } = tileData;
  const content = (
    <div>
      {ownerDisplayName && (
        <p>
          Borrowed from <strong>{ownerDisplayName}</strong>'s
        </p>
      )}
      {galleryTitle && (
        <p>
          gallery <strong>{galleryTitle}</strong>
        </p>
      )}
      {borrowed && (
        <p>
          on <strong>{borrowed}</strong>
        </p>
      )}
    </div>
  );
  return (
    <Popover content={content}>
      <div className="borrowed-badge">
        {ownerDisplayName ? ownerDisplayName.charAt(0) : "Borrowed"}
      </div>
    </Popover>
  );
};

class VaultFloor extends Component {
  state = {
    tilesData: [],
    usersTiles: [],
    borrowedTiles: [],
    masterTiles: [],
    // selectedTile: null
  };
  constructor(props) {
    super(props);
    this.tileCallback = props.tileCallback;
    this.refPath = props.refPath;

    if (!this.refPath) debugger;
    this.pathParts = this.refPath.split("/");
    this.type = this.pathParts[2];
  }
  componentDidMount() {
    this.tilesCall = this.props.firebase.getTiles(
      this.refPath,
      this.getTilesCallback
    );
  }

  componentWillUnmount() {
    this.props.firebase.detachRefListener(this.tilesCall);
    this.masterTilesCall &&
      this.props.firebase.detachRefListener(this.masterTilesCall);
  }

  getTilesCallback = (data) => {
    this.list = [];
    this.setInitialList();
    const listObj = {};
    let selectedTilePresent = false;
    if (data) {
      data.forEach((childSnapshot) => {
        this.list.push(childSnapshot);
        listObj[childSnapshot.key] = childSnapshot;
        if (
          this.props.selectedTile &&
          this.props.selectedTile.key === childSnapshot.key &&
          !selectedTilePresent
        )
          selectedTilePresent = true;
      });
    }

    if (this.props.selectedTile && !selectedTilePresent) {
      this.clearSelected();
    }
    this.setState({ tilesData: this.list }, this.addBorrowedTiles);
  };

  addBorrowedTiles() {
    const borrowedRefPath = this.pathParts;
    borrowedRefPath[2] = `borrowed-${this.type}`;
    this.tilesCall = this.props.firebase.getTiles(
      borrowedRefPath.join("/"),
      this.addBorrowedTilesCallback
    );
  }

  addMasterTiles() {
    this.tilesCall = this.props.firebase.getTiles(
      "users/" + masterID + "/" + this.type,
      this.addMasterTilesCallback
    );
  }

  addBorrowedTilesCallback = (data) => {
    const addingBorrowedTiles = this.list.slice();
    if (data) {
      data.forEach((childSnapshot) => {
        const borrowedInfo = childSnapshot.val();
        borrowedInfo.userTypeClass = "borrowed";
        borrowedInfo.key = childSnapshot.key;
        addingBorrowedTiles.push(borrowedInfo);
      });
    }
    this.setState(
      { tilesData: addingBorrowedTiles },
      this.props.addMaster && this.addMasterTiles
    );
  };
  addMasterTilesCallback = (data) => {
    if (this.props.firebase.currentUID === masterID) {
      return;
    }
    const masterTiles = this.state.tilesData;
    if (data) {
      data.forEach((childSnapshot) => {
        const masterInfo = childSnapshot.val();
        masterInfo.key = childSnapshot.key;

        masterInfo.userTypeClass = "master";
        masterTiles.push(masterInfo);
      });
    }
    this.setState({ tilesData: masterTiles });
  };

  setInitialList() {
    this.list = [];
    if (this.props.addUploader) {
      this.list.push(
        <UploaderTile validation="image">Upload Art</UploaderTile>
      );
    }
    if (this.props.restoreDefault) {
      this.list.push(
        <RestoreDefaultTile onClick={() => this.props.restoreDefault()} />
      );
    }
    if (this.props.selectableRestoreDefault) {
      const restoreOptions = { title: "Clear", key: "clear" };
      Object.assign(restoreOptions, this.props.selectableRestoreDefault);
      this.list.push(restoreOptions);
    }
    if (this.props.sculptureTransformClickHandler) {
      this.list.push(
        <SculptureController
          onClick={this.props.sculptureTransformClickHandler}
        />
      );
    }
  }

  clearSelected = () => {
    this.tileCallback(null);
  };

  tileClickHandler = (item, e) => {
    e && e.stopPropagation();
    this.tileCallback(item);
  };

  coverStyle = {
    backgroundSize: "cover",
    height: 100,
    width: "100%",
  };

  fullCoverStyle = {
    height: "100%",
    width: "100%",
  };

  getReactTile(element) {
    const tileInfo = {};
    tileInfo.type = this.type;
    tileInfo.cover = <div style={this.fullCoverStyle}>{element}</div>;
    tileInfo.key = "uploader";
    tileInfo.tileClicker = null;
    tileInfo.reactElement = true;
    tileInfo.headStyle = { display: "none" };
    return tileInfo;
  }
  getDataTile(snapshot) {
    const tileData = snapshot.val ? snapshot.val() : snapshot;
    const tileInfo = {};
    tileInfo.tileData = tileData;
    tileData.type = this.type;
    const { thumb, url, color, px, map, normalMap, bumpMap, title } = tileData; //ny for cubeboxes
    tileInfo.title = title;
    tileInfo.tileUrl = thumb || url || px || map || normalMap || bumpMap;
    const { key, ref } = snapshot;
    tileInfo.key = tileInfo.tileData.key = key;
    tileInfo.ref = ref;
    const specificTileStyle = {
      backgroundImage: "url(" + tileInfo.tileUrl + ")",
      backgroundColor: color || "#FFFFFF",
      cursor: this.props.draggable ? "grab" : "pointer",
    };
    Object.assign(specificTileStyle, this.coverStyle);
    const { selectable } = this.props;
    const isSelected =
      this.props.selectedTile && tileInfo.key === this.props.selectedTile.key;
    tileInfo.tileClicker = isSelected
      ? () => this.clearSelected()
      : (e) => this.tileClickHandler(tileData, e);
    const coverListener = this.props.draggable
      ? () => this.tileClickHandler(tileData)
      : null;
    tileInfo.cover = (
      <div
        style={specificTileStyle}
        className={`${tileData.userTypeClass}`}
        onMouseDown={coverListener}
      >
        {selectable && isSelected && (
          <div className="tile-selected-cancel">
            <div>Selected: Click above to apply</div>
            <Button loading>Cancel</Button>
          </div>
        )}
        {tileData.userTypeClass === "borrowed" && (
          <DisplayBadge tileData={tileData} />
        )}
      </div>
    );
    tileInfo.isSelected = isSelected;
    tileInfo.headStyle = title ? null : untitledStyle;
    return tileInfo;
  }

  editTile = (tileData) => {
    tileData.type = tileData.borrowed ? "borrowed-art" : "art"; //needs updating if other types
    Modal.info({
      content: (
        <AssetEditor item={tileData} firebaseModal={this.props.firebase} />
      ),
      width: "75vw",
    });
  };

  path = (tileData) =>
    this.props.firebase.assetPath(tileData.borrowed ? "borrowed-art" : "art") +
    tileData.key; //might change type here
  doDelete = (item) => {
    // const dbDelete = this.props.firebase.deleteAsset(
    //   this.path(tileData),
    //   tileData
    // ); //obeying rules for path in cloud functions
    const updates = {};
    const usersPath = this.path(item);
    updates[usersPath] = {};
    if (item.borrowed){
    const itemPath = `art/${item.key}/borrowedBy/${this.props.firebase.currentUID}`;
    const itemRefPath = `users/${item.owner}/${itemPath}`;
    updates[itemRefPath] = {};}
    this.props.firebase.updateAssets(updates).then(() => {
      message.success(
        <>
          {item.title} succesfully
          {item.borrowed ? "removed" : "deleted"}!
        </>
      );
    });

    // //need to remove from source
    // dbDelete.then(() =>
    //   message.success(
    //     <>
    //       <span style={{ color: "#000" }}>{tileData.title}</span> succesfully
    //       deleted!
    //     </>
    //   )
    // );
    // return dbDelete;
  };
  deleteTile = (tileData) => {
    const message = (
      <>
        Do you want to {tileData.borrowed ? "remove" : "delete"} <span style={{ color: "#000" }}>{tileData.title}</span> from your vault?
      </>
    );
    const config = {
      title: message,
      icon: <ExclamationCircleOutlined />,
      onOk: () => this.doDelete(tileData),
      onCancel() {
      },
    };
    confirm(config);
  };

  renderTile(snapshot) {
    const tileInfo = React.isValidElement(snapshot)
      ? this.getReactTile(snapshot)
      : this.getDataTile(snapshot);
    const { draggable } = this.props;
    const {
      key,
      tileData,
      title,
      tileUrl,
      cover,
      headStyle,
      tileClicker,
      isSelected,
      reactElement,
    } = tileInfo;
    const actions =
      this.props.actions && !reactElement
        ? [
            <Tooltip title="Edit">
              <EditOutlined
                key="edit"
                onClick={() => this.editTile(tileData)}
              />
            </Tooltip>,
            <Tooltip
              title={
                tileData.userTypeClass === "borrowed"
                  ? "Remove from your vault"
                  : "Delete"
              }
            >
              <DeleteOutlined
                key="delete"
                onClick={() => this.deleteTile(tileData)}
              />
            </Tooltip>,
          ]
        : null;
    return draggable && !reactElement ? (
      <Tile
        key={key}
        // onMouseDown={() => this.tileClickHandler(tileData)}
        title={title || "Untitled"}
        tileUrl={tileUrl}
        cover={cover}
        headStyle={headStyle}
        actions={actions}
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
        actions={actions}
      />
    );
  }

  render() {
    const { tilesData } = this.state;
    return (
      <div className="tile-holder">
        {tilesData.length > 0 ? (
          <Row gutter={[16, 16]}>
            {tilesData.map((data) => this.renderTile(data))}
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
};

const Tile = (props) => {
  const {
    onClick,
    onMouseDown,
    title,
    hoverable,
    cover,
    headStyle,
    actions,
  } = props;

  return (
    <Col>
      <Card
        size="small"
        style={cardStyle}
        title={title}
        cover={cover}
        headStyle={headStyle}
        hoverable={hoverable}
        onClick={onClick}
        onMouseDown={onMouseDown}
        bodyStyle={{ display: "none" }}
        actions={actions}
      />
    </Col>
  );
};

export default withFirebase(VaultFloor);
