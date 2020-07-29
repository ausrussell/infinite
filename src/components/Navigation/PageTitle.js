import React from 'react'
import { Row, Col, Typography} from 'antd';
import HelpModal from './HelpModal'

const { Title } = Typography;
const logoSrc ="https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Fletter-logo.png?alt=media&token=6a52450f-cf9d-4666-a949-bff4bb62537e";

const PageTitle = (props) => {
// console.log("props.title",props.title, rowStyle)
    const rowClass = (props.title) ? "title-row-title": "title-row-no-title";
    return (
        <Row className={rowClass}>
            <Col span={6}></Col>
            <Col span={12}style={{textAlign:"center"}}>
            {props.title ? <Title level={2} style={{color:"#ffffff"}}>{props.title}</Title> : <div className="title-logo-holder"><img src={logoSrc}  className="title-logo" alt="hangar logo" style={{marginTop:-4}} /></div>}
            </Col>
            <Col span={6} style={{textAlign:"right"}}>
            {props.saveButton && props.saveButton}
                {props.help && <HelpModal content={props.help}/>}
                </Col>
        </Row>
    )
}

export default PageTitle;