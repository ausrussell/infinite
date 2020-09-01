import React, { Component } from "react";
import { Link } from "react-router-dom";

import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import { MailOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import { Input, Button, Row, Col, Card } from "antd";
// import { FormInstance } from 'antd/lib/form';
import { LoadingOutlined, ExclamationCircleOutlined, CheckOutlined } from '@ant-design/icons';

//This file needs checking for antd Form


const PasswordForgetPage = () => (
  <Row style={{ marginTop: 32 }}>
    <Col span={12} offset={6} className="center-standard-form">
      <Card title="Reset your password">
        <PasswordForgetForm />
      </Card>
    </Col>
  </Row>
);

const INITIAL_STATE = {
  email: "",
  error: null,
  submitting:null,
  success: null
};

class PasswordForgetFormBase extends Component {

  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
    // debugger;
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    // this.props.form.validateFields();
    // debugger;
    // this.props.firebase.auth.currentUser &&
    //   this.setState({ email: this.props.firebase.auth.currentUser.email });
  }

  onSubmit = ({ email }) => {
    this.setState({ submitting:true });
    this.props.firebase
      .doPasswordReset(email)
      .then(() => {
        this.setState({ submitting:false });

        this.setState({ success: true });
      })
      .catch(error => {
        this.setState({ submitting:false });
        this.setState({ error });
      });
  };

  render() {
    const { email, error, submitting, success } = this.state;

    // Only show error after a field is touched.
    return (
      <div>{submitting ? <h3><LoadingOutlined spin /> Submitting reset request...</h3> :
      <Form layout="inline" onFinish={this.onSubmit}>
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
            prefix={<MailOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
            placeholder="Email Address"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Send me email to reset
          </Button>
        </Form.Item>
        {success && <h4><CheckOutlined /> Great! Please check your email!</h4>}
        {error && <h4><ExclamationCircleOutlined /> {error.message}</h4>}
      </Form>}
      </div>
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
//.create({ name: "horizontal_login" }
const PasswordForgetForm = withFirebase(
  PasswordForgetFormBase
);

// const PasswordForgetForm = withFirebase(PasswordForgetFormBase);

export { PasswordForgetForm, PasswordForgetLink };
