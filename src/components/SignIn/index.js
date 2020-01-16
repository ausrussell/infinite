import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";

import { SignUpLink } from "../SignUp";
import { PasswordForgetLink } from "../PasswordForget";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import { Row, Col, Card, Form, Icon, Input, Button } from "antd";

const SignInPage = () => (
  <Row>
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

const INITIAL_STATE = {
  email: "",
  password: "",
  error: null
};

class SignInFormBase extends Component {
  constructor(props) {
    super(props);
    console.log("SignInFormBase props", props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { email, password } = this.state;

    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, password, error } = this.state;

    const isInvalid = password === "" || email === "";

    return (
      <Form layout="inline" onSubmit={this.onSubmit}>
        <Form.Item>
          <Input
            name="email"
            value={email}
            onChange={this.onChange}
            type="text"
            placeholder="Email Address"
          />
        </Form.Item>
        <Form.Item>
          <Input
            name="password"
            value={password}
            onChange={this.onChange}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Button disabled={isInvalid} type="primary" htmlType="submit">
            Sign In
          </Button>
        </Form.Item>
        {error && <p>{error.message}</p>}
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
