import React, { Component } from 'react';
import { withFirebase } from "../Firebase";
import { Select } from 'antd';
import { CanvasTile } from './PreFab';
import { isEmpty } from 'lodash';

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
        console.log("masterCallback", snap.val())
        const list = this.addToList(snap, "master");
        this.setState({ floorplans: list }, this.props.firebase.getUsersFloorplans(this.userCallback));
    }

    userCallback = snap => {
        if (!this.props.firebase.isCurator){
        const list = this.addToList(snap, "user");
        this.setState({ floorplans: list });}
    }

    dropdownCallback = id => {
        this.props.floorplanCallback(this.dataList[id])
    }

    addToList = (data, cssClass) => {
        console.log("add to floorplan list")
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
        console.log("getTiles",data,this.state.floorplans )
        const {cssClass, title, key} = data;
        return (<Option label={title} key={key} value={key} className={cssClass}><div>{title}</div><CanvasTile plan={data.data} /></Option>);
    }

    render() {
        const { floorplans } = this.state;
        return (
            <Select style={{ width: 180 }} value={this.props.floorplan && isEmpty(this.props.galleryDesc) ? this.props.floorplan.id : defaultValue} onChange={(id) => this.dropdownCallback(id)}>
                {floorplans.map(data => this.getTiles(data))}
            </Select>
        )
    }
}



export default withFirebase(FloorplanDropdown)