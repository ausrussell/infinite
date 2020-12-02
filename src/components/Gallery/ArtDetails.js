import React, { useState } from "react";
import { Row, Col } from "antd";
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import rightsMap from '../Studio/RightsMap';


export const ArtDetails = ({ selectedArt }) => {
    console.log("ArtDetails", selectedArt);
    const [open, setOpen] = useState(true);
    const { title, artist, description, media, year, license } = selectedArt;

    const openDetails = () => {
        setOpen(!open)
    }

    return (<div className="art-details">
        <Row>
            <Col span={24}>
                {open ? <div className="art-details-card">
                    {<h3 className="art-details-title">{title || <span style={{ fontStyle: "italic" }}>Untitled</span>}<div className="art-details-down-button" onClick={openDetails} ><DownOutlined /></div></h3>}
                    {year && <p>{year}</p>}
                    {artist && <h4>{artist}</h4>}
                    {media && <h5>{media}</h5>}
                    {description && <div className="art-details-description">{description}</div>}
                    {license && <p>{rightsMap[license].icon}</p>}
                </div> :
                <div className="art-details-card-open-holder"><div className="art-details-down-button" onClick={openDetails} ><UpOutlined /></div></div>}
            </Col>
        </Row>
    </div>)
}

