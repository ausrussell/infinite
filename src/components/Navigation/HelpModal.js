import React, { useState } from 'react';
import { Button } from 'antd';
import { QuestionOutlined } from '@ant-design/icons';

import { Modal } from 'antd'

const HelpModal = (props) => {
    const info = () => { Modal.info({
        title:props.content.title,
        content: props.content.content,
        width:"75vw"
        })
    }
    return (<Button shape="circle" type="primary" onClick={info} icon={<QuestionOutlined height={32} twoToneColor="#836fa9" />} />)
}

export default HelpModal;