import React, { useState } from "react";
import { Button } from "antd";
import { QuestionOutlined } from "@ant-design/icons";
import { withFirebase } from "../Firebase";

import VaultFloor from "../Elevator/VaultFloor";

import { Modal } from "antd";

const ImageSelector = (props) => {
  const [visible, setVisible] = useState(false);
console.log("ImageSelector props",props)
  const selectedCallback = (tile) => {
    console.log("tile", tile, props);
    setVisible(!visible);
    props.setGalleryImg(tile)
  };

  const vaultProps = {
    name: "Art",
    refPath: "users/" + props.firebase.currentUID + "/art",
    // level: 0,
    tileCallback: selectedCallback,
  };
  return (
    <div>
      <Modal
        title="Select Art"
        // bodyStyle={size}
        width={"75vw"}
        // closable
        bodyStyle={{ height: "75vh", overflow: "auto" }}
        visible={visible}
        onOk={() => setVisible(!visible)}
        onCancel={() => setVisible(!visible)}
        cancelButtonProps={{ style: { display: 'none' } }}
        // maskClosable
        zIndex={1060}
        mask
      >
        <VaultFloor
          {...vaultProps}
          // selectedTile={this.state.selectedTile}
        />
      </Modal>

      <Button onClick={() => setVisible(!visible)}>Select Image</Button>
    </div>
  );
};

export default withFirebase(ImageSelector);
