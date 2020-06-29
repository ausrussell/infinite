import React from "react";
import { Row, Col } from "antd";



export const ArtDetails = ({ selectedArt }) => {
    console.log("ArtDetails", selectedArt);
    const { title, artist, description, media, year } = selectedArt;

    return (            <div className="art-details">
    <Row>
        <Col span={12} offset={6}>
        <div className="art-details-card">
                {<h3>{title || <span style={{ fontStyle: "italic" }}>Untitled</span>}</h3>}
                {year && <p>{year}</p>}

                {artist && <h4>{artist}</h4>}
                {media && <h5>{media}</h5>}
                {description && <p>{description}</p>}
            </div>
        </Col>
    </Row>
    </div>)
}

