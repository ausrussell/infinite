import React, { useState } from "react";
import { Row, Col } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import rightsMap from "../Studio/RightsMap";
import { ReactComponent as Footsteps } from "../../svg/footsteps_icon.svg";

const borrowedDetails = (selectedArt, changeGallery) => {
  const {
    borrowed,
    borrowersComment,
    galleryTitle,
    ownerDisplayName,
  } = selectedArt;
  return (
    <div className="borrower-details-holder">
      <p onClick={() => changeGallery(selectedArt)}>
        <Footsteps className="footsteps-link" />
        Borrowed from <strong>{ownerDisplayName}</strong>'s gallery{" "}
        <strong>{galleryTitle}</strong> on <strong>{borrowed}</strong>
      </p>
      {borrowersComment && <p>{borrowersComment}</p>}
    </div>
  );
};

export const ArtDetails = ({ selectedArt, changeGallery }) => {
  console.log("ArtDetails", selectedArt);
  const [open, setOpen] = useState(true);
  const {
    title,
    artist,
    description,
    media,
    year,
    license,
    borrowed,
  } = selectedArt;

  const openDetails = () => {
    setOpen(!open);
  };

  return (
    <div className="art-details">
      <Row>
        <Col span={24}>
          {open ? (
            <div className="art-details-card">
              {
                <h3 className="art-details-title">
                  {title || (
                    <span style={{ fontStyle: "italic" }}>Untitled</span>
                  )}
                  <div
                    className="art-details-down-button"
                    onClick={openDetails}
                  >
                    <DownOutlined />
                  </div>
                </h3>
              }

              {borrowed && borrowedDetails(selectedArt, changeGallery)}
              {year && <p>{year}</p>}
              {artist && <h4>{artist}</h4>}
              {media && <h5>{media}</h5>}
              {description && (
                <div
                  className="art-details-description"
                  dangerouslySetInnerHTML={{
                    __html: description,
                  }}
                ></div>
              )}
              {license && (
                <p style={{ marginTop: 8, textAlign: "right" }}>
                  {rightsMap[license].icon}
                </p>
              )}
            </div>
          ) : (
            <div className="art-details-card-open-holder">
              <div className="art-details-down-button" onClick={openDetails}>
                <UpOutlined />
              </div>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export const ArtDetailsList = ({ selectedArt, changeGallery }) => {
  const {
    title,
    artist,
    description,
    media,
    year,
    // license,
    borrowersNumber,
    borrowersNames,
    borrowed,
  } = selectedArt;
  // console.log("borrowersNames", borrowersNames);
  // if (borrowersNames) );borrowersNames.map((item) => <p key={item}>{item}</p>)
  return (
    <div>
      <h3>{title || <span style={{ fontStyle: "italic" }}>Untitled</span>}</h3>
      {borrowed && borrowedDetails(selectedArt, changeGallery)}

      {year && <p>{year}</p>}
      {artist && <h4>{artist}</h4>}
      {media && <h5>{media}</h5>}
      {description && (
        <div
          className="art-details-description"
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        ></div>
      )}

      {borrowersNumber && (
        <p>
          Borrowed {borrowersNumber} time{borrowersNumber > 1 && "s"}{" "}
          <span style={{ fontStyle: "italic" }}>
            (
            {borrowersNames.map((item, index) => (
              <span key={`borrower${index}`}>
                {item}
                {index < borrowersNumber - 1 && ", "}
              </span>
            ))}
            )
          </span>
        </p>
      )}
    </div>
  );
};
