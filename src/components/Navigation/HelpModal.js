import React, { useState } from 'react';
import { Button } from 'antd';
import { QuestionOutlined } from '@ant-design/icons';

import { Modal } from 'antd'

const HelpModal = (props) => {
    const [visible, setVisible] = useState()
    const size = (props.content.size === "full") ? { height: "75vh", overflow: "auto" } : {}
    return (<div>
        <Modal
            title={props.content.title}
            bodyStyle={size}
            width={props.content.width || "75vw"}
            closable
            visible={visible}
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            cancelButtonProps={{ style: { display: 'none' } }}
        >{props.content.content}
        </Modal>
        <Button shape="circle" type="primary" onClick={() => setVisible(!visible)} icon={<QuestionOutlined height={32} twoToneColor="#836fa9" />} />
    </div>)
}

export default HelpModal;