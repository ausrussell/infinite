import React, { Component } from "react";
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from 'draftjs-to-html';

export const RteAntWrapper = ({ value = {}, onChange }) => {
  const triggerChange = (changedValue) => {
    onChange({
      ...changedValue,
    });
  };

  return <Rte triggerChange={triggerChange} value={value} />
}

class Rte extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeRteClass: "",
      editorState: EditorState.createEmpty()
    };
  }

  onBlur(){
    this.setState({ activeRteClass: "" });
    console.log("this.state.editorState",this.state.editorState);
    console.log("this.props",this.props)
    const rawContentState = convertToRaw(this.state.editorState.getCurrentContent());
    const markup = draftToHtml(
      rawContentState
    );
    this.props.onChange(markup);
  }

  onEditorStateChange = (editorState) => {
    
    this.setState({
      editorState,
    });
  };

  render() {
    const { activeRteClass } = this.state;
    return (
        <Editor
          toolbarClassName="demo-toolbar-custom"
          wrapperClassName="rte-wrapper"
          editorClassName={`rte-editor ${activeRteClass}`}
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
