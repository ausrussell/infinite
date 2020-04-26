import React from 'react'
import { Row, Col, Typography} from 'antd';
import HelpModal from './HelpModal'

const { Title } = Typography;

const PageTitle = (props) => {
    return (
        <Row gutter={[26,16]} style={{margin: 16}}>
            <Col span={6}></Col>
            <Col span={12}style={{textAlign:"center"}}>
                <Title level={2} style={{color:"#ffffff"}}>{props.title}</Title>
            </Col>
            <Col span={6} style={{textAlign:"right"}}>
                <HelpModal content={props.help}/>
                </Col>
        </Row>
    )
}

export default PageTitle;