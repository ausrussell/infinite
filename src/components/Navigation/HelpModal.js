import React, { useState } from 'react';
import { Button } from 'antd';
import { QuestionOutlined } from '@ant-design/icons';

import { Modal } from 'antd'

const HelpModal = (props) => {
    const [visible, setVisible] = useState()
    const size = (props.content.size === "full") ? { height: "75vh", overflow: "auto" } : {};
    const onOk = () => {
        document.activeElement.blur();
        props.content.callback && props.content.callback();
        setVisible(false)}
    return (<div>
        <Modal
            title={props.content.title}
            bodyStyle={size}
            width={props.content.width || "75vw"}
            closable
            visible={visible}
            onOk={onOk}
            onCancel={onOk}
            cancelButtonProps={{ style: { display: 'none' } }}
            maskClosable
        >{props.content.content}
        </Modal>
        <Button shape="circle" type="primary" onClick={() => setVisible(!visible)} icon={<QuestionOutlined height={32} twoToneColor="#836fa9" />} />
    </div>)
}

export default HelpModal;