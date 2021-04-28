import React, { Component } from 'react';
import { withFirebase } from "../Firebase";
// import { Select } from 'antd';
import { CanvasTile } from './PreFab';
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import * as ROUTES from "../../constants/routes";
import { Card, Row, Col} from "antd";

// const { Option } = Select;
// const defaultValue = "New Gallery"

const masterRefPath = 'users/0XHMilIweAghhLcophtPU4Ekv7D3'


class FloorplanDropdown extends Component {
    state = {
        floorplans: []
    };
    constructor(props) {
        super(props);
        this.dataList = {};
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
        this.props.setFloorplans(list);
    }

    userCallback = snap => {
        if (!this.props.firebase.isCurator) {
            const list = this.addToList(snap, "user");
            this.setState({ floorplans: list });
        }
    }

    dropdownCallback = id => {
        if (id === "new") {
            this.props.history.push(ROUTES.PLANNER)
        } else {
            this.props.floorplanCallback(this.dataList[id])
        }
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
        const { cssClass, title, key } = data;
        const className = cssClass + " header-tile"
        return (<Col key={key}>
            <Card.Grid size="small" title={title} className={className} onClick={() => this.dropdownCallback(key)}>
                <div>{title}</div>
                <CanvasTile plan={data.data} />
            </Card.Grid>
        </Col>);
    }
    render() {
        const { floorplans } = this.state;

        return (<div className="header-tile-outer-holder">
            <div className="header-tile-title">Select a floorplan</div>
            <div className="header-tile-holder">
                <Row span={24} style={{ width: "100%" }}  justify="space-around" align="middle" gutter={[16, 16]}>
                    {floorplans.map(data => this.getTiles(data))}
                </Row>
            </div>
        </div>
        )
    }
}

export default compose(
    withRouter,
    withFirebase
)(FloorplanDropdown);