import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withFirebase } from "../Firebase";

import { compose } from "recompose";

import { SignUpLink } from "../SignUp";
import { PasswordForgetLink } from "../PasswordForget";
import * as ROUTES from "../../constants/routes";
import { Form } from 'antd';
// import '@ant-design/compatible/assets/index.css';
import { Row, Col, Card, Input, Button } from "antd";

import { connect } from 'react-redux';

const SignInPage = () => (
  <Row style={{ marginTop: 32 }}>
    <Col span={12} offset={6} className="center-standard-form">

      <Card title="Sign In">
      <SignUpLink />

        <Card type="inner" title="Log in">
        <SignInForm />

        </Card>
        <PasswordForgetLink />
      </Card>
    </Col>
  </Row>
);


class SignInFormBase extends Component {
  state = {
    error:""
  }
  constructor(props){
super();
console.log("SignInFormBase props",props)
  }
  onSubmit = values => {

    const { email, password } = values;
console.log("SignInFormBase this.props",this.props)
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.props.history.push(ROUTES.LANDING);
      })
      .catch(error => {
        console.log("error with user submit", error)
        this.setState({error:"Email or password don't match our records"})
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
            Log In
          </Button>
        </Form.Item>
        {this.state.error && <p>Problem: {this.state.error}</p>}
      </Form>

    );
  }
}

const mapStateToProps = state =>{
  console.log("signin state",state)
  return  {
  authUser: state.sessionState.authUser,
}};

const SignInForm = compose(
  connect(mapStateToProps),
  withRouter,
  withFirebase
)(SignInFormBase);

export default SignInPage;

export { SignInForm };
