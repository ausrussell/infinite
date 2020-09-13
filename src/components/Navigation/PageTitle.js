import React, {useState, useCallback} from 'react'
import { Row, Col, Typography } from 'antd';
import HelpModal from './HelpModal'


const { Title } = Typography;
const logoSrc = "https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Fletter-logo.png?alt=media&token=6a52450f-cf9d-4666-a949-bff4bb62537e";

const maxTitleHeight = 40;

const PageTitle = (props) => {
    // console.log("props.title",props.title, rowStyle)
    const [measuredFontSize, setMesuredFontSize] = useState(30)
    const rowClass = (props.title) ? "title-row-title" : "title-row-no-title";
    const titleStyle = {
        color: "#ffffff",
        fontSize: measuredFontSize
    }

    const measureRef = useCallback((title) => {
        console.log("measureRef",measureRef)
        if (title){
            if (title && title.getBoundingClientRect().height > maxTitleHeight) {
                console.log("title.getBoundingClientRect().height",title.getBoundingClientRect().height)
                let reduced = measuredFontSize - 1
                setMesuredFontSize(reduced);
            }  
        }
    },[measuredFontSize])
    return (
        <Row className={rowClass}>
            <Col span={24} style={{ textAlign: "center" }}>
                    {props.title ? <Title level={2} style={titleStyle} className="page-title-2"><div ref={measureRef}>{props.title}</div></Title> : <div className="title-logo-holder"><img src={logoSrc} className="title-logo" alt="hangar logo" style={{ marginTop: -4 }} /></div>}
                
                {props.help && <HelpModal content={props.help} />}
            </Col>
        </Row>
    )
}

export default PageTitle;