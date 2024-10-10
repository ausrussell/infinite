import React from "react";

import { Row, Col, Layout } from "antd";
import PageTitle from "../Navigation/PageTitle";
import { HangarHelp } from "./HangarHelp";
import LandingAnimationScene from "./LandingAnimationScene";
import GallerySelect from "../Gallery/GallerySelect";
import styled from "styled-components";
const { Header, Footer, Sider, Content } = Layout;
const Landing = ({ location }) => {
  return (
    <Layout>
      <PageTitle help={HangarHelp} />
      <GallerySelect />
      <LandingAnimationScene />
    </Layout>
  );
};

export default Landing;
