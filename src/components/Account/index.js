import React from "react";

import { PasswordForgetForm } from "../PasswordForget";
import PasswordChangeForm from "../PasswordChange";
import { withAuthorization } from "../Session";
import { Row, Col, Card } from "antd";

const AccountPage = () => (
  <div>
    <h1>Account Page</h1>

    <Row>
      <Col span={12} offset={6} className="center-standard-form">
        <Card title="Account Management">
          <Card type="inner" title="Reset Password">
            <PasswordForgetForm />
          </Card>
          <Card type="inner" title="Change Password">
            <PasswordChangeForm />
          </Card>
        </Card>
      </Col>
    </Row>
  </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(AccountPage);
