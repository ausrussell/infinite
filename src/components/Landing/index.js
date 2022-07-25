import React, { useState, useEffect } from "react";
import { compose } from "recompose";
import { connect } from "react-redux";

import { Row, Col } from "antd";
import PageTitle from "../Navigation/PageTitle";
import { HangarHelp } from "./HangarHelp";
import LandingAnimation from "./LandingAnimation";
import GallerySelect from "../Gallery/GallerySelect";


const Landing = ({location}) => {
  const [onPage, setOnPage] = useState(location.pathname === "/");

  useEffect(() => {
  console.log("Landing props", location.pathname);

    setOnPage(location.pathname === "/");
  }, [location.pathname]);


  return (
    <div style={{ display: onPage ? null : "none" }}>
      
      <PageTitle help={HangarHelp} />
      <LandingAnimation />
      <Row>
        <Col flex="0 1 420px" className="gallery-list-column">
          <GallerySelect />
        </Col>
      </Row>
    </div>
  );
};

export default Landing;

