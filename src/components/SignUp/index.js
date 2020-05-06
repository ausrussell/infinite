import React from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import { Form, Row, Col, Card, Input, Button } from "antd";



const SignUpPage = () => {
  return (
  <div>
    <SignUpForm />
  </div>
);}


const SignUpFormBase = (props) => {
  console.log("SignUpFormBase props",props)
  const [form] = Form.useForm();
  const onSubmit = values => {
    console.log("values",values)
    props.firebase
      .doCreateUserWithEmailAndPassword(values) //email, passwordOne,
      .then(authUser => props.firebase.setupNewUser(authUser, values))
      .then(() => {
        props.history.push(ROUTES.LANDING);
      })
  };

    return (
      <Row style={{marginTop:32}}>
      <Col span={12} offset={6} className="center-standard-form">
      <Card title="Join In">
      <Form layout="vertical" onFinish={onSubmit} name="registration" form={form}>
      <Form.Item name="username"
          label="Username"
          rules={[{ required: true, message: 'Please enter a username' }]}
          >
        <Input placeholder="Full Name" />
</Form.Item>
<Form.Item name="displayName"
          label="Display Name"

          rules={[{ required: true, message: 'Please input your display name', whitespace: true }]}>
        <Input placeholder="Display Name" />
        </Form.Item>

  <Form.Item name="email"
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
          
        <Input placeholder="Email Address" />
        </Form.Item>
        <Form.Item name="password"
          
          label="Password"

          rules={[{ required: true, message: 'Please enter a password' }]}
>
        <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item name="passwordTwo"
          label="Confirm Password"
          placeholder="Confirm Password"
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('The two passwords that you entered do not match!');
              },
            }),
          ]}
>

        <Input.Password />
        </Form.Item>
        <Form.Item>

        <Button type="primary" htmlType="submit">
          Sign Up
        </Button>
        </Form.Item>

      </Form>
      </Card>
      </Col>
      </Row>
    );
  }


const SignUpForm = compose(
  withRouter,
  withFirebase
)(SignUpFormBase);

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

export default SignUpPage;

export { SignUpForm, SignUpLink };
