import React from 'react';

import { CopyrightOutlined } from '@ant-design/icons';

const ccIcon = (type) => {
    const href = "http://creativecommons.org/licenses/" + type + "/4.0/";
    const src = "https://i.creativecommons.org/l/" + type + "/4.0/88x31.png"
    return (<a rel="license" href={href}><img alt="Creative Commons License" style={{ borderWidth: 0 }} src={src} /></a>)
}

const rightsMap = {
    0: {
        text: "All rights reserved",
        icon: <CopyrightOutlined style={{ fontSize: 26, margin: "auto" }} />
    },
    1: {
        text: "Public Domain Work",
        icon: <CopyrightOutlined />
    },
    2: {
        text: "Public Domain Dedication (CC0)",
        icon: <CopyrightOutlined />
    },
    3: {
        text: "Attribution",
        icon: ccIcon("by")
    },
    4: {
        text: "Attribution-ShareAlike",
        icon: ccIcon("by-sa")
    },
    5: {
        text: "Attribution-NoDerivs",
        icon: ccIcon("by-nd")
    },
    6: {
        text: "Attribution-NonCommercial",
        icon: ccIcon("by-nc")
    },
    7: {
        text: "Attribution-NonCommercial-ShareAlike",
        icon: ccIcon("by-nc-sa")

    },
    8: {
        text: "Attribution-NonCommercial-NoDerivs",
        icon: ccIcon("by-nc-nd")
    }
}

export default rightsMap;