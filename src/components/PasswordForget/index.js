import React, { Component } from "react";
import { Link } from "react-router-dom";

import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import { MailOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button, Row, Col, Card } from "antd";
import "antd/dist/antd.css";

const PasswordForgetPage = () => (
  <Row>
    <Col span={12} offset={6} className="center-standard-form">
      <Card title="Resetting your password">
        <PasswordForgetForm />{" "}
      </Card>
    </Col>
  </Row>
);

const INITIAL_STATE = {
  email: "",
  error: null
};

class PasswordForgetFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    // this.props.form.validateFields();
    // debugger;
    this.props.firebase.auth.currentUser &&
      this.setState({ email: this.props.firebase.auth.currentUser.email });
  }

  onSubmit = event => {
    const { email } = this.state;
    debugger;
    this.props.firebase
      .doPasswordReset(email)
      .then(() => {
        debugger;
        this.setState({ ...INITIAL_STATE });
      })
      .catch(error => {
        debugger;
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, error } = this.state;
    //
    const isInvalid = email === "";
    //    <form onSubmit={this.onSubmit}>
    //
    // <input
    //   name="email"
    //   value={this.state.email}
    //   onChange={this.onChange}
    //   type="text"
    //   placeholder="Email Address"
    // />

    // Only show error after a field is touched.
    return (
      <Form layout="inline" onSubmit={this.onSubmit}>
        <Form.Item>
          <Input
            prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder="Email Address"
            value={email}
            name="email"
            onChange={this.onChange}
          />
        </Form.Item>
        <Form.Item>
          <Button disabled={isInvalid} type="primary" htmlType="submit">
            Reset My Password
          </Button>
        </Form.Item>
        {error && <p>{error.message}</p>}
      </Form>
    );
  }
}

const PasswordForgetLink = () => (
  <p>
    <Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link>
  </p>
);

export default PasswordForgetPage;

// const WrappedHorizontalLoginForm = Form.create({ name: 'horizontal_login' })(HorizontalLoginForm);
const PasswordForgetForm = withFirebase(
  Form.create({ name: "horizontal_login" })(PasswordForgetFormBase)
);

// const PasswordForgetForm = withFirebase(PasswordForgetFormBase);

export { PasswordForgetForm, PasswordForgetLink };
