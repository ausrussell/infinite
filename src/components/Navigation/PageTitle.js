import React from 'react'
import { Row, Col, Typography} from 'antd';
import HelpModal from './HelpModal'

const { Title } = Typography;

const PageTitle = (props) => {
    return (
        <Row style={{margin:16, marginBottom: 0}}>
            <Col span={6}></Col>
            <Col span={12}style={{textAlign:"center"}}>
                <Title level={2} style={{color:"#ffffff"}}>{props.title}</Title>
            </Col>
            <Col span={6} style={{textAlign:"right"}}>
            {props.saveButton && props.saveButton}
                {props.help && <HelpModal content={props.help}/>}
                </Col>
        </Row>
    )
}

export default PageTitle;