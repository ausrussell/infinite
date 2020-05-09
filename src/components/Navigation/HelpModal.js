import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { QuestionOutlined } from '@ant-design/icons';

import { Modal } from 'antd'
import TweenOne from 'rc-tween-one';

const rotateYAnimation = {
    rotateY: 1080,
    duration: 800
}

const HelpModal = (props) => {
    const idFromTitle = () => encodeURIComponent(props.content.title)

    const [visible, setVisible] = useState(props.content.showOnce && !localStorage.getItem(idFromTitle() + 'alreadySeen'))
    const [animation, setAnimation] = useState()

    const size = (props.content.size === "full") ? { height: "75vh", overflow: "auto" } : {};
    const onOk = () => {
        document.activeElement.blur();
        props.content.callback && props.content.callback();
        setVisible(false)
        if (props.content.showOnce && !localStorage.getItem(idFromTitle() + 'alreadySeen')) {
            setAnimation(rotateYAnimation);
            localStorage.setItem(idFromTitle() + 'alreadySeen', true)
        }
    }

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
        <div style={{ width: 32, marginLeft: "auto" }}>

            <TweenOne
                animation={animation} >
                <Button shape="circle" type="primary" onClick={() => setVisible(!visible)} icon={<QuestionOutlined height={32} twoToneColor="#836fa9" />} />
            </TweenOne>
        </div>

    </div>)
}

export default HelpModal;