import React, { Component } from "react";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

export const RteAntWrapper = ({ value, onChange, desc }) => {
  console.log("value in wrapper", value);
  const triggerChange = (changedValue) => {
    console.log("triggerChange", changedValue);
    onChange({
      ...changedValue,
    });
  };

  return <Rte triggerChange={triggerChange} value={value} desc={desc} />;
};

class Rte extends Component {
  constructor(props) {
    super(props);
    console.log("value", this.props, this.props.value);
    const html = this.props.desc;
    let contentState;
    if (html) {
      const contentBlock = htmlToDraft(html);
      contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
    }
    this.state = {
      activeRteClass: "",
      editorState: contentState
        ? EditorState.createWithContent(contentState)
        : EditorState.createEmpty(),
    };
  }

  onBlur() {
    this.setState({ activeRteClass: "" });
    const rawContentState = convertToRaw(
      this.state.editorState.getCurrentContent()
    );
    const markup = draftToHtml(rawContentState);
    this.props.onChange(markup);
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  render() {
    const { editorState, activeRteClass } = this.state;
    return (
      <Editor
        toolbarClassName="demo-toolbar-custom"
        wrapperClassName="rte-wrapper"
        editorClassName={`rte-editor ${activeRteClass}`}
        editorState={editorState}
        onFocus={() => {
          this.setState({ activeRteClass: "rte-editor__focus" });
        }}
        onBlur={() => this.onBlur()}
        onEditorStateChange={this.onEditorStateChange}
      />
    );
  }
}

export default Rte;
