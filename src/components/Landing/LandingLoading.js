import React, { useState, useEffect, useRef } from "react";
import { Row, Col } from 'antd';



const logoSrc = "https://firebasestorage.googleapis.com/v0/b/infinite-a474a.appspot.com/o/images%2Flogo-letters-tagline.png?alt=media&token=cb1c760d-1f11-4f4e-b978-5179f4769ffa";
const radius = 22;
const duration = 9000;
const numberOfShards = 50;
const a = 100, b = 55; //major minor ellipse radii
const h = -a / 2, k = -b / 2;

const LandingLoading = ({ images }) => {
    let ref = useRef()

    const [shafts, setShafts] = useState([])
    const [dimensions, setDimensions] = useState();
    const [perspective, setPerspective] = useState({});

    useEffect(() => {
        const doSet = () => {
            console.log("images", images)
            let obj = images[images.length - 1]
            let artObj = {
                obj: obj,
                width: obj.width * 1.5,
                height: obj.height * 1.5
            }


            let s = shafts;
            s[images.length - 1].art = artObj
           setShafts(s)
            // console.log("shafts on art", shafts)
        }
        if (images.length && images.length < 12) doSet();


    }, [images, shafts]);


    useEffect(() => {
        const setShaftsArray = () => {
            let canvas = ref.current;
            // let context = canvas.getContext('2d');

            const width = canvas.offsetWidth
            const height = canvas.offsetHeight;
            setDimensions({ w: width, h: height });
            console.log("setDimensions", width, height)

            setPerspective({
                perspective: width * 0.8,
                perspective_center_x: width / 2,
                perspective_center_y: height / 2
            })

            canvas.width = width;
            canvas.height = height;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            let i;
            const items = [];

            for (i = 0; i < numberOfShards; i++) {
                const direction = (Math.random() > .5) ? 1 : -1
                const y = Math.random() * height * .4 - height * .1
                items.push({
                    x: Math.random() * width,
                    y: y,
                    z: Math.random() * width,
                    // gradient: gradient,
                    speed: direction * Math.random() * 2.5
                })

            }
            console.log("shafts", items)
            console.log("width", width, canvas)
            setShafts(items)
        }
        setShaftsArray()
    }, [])

    useEffect(() => {
        let canvas = ref.current;
        let context = canvas.getContext('2d');
        let requestId;
        let gradient;

        if (dimensions) {
            gradient = context.createLinearGradient(0, 0, dimensions.h, dimensions.w);
            gradient.addColorStop(0, "#37474f");
            gradient.addColorStop(.3 + (Math.random() / 5), "#eceff1");
            gradient.addColorStop(.5 + (Math.random() / 5), "#eceff1");
            gradient.addColorStop(1, "#37474f");
        }

        const straightTime = (timeFraction) => {
            return timeFraction;
        }

        const render = (progress) => {
            context.clearRect(0, 0, dimensions.w, canvas.height);

            shafts.forEach((item, i) => {
                let newx, newy;
                let newProgress = progress + item.speed / 5
                if (newProgress < 0) newProgress += 1;
                if (newProgress > 1) newProgress -= 1;

                if (newProgress > .5) {
                    newx = h - (((1 - (newProgress - .5) * 4) * a));//1>0 .5 ==1 , .6 ==.8
                    newy = k - (b / a) * Math.sqrt(Math.pow(a, 2) - Math.pow(newx - h, 2))
                }

                else {
                    newx = (h + (1 - newProgress * 4) * a);//1>0 .5 ==1 , .6 ==.8
                    newy = k + (b / a) * Math.sqrt(Math.pow(a, 2) - Math.pow(newx - h, 2))
                }

                context.fillStyle = gradient;
                newx *= item.speed
                const scaleProjected = perspective.perspective / (perspective.perspective + item.z + (newy * 2));

                // context.globalCompositeOperation = 'source-over';

                if (item.art) {
                    // debugger;
                    const polyx = item.x + newx + radius * 5 * scaleProjected, polyy = item.y + dimensions.h / 5 * scaleProjected
                    context.beginPath();
                    if (i < 6) {
                        context.moveTo(polyx, polyy);
                        context.lineTo(polyx + item.art.width * scaleProjected, polyy + item.art.height * scaleProjected * .2);
                        context.lineTo(polyx + item.art.width * scaleProjected, polyy + item.art.height * scaleProjected * .8);
                        context.lineTo(polyx, polyy + item.art.height * scaleProjected);
                        context.fill();
                        context.globalCompositeOperation = 'source-atop';

                    }
                    else if (i < 12) {
                        context.moveTo(polyx + item.art.width * scaleProjected, polyy);
                        context.lineTo(polyx + item.art.width * scaleProjected, polyy + item.art.height * scaleProjected);
                        context.lineTo(polyx, polyy + item.art.height * scaleProjected * .8);
                        context.lineTo(polyx, polyy + item.art.height * scaleProjected * .2);
                        context.fill();
                        context.globalCompositeOperation = 'source-atop';
                    }


                    context.drawImage(item.art.obj, polyx, polyy, item.art.width * scaleProjected, item.art.height * scaleProjected);

                }



                context.globalCompositeOperation = 'source-over';
                context.globalAlpha = context.globalAlpha = Math.abs(1 - item.z / dimensions.w);;

                context.fillRect(item.x + newx - radius, item.y + newy, radius * scaleProjected, dimensions.h * .8 * scaleProjected);// dimensions.h / 2 * scaleProjected
                // context.globalCompositeOperation = 'source-atop';
                // item.art && context.drawImage(item.art.obj, item.x + newx + radius * 5* scaleProjected , item.y + dimensions.h / 5 * scaleProjected, item.art.width * scaleProjected, item.art.height * scaleProjected);
                const textx = dimensions.w/2 -80, texty = dimensions.h - 50
                var textGradient = context.createLinearGradient(textx-300, texty, textx + 300,texty+10);
                textGradient.addColorStop("0","#d1c4e9");     
                // textGradient.addColorStop(Math.abs(progress - .1),"#d1c4e9");               

                textGradient.addColorStop(Math.abs(progress), "#4527a0");
                textGradient.addColorStop("1.0", "#d1c4e9");
                context.font = "40px system-ui";
                context.fillStyle = textGradient;
                context.fillText("Loading...", textx, texty);
            })
        }

        const animation = () => {

            let timing = straightTime;
            let start = performance.now();

            requestAnimationFrame(function animate(time) {
                // timeFraction goes from 0 to 1
                let timeFraction = (time - start) / duration;
                if (timeFraction > 1) timeFraction = 1;
                // calculate the current animation state
                // let progress = makeInOut(timing, timeFraction)
                let progress = timing(timeFraction)
                render(progress); // draw it
                if (timeFraction < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    start = performance.now();
                    requestAnimationFrame(animate);

                }

            });

        }
        dimensions && animation();

        return () => {
            cancelAnimationFrame(requestId);
        };

    }, [shafts, dimensions, perspective]);



    return <div className="landing-loading" >
        <Row className="title-row-no-title">
            <Col offset={6} span={12} style={{ textAlign: "center", zIndex:1 }}>
                <div className="title-logo-holder"><img src={logoSrc}
                    className="title-logo" alt="hangar logo" /></div>
            </Col>
        </Row>
        <canvas className="landing-loading-canvas" ref={ref} />
    </div>
}

export default LandingLoading;


