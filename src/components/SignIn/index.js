import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";

import { SignUpLink } from "../SignUp";
import { PasswordForgetLink } from "../PasswordForget";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import { Form } from 'antd';
// import '@ant-design/compatible/assets/index.css';
import { Row, Col, Card, Input, Button } from "antd";

const SignInPage = () => (
  <Row style={{ marginTop: 32 }}>
    <Col span={12} offset={6} className="center-standard-form">
      <Card title="Sign In">
        <Card type="inner" title="Name and Email">
          <SignInForm />
          <SignUpLink />
        </Card>
        <Card type="inner" title="Forgot?">
          <PasswordForgetLink />
        </Card>
      </Card>
    </Col>
  </Row>
);


class SignInFormBase extends Component {
  onSubmit = values => {

    const { email, password } = values;

    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.props.history.push(ROUTES.LANDING);
      })
      .catch(error => {
        console.log("error with user submit", error)
      });

  };

  render() {
    return (
      <Form layout="vertical" onFinish={this.onSubmit}>
        <Form.Item
          name="email"
          type="text"
          label="Email"
          rules={[
            {
              type: 'email',
              message: 'The input is not a valid E-mail'
            },
            {
              required: true,
              message: 'Please input your E-mail!',
            },
          ]}>
          <Input
            placeholder="Email Address"

          />
        </Form.Item>
        <Form.Item label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter a password' }]}>
          <Input
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Sign In
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

const SignInForm = compose(
  withRouter,
  withFirebase
)(SignInFormBase);

export default SignInPage;

export { SignInForm };
