import React, { Component, useState, useEffect } from 'react';
import { withFirebase } from "../Firebase";
import { Select } from 'antd';
import { CanvasTile } from './PreFab';
const { Option } = Select;

const List = ({ floorplans, floorplanCallback }) => {
    const getTiles = (data) => {
        console.log("data", data);
        return (<Option label={data.title} key={data.key} value={data.key}><div>{data.title}</div><CanvasTile plan={data.data} /></Option>);
    }
    return (<Select style={{ width: 220 }} optionLabelProp="label" placeholder="Select a Floorplan" onChange={floorplanCallback}>
        {floorplans.map(data => getTiles(data))}
    </Select>)
}

class FloorplanDropdown extends Component {
    state = {
        floorplans: []
    };
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.firebase.getUsersFloorplans(this.plansCallback);
    }
    componentWillUnmount() {
        this.props.firebase.detachGetUsersFloorplans();
    }

    dropdownCallback = id => {
        this.props.floorplanCallback(this.dataList[id])
    }

    plansCallback = (data) => {
        //this.props.floorplanCallback(this.dataList.id)
        console.log("data plans", data)
        const list = [];
        this.dataList = {};
        if (data) {
            data.forEach((childSnapshot) => {
                list.push(Object.assign(childSnapshot.val(), { key: childSnapshot.key }));
                this.dataList[childSnapshot.key] = childSnapshot.val()

            });
        }
        console.log("list", list)
        this.setState({ floorplans: list });
    }
    render() {
        return (
            <List floorplans={this.state.floorplans} floorplanCallback={(id) => this.dropdownCallback(id)} />
        )
    }
}



export default withFirebase(FloorplanDropdown)