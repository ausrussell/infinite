import React, { Component } from 'react';
import { withFirebase } from "../Firebase";
import { Select } from 'antd';
import { CanvasTile } from './PreFab';
import { isEmpty } from 'lodash';
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import * as ROUTES from "../../constants/routes";


const { Option } = Select;

const defaultValue = "New Gallery"

const masterRefPath = 'users/0XHMilIweAghhLcophtPU4Ekv7D3'


class FloorplanDropdown extends Component {
    state = {
        floorplans: []
    };
    constructor(props) {
        super(props);
        this.dataList = {};
        console.log("FloorplanDropdown", props)
    }
    componentDidMount() {
        const masterOption = {
            refPath: masterRefPath + "/floorplans",
            callback: this.masterCallback,
            orderField: "title"
        }
        this.props.firebase.getList(masterOption)
    }

    componentWillUnmount() {
        this.props.firebase.detachGetUsersFloorplans();
    }

    masterCallback = snap => {
        const list = this.addToList(snap, "master");
        this.setState({ floorplans: list }, this.props.firebase.getUsersFloorplans(this.userCallback));
    }

    userCallback = snap => {
        if (!this.props.firebase.isCurator){
        const list = this.addToList(snap, "user");
        this.setState({ floorplans: list });}
    }

    dropdownCallback = id => {
        if (id === "new"){
this.props.history.push(ROUTES.PLANNER)
        } else{
        this.props.floorplanCallback(this.dataList[id])}
    }

    addToList = (data, cssClass) => {
        const list = this.state.floorplans;
        if (data) {
            data.forEach((childSnapshot) => {
                list.push(Object.assign(childSnapshot.val(), { key: childSnapshot.key, cssClass: cssClass }));
                this.dataList[childSnapshot.key] = Object.assign(childSnapshot.val(), { id: childSnapshot.key })
            });
        }
        return list;
    }

    getTiles = (data) => {
        const {cssClass, title, key} = data;
        console.log("cssClass",cssClass)
        return (<Option label={title} key={key} value={key} className={cssClass}><div>{title}</div><CanvasTile plan={data.data} /></Option>);
    }

    render() {
        const { floorplans } = this.state;
        return (
            <Select style={{ width: 180 }} listHeight={512} value={this.props.floorplan && isEmpty(this.props.galleryDesc) ? this.props.floorplan.id : defaultValue} onChange={(id) => this.dropdownCallback(id)}
            dropdownRender={menu => (<div>
                <div style={{fontWeight: 600, color:"#333333", marginLeft: 10}}>Select a floorplan</div>
                {menu}
                </div>
        )} >
                <Option label="New Floorplan" key="new" value="new" className="user floorplan-new-button"><div>New Floorplan</div><div>Make Your Own</div></Option>

                {floorplans.map(data => this.getTiles(data))}
            </Select>
        )
    }
}

export default compose(
    withRouter,
    withFirebase
  )(FloorplanDropdown);