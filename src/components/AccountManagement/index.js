import React, { Component } from "react";
import { withAuthentication } from "../Session";
import { withFirebase } from "../Firebase";
import { compose } from 'recompose';
import * as qs from 'qs';
import { PasswordForgetLink } from "../PasswordForget";

import { Card, Row, Col, Button, Form, Input } from "antd";

import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';


class AccountManagementBase extends Component {
    state = {
        checking: true,
        accountEmail: "",
        codeVerified: false,
        error: "",
        actionCode: "",
        signedIn: false
    }
    componentDidMount() {
        console.log("AccountManagement this.props.match.params ", this.props);

        var mode = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).mode
        // Get the one-time code from the query parameter.
        var actionCode = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).oobCode
        // (Optional) Get the continue URL from the query parameter if available.
        var continueUrl = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).continueUrl
        // (Optional) Get the language code if available.
        // var lang = getParameterByName('lang') || 'en';
        console.log("mode,actionCode,continueUrl", mode, actionCode, continueUrl)
        // Handle the user management action.
        this.setState({ actionCode: actionCode })
        switch (mode) {
            case 'resetPassword':
                // Display reset password handler and UI.
                this.handleResetPassword(actionCode, continueUrl);
                break;
            // case 'recoverEmail':
            //     // Display email recovery handler and UI.
            //     handleRecoverEmail(auth, actionCode, lang);
            //     break;
            // case 'verifyEmail':
            //     // Display email verification handler and UI.
            //     handleVerifyEmail(auth, actionCode, continueUrl, lang);
            //     break;
            default:
            // Error: invalid mode.
        }

    }

    handleResetPassword(actionCode) {
        this.props.firebase.verifyPasswordResetCode(actionCode)
            .then((email) => {
                this.setState({ checking: false, codeVerified: true, accountEmail: email });
                console.log("email ", email)
            }).catch((error) => {
                console.log("error", error.message)
                this.setState({ checking: false, error: error.message })
            });
    }

    onSubmit = ({ password }) => {
        this.props.firebase.confirmPasswordReset(this.state.actionCode, password)
            .then((resp) => {
                console.log("resp", resp);
                this.props.firebase.doSignInWithEmailAndPassword(this.state.accountEmail, password)
                    .then(() => this.setState({ signedIn: true }))
            })
            .catch(error => {
                console.log("error", error.message)
                this.setState({ error: error.message })
            })
    }

    render() {
        const { codeVerified, error, checking, accountEmail, signedIn } = this.state;
        return <Row style={{ marginTop: 32 }}>
            <Col span={12} offset={6} className="center-standard-form">
                {signedIn ? <Card title="Password has been Reset"><h2>You're signed in! Enjoy building and exploring galleries!</h2></Card> :
                    <Card title="Reset Password">
                        {checking && <h3><LoadingOutlined spin /> Checking link...</h3>}

                        {codeVerified && (<Form layout="inline" onFinish={this.onSubmit}>
                            <p>Resetting password for account: <strong>{accountEmail}</strong></p>
                            <Form.Item label="Password"
                                name="password"
                                rules={[{ required: true, message: 'Please enter a password' }]}>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                />
                            </Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit New Password
                        </Button>
                        </Form>)}

                        {error && <div><h4><ExclamationCircleOutlined /> {error}</h4>
                            <p>Click below to try again </p><PasswordForgetLink /></div>}
                    </Card>}
            </Col>
        </Row>
    }
}

const AccountManagement = compose(
    withAuthentication,
    withFirebase,
)(AccountManagementBase);

export default AccountManagement;