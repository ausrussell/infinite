import React, { Component } from 'react';
import { withFirebase } from "../Firebase";
import { Select } from 'antd';
import { CanvasTile } from './PreFab';
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import * as ROUTES from "../../constants/routes";
import { Card, Row, Col} from "antd";

const { Option } = Select;
// const defaultValue = "New Gallery"

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

    getTilesX = (data) => {
        const { cssClass, title, key } = data;
        console.log("cssClass", cssClass)
        return (<Option label={title} key={key} value={key} className={cssClass}><div>{title}</div><CanvasTile plan={data.data} /></Option>);
    }


    getTiles = (data) => {
        const { cssClass, title, key } = data;
        console.log("getTiles", cssClass)

        const className = cssClass + " header-tile"
        return (<Col key={key}>
            <Card.Grid size="small" title={title} className={className} onClick={() => this.dropdownCallback(key)}>
                <div>{title}</div>
                <CanvasTile plan={data.data} />
            </Card.Grid>
        </Col>);
    }
    // const { cssClass, title, key } = data;
    // const cardStyle = {
    //     height: 140,
    //     width: 140,
    // }
    // console.log("cssClass", cssClass);
    // console.log("getTiles data", data)
    // const cover = <CanvasTile plan={data.plan} />
    // return (<Col key={key}>


    //     <Card title={title} value={key} className={cssClass} cover={cover} />


    // </Col>
    // );
    render() {
        //this.props.floorplan && isEmpty(this.props.galleryDesc) ? this.props.floorplan.id : 
        const { floorplans } = this.state;

        // <div className="header-tile-title">Select a floorplan</div>
        // <div className="header-tile-holder">
        //         </div>

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
    //https://www.facebook.com/bluematters/posts/1616683061857795?comment_id=1616686125190822

    // render() {
    //     //this.props.floorplan && isEmpty(this.props.galleryDesc) ? this.props.floorplan.id : 
    //     const { floorplans } = this.state;
    //     return (
    //         <Select style={{ width: 180 }} listHeight={512} defaultValue={this.props.floorplan && isEmpty(this.props.galleryDesc) ? this.props.floorplan.id : defaultValue} onChange={(id) => this.dropdownCallback(id)}
    //             dropdownRender={menu => (<div>
    //                 <div style={{ fontWeight: 600, color: "#333333", marginLeft: 10 }}>Select a floorplan</div>
    //                 {menu}
    //             </div>
    //             )} >
    //             <Option label="New Floorplan" key="new" value="new" className="user floorplan-new-button"><div>New Floorplan</div><div>Make Your Own</div></Option>
    //             {floorplans.map(data => this.getTiles(data))}
    //         </Select>
    //     )
    // }
}

export default compose(
    withRouter,
    withFirebase
)(FloorplanDropdown);