import * as THREE from "three";
// import { Vector2, Vector3 } from "three";
import { gsap } from "gsap";
import React, { useEffect, useRef } from "react";
import { withRouter } from "react-router-dom";

import ShardFocusScene from "./ShardFocusScene";
import moment from "moment";
import getColors from "get-image-colors";
import { ReactComponent as Footsteps } from "../../svg/footsteps_icon.svg";

const shardPos = [0, 1.25, 10.5]; //420
// const shardPos = [0, 2.5, 12]; //420
// 3/3,4.75/3
const rectWidth = 3 / 2;
const rectHeight = 4.75;
const holeStartHeight = rectHeight * 0.5;
const margin = 0.1;
const holeWidth = rectWidth * (1 - margin) - rectWidth * margin;
const holeEndHeight = holeStartHeight + holeWidth * (3 / 4.75); //rectHeight * 0.75;

const holeHeight = holeEndHeight - holeStartHeight;
// const originalShardWidth = 0.5;
// const originalShardHeight = 2.5;
const maxTitleHeight = 165;

const shades = {
  cheq: {
    uniforms: {
      color1: {
        type: "c",
        value: new THREE.Color(0xffffff),
      },
      color2: {
        type: "c",
        value: new THREE.Color(0x000000),
      },
      scale: {
        type: "f",
        value: 10,
        min: 1, // only used for dat.gui, not needed for production
        max: 100, // only used for dat.gui, not needed for production
      },
    },
    vertexShader: `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`,
    fragmentShader: `uniform vec3 color1;
uniform vec3 color2;
uniform float scale;
varying vec2 vUv;
void main() {
  vec2 center = -1.0 + 2.0 * vUv;
  vec2 uv = floor(center.xy * scale);
  if(mod(uv.x + uv.y, 2.0) > 0.5){
    gl_FragColor = vec4(color1, 1.0);
  }else{
    gl_FragColor = vec4(color2, 1.0);
  }
}`,
  },
  clouds: {
    // adapted from
    // 2D Clouds shader  @author drift
    // https://www.shadertoy.com/view/4tdSWr
    uniforms: {
      vUv: { value: new THREE.Vector2() },
      iResolution: { value: new THREE.Vector2() }, // resolution (in pixels)
      iTime: { value: 0.0 }, // shader playback time (in seconds)
    },
    vertexShader: `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`,
    fragmentShader: `
    varying vec2 vUv;
    uniform vec2 iResolution;
    uniform float iTime;
    const float cloudscale = 1.1;
    const float speed = 0.03;
    const float clouddark = 0.5;
    const float cloudlight = 0.3;
    const float cloudcover = 0.2;
    const float cloudalpha = 8.0;
    const float skytint = 0.5;
    const vec3 skycolour1 = vec3(0.2, 0.4, 0.6);
    const vec3 skycolour2 = vec3(0.4, 0.7, 1.0);
    
    const mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
    
    vec2 hash( vec2 p ) {
      p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
      return -1.0 + 2.0*fract(sin(p)*43758.5453123);
    }
    
    float noise( in vec2 p ) {
        const float K1 = 0.366025404; // (sqrt(3)-1)/2;
        const float K2 = 0.211324865; // (3-sqrt(3))/6;
      vec2 i = floor(p + (p.x+p.y)*K1);	
        vec2 a = p - i + (i.x+i.y)*K2;
        vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0); //vec2 of = 0.5 + 0.5*vec2(sign(a.x-a.y), sign(a.y-a.x));
        vec2 b = a - o + K2;
      vec2 c = a - 1.0 + 2.0*K2;
        vec3 h = max(0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
      vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
        return dot(n, vec3(70.0));	
    }
    
    float fbm(vec2 n) {
      float total = 0.0, amplitude = 0.1;
      for (int i = 0; i < 7; i++) {
        total += noise(n) * amplitude;
        n = m * n;
        amplitude *= 0.4;
      }
      return total;
    }
    
    // -----------------------------------------------
    
    void main(  ) {
      vec2 p = vUv.xy;
      vec2 uv = p*vec2(iResolution.x/iResolution.y,1.0);    
        float time = iTime * speed;
        float q = fbm(uv * cloudscale * 0.5);
        
        //ridged noise shape
      float r = 0.0;
      uv *= cloudscale;
        uv -= q - time;
        float weight = 0.8;
        for (int i=0; i<8; i++){
        r += abs(weight*noise( uv ));
            uv = m*uv + time;
        weight *= 0.7;
        }
        
        //noise shape
      float f = 0.0;
        uv = p*vec2(iResolution.x/iResolution.y,1.0);
      uv *= cloudscale;
        uv -= q - time;
        weight = 0.7;
        for (int i=0; i<8; i++){
        f += weight*noise( uv );
            uv = m*uv + time;
        weight *= 0.6;
        }
        
        f *= r + f;
        
        //noise colour
        float c = 0.0;
        time = iTime * speed * 2.0;
        uv = p*vec2(iResolution.x/iResolution.y,1.0);
      uv *= cloudscale*2.0;
        uv -= q - time;
        weight = 0.4;
        for (int i=0; i<7; i++){
        c += weight*noise( uv );
            uv = m*uv + time;
        weight *= 0.6;
        }
        
        //noise ridge colour
        float c1 = 0.0;
        time = iTime * speed * 3.0;
        uv = p*vec2(iResolution.x/iResolution.y,1.0);
      uv *= cloudscale*3.0;
        uv -= q - time;
        weight = 0.4;
        for (int i=0; i<7; i++){
        c1 += abs(weight*noise( uv ));
            uv = m*uv + time;
        weight *= 0.6;
        }
      
        c += c1;
        
        vec3 skycolour = mix(skycolour2, skycolour1, p.y);
        vec3 cloudcolour = vec3(1.1, 1.1, 0.9) * clamp((clouddark + cloudlight*c), 0.0, 1.0);
       
        f = cloudcover + cloudalpha*f*r;
        
        vec3 result = mix(skycolour, clamp(skytint * skycolour + cloudcolour, 0.0, 1.0), clamp(f + c, 0.0, 1.0));
        
        gl_FragColor = vec4( result, 1.0 );
      }`,
  },
  marble: {
    //https://www.shadertoy.com/view/tsjSWh
    uniforms: {
      iTime: { type: "f", value: 0 },
      iResolution: { value: new THREE.Vector3() },
      color1: {
        type: "c",
        value: new THREE.Color(0xffffff),
      },
      color2: {
        type: "c",
        value: new THREE.Color(0x000000),
      },
      color3: {
        type: "c",
        value: new THREE.Color(0x000000),
      },
      color4: {
        type: "c",
        value: new THREE.Color(0x000000),
      },
      color5: {
        type: "c",
        value: new THREE.Color(0x000000),
      },
      color6: {
        type: "c",
        value: new THREE.Color(0x000000),
      },
      color7: {
        type: "c",
        value: new THREE.Color(0x000000),
      },
    },
    vertexShader: `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`,
    fragmentShader: `
    uniform float iTime;
uniform vec3 iResolution;
varying vec2 vUv;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
uniform vec3 color5;
uniform vec3 color6;
uniform vec3 color7;
    
    // Get random value
    float random(in vec2 st)
    {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    float noise (in vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
    
        // Four corners in 2D of a tile
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
    
        vec2 u = f * f * (3.0 - 2.0 * f);
    
        return mix(a, b, u.x) +
                (c - a)* u.y * (1.0 - u.x) +
                (d - b) * u.x * u.y;
    }
    
    #define OCTAVES 6
    float fbm(in vec2 st) {
      float value = 0.;
      float amp = .55;
      float freq = 0.;
    
      for(int i = 0; i < OCTAVES; i++) {
        value += amp * noise(st);
        st *= 1.8;
        amp *= .35;
      }
      return value;
    }
    
    float pattern(in vec2 p) {
      float f = 0.;
      vec2 q = vec2(
        fbm(p + iTime * .2 + vec2(0.)),
        fbm(p + iTime * .3 + vec2(2.4, 4.8))
      );
      vec2 r = vec2(
        fbm(q + iTime * .3 + 4. * q + vec2(3., 9.)),
        fbm(q + iTime * .2 + 8. * q + vec2(2.4, 8.4))
      );
      f = fbm(p + r * 2. + iTime * .09);
      return f;
    }
    
    vec3 gradient(float v) {
      float steps = 7.;
      float step = 1. / steps;
      vec3 col = color2;
      // v: 0 ~ 1/7
      if(v >= 0. && v < step) {
        col = mix(color6, color4, v * steps);
      // v: 1/7 ~ 2/7
      } else if (v >= step && v < step * 2.) {
        col = mix(color4, color1, (v - step) * steps);
      // v: 2/7 ~ 3/7
      } else if (v >= step * 2. && v < step * 3.) {
        col = mix(color1, color7, (v - step * 2.) * steps);
      // v: 3/7 ~ 4/7
      } else if (v >= step * 3. && v < step * 4.) {
        col = mix(color7, color5, (v - step * 3.) * steps);
      // v: 4/7 ~ 5/7
      } else if (v >= step * 4. && v < step * 5.) {
        col = mix(color5, color3, (v - step * 4.) * steps);
      // v: 5/7 ~ 6/7
      } else if (v >= step * 5. && v < step * 6.) {
        col = mix(color3, color2, (v - step * 5.) * steps);
      }
      return col;
    }
    
    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
      // fix aspect uv
      vec2 uv = (fragCoord.xy - .5 );
      uv = 2. * uv.xy ;
    
      vec3 color = gradient(pattern(uv));
    
      fragColor = vec4(color, 1.0);
    }
    void main() {
      mainImage(gl_FragColor,  vUv);
    }`,
  },
};

const useShader = "marble";

const ShardFocus = ({
  scene,
  setInsetScene,
  renderer,
  camera,
  onInsetGalleryLoaded,
  focusGallery,
  shardsFocusAnimSet,
  history,
}) => {
  // const [group] = useState(new THREE.Group());
  // const [measuredFontSize, setMesuredFontSize] = useState(30);

  const titlePaneRef = useRef(null);
  const titlePaneTextRef = useRef(null);
  const titlePaneBuiltRef = useRef(null);
  const titlePaneByRef = useRef(null);
  const measureRef = useRef(null);
  const descriptionRef = useRef(null);
  const thumbImageHolderRef = useRef();
  const thumbImage = useRef();
  const anim = useRef(null);
  const clock = useRef(null);
  const enterRef = useRef();

  const group = useRef(null);
  useEffect(() => {
    // console.log("ShardFocus", scene, setInsetScene, renderer, camera);

    const setShard = () => {
      group.current = new THREE.Group();
      console.log("rectWidth", rectWidth, "rectHeight", rectHeight);
      const rectShape = new THREE.Shape()
        .moveTo(0, 0)
        .lineTo(rectWidth, 0)
        .lineTo(rectWidth, rectHeight)
        .lineTo(0, rectHeight)
        .lineTo(0, 0);
      // Hole

      const hole = new THREE.Shape()
        .moveTo(rectWidth * margin, holeStartHeight)
        .lineTo(rectWidth * (1 - margin), holeStartHeight)
        .lineTo(rectWidth * (1 - margin), holeEndHeight)
        .lineTo(rectWidth * margin, holeEndHeight)
        .lineTo(rectWidth * margin, holeStartHeight);
      rectShape.holes.push(hole);

      const extrudeSettings = {
        depth: 3.5,
        bevelEnabled: true,
        bevelSegments: 10,
        steps: 10,
        bevelSize: 0.05,
        bevelThickness: 0.03,
      };
      const geometry = new THREE.ExtrudeBufferGeometry(
        rectShape,
        extrudeSettings
      );

      // const geometry = new THREE.ShapeGeometry(
      //   rectShape
      // );

      geometry.center();
      // const material = new THREE.MeshPhongMaterial({
      //   color: 0xff0000,
      //   transparent: true,
      //   opacity: 1, //0.70,
      // });
      let material;
      if (useShader) {
        const { uniforms, vertexShader, fragmentShader } = shades[useShader];
        clock.current = new THREE.Clock(1);

        uniforms.iTime = {
          type: "f",
          value: clock.current.getElapsedTime(),
          hidden: 1,
        };
        material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
        });
      } else {
        material = new THREE.MeshPhongMaterial({
          color: 0xff0000,
          transparent: true,
          opacity: 1, //0.70,
        });
      }
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = "wall";
      group.current.add(mesh); ///**** */

      group.current.position.set(...shardPos);
      const holeCoverGeometry = new THREE.PlaneGeometry(
        holeWidth,
        holeHeight - 0.05
      );
      const holeCover = new THREE.Mesh(
        holeCoverGeometry, //(rectWidth, rectHeight),
        new THREE.MeshPhongMaterial({
          color: 0xff0000,
          shininess: 15,
          transparent: true,
          opacity: 0.1,
        })
      );
      holeCover.name = "holeCover";
      holeCover.translateY(holeStartHeight - rectHeight / 2 + holeHeight / 2);
      holeCover.translateZ(1.45);
      // this.holeCover.translateZ(-40 )
      group.current.add(holeCover);
      // group.visible = false;
      console.log("group.current", group.current);
      // group.current.scale.set(
      //   1 / (rectWidth / originalShardWidth),
      //   1 / (rectHeight / originalShardHeight),
      //   1
      // );
      scene.add(group.current);
    };
    if (scene) setShard();
  }, [scene]);

  useEffect(() => {
    const insetScene = () => {
      const canvas = renderer.domElement;
      const getScreenFrom3 = (vector) => {
        // `renderer` is a THREE.WebGLRenderer
        console.log("getScreenFrom3", vector);
        vector.project(camera); // `camera` is a THREE.PerspectiveCamera

        vector.x = Math.round(
          (0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio)
        );
        vector.y =
          canvas.height / window.devicePixelRatio -
          Math.round(
            (0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio)
          );
        return [vector.x, vector.y];
      };

      const boundingBox = new THREE.Box3();

      console.log("holeCover", group.current.getObjectByName("holeCover"));
      boundingBox.setFromObject(group.current.getObjectByName("holeCover"));
      const low = boundingBox.min;
      const high = boundingBox.max;
      const holeBottomLeftVp = getScreenFrom3(low);
      const holeTopRightWorld = getScreenFrom3(high);
      console.log("high", high, "low".low);
      let w = high.x - low.x;
      let h = high.y - low.y;
      console.log("inset w h", w, h);
      const insetSceneViewport = [
        holeBottomLeftVp[0],
        holeBottomLeftVp[1],
        w,
        h,
      ];

      // console.log("insetScene ", insetSceneViewport);
      setInsetScene(insetSceneViewport);
      // title
      const titlePaneMargin = 0;
      const paneStyle = {
        left: holeBottomLeftVp[0] + titlePaneMargin + "px",
        top: 60 + "px",
        width: w - titlePaneMargin * 2 + "px",
        height: h - titlePaneMargin * 2 + "px",
      };

      Object.keys(paneStyle).forEach((item) => {
        titlePaneRef.current.style[item] = paneStyle[item];
      });
      //description
      paneStyle.top =
        canvas.height / window.devicePixelRatio -
        holeBottomLeftVp[1] +
        // h / 2 +
        60 +
        "px";
      paneStyle.height = h - titlePaneMargin * 2 + "px";

      Object.keys(paneStyle).forEach((item) => {
        descriptionRef.current.style[item] = paneStyle[item];
      });
      //enter
      enterRef.current.style.top =
        canvas.height / window.devicePixelRatio -
        holeBottomLeftVp[1] -
        20 +
        "px";
      enterRef.current.style.left =
        holeBottomLeftVp[0] + w / 2 - enterRef.current.offsetWidth / 2 + "px";
      //thumb
      thumbImage.current.onload = () => {
        thumbImageHolderRef.current.style.left =
          -(thumbImage.current.offsetWidth / 2) + "px";
        thumbImageHolderRef.current.style.bottom =
          -(thumbImage.current.offsetHeight / 2) + "px";
      };
      thumbImage.current.src = focusGallery.item.galleryImg.thumb;
    };

    const setTitle = (title) => {
      titlePaneTextRef.current.innerText = title;
      titlePaneRef.current.style.visibility = "visible";
      titlePaneTextRef.current.style.fontSize = maxTitleHeight + 1 + "px";
      while (
        measureRef.current.getBoundingClientRect().height > maxTitleHeight ||
        measureRef.current.getBoundingClientRect().width >
          titlePaneRef.offsetWidth
      ) {
        let reduced =
          parseInt(titlePaneTextRef.current.style["font-size"]) - 1 + "px";
        titlePaneTextRef.current.style.fontSize = reduced;
      }
    };

    const setPane = () => {
      const { title, userDisplayName, updateTime, description } =
        focusGallery.item;
      setTitle(title);
      if (updateTime) {
        titlePaneBuiltRef.current.innerText = moment(updateTime, [
          "X",
          "x",
          "MMMM Do YYYY, h:mm:ss a",
        ]).format("MMMM Do, YYYY");
      }
      if (userDisplayName) titlePaneByRef.current.innerText = userDisplayName;

      console.log("setPane focusGallery.item", focusGallery.item);
      if (description) {
        descriptionRef.current.innerHTML = description;
        descriptionRef.current.style.visibility = "visible";
      }
      enterRef.current.style.visibility = "visible";
      const wall = group.current.getObjectByName("wall");
      console.log("wall.material.uniforms", wall.material.uniforms);
      console.log("colors setup ", focusGallery.item.galleryImg.thumb);
      getColors(focusGallery.item.galleryImg.thumb, { count: 7 }).then(
        (colors) => {
          // `colors` is an array of color objects
          console.log("colors", colors);

          switch (useShader) {
            case "cheq":
              wall.material.uniforms.color1.value = new THREE.Color(
                ...colors[0].gl()
              );
              wall.material.uniforms.color2.value = new THREE.Color(
                ...colors[1].gl()
              );
              break;
            case "marble":
              console.log("marble");
              wall.material.uniforms.iResolution.value.set(1, 1, 1);
              for (let i = 0; i < 5; i++) {
                wall.material.uniforms[`color${i + 1}`].value = new THREE.Color(
                  ...colors[i].gl()
                );
              }
              break;
            case "clouds":
              wall.material.uniforms.iResolution.value.set(1000, 1000);
              wall.material.uniforms.iTime.value =
                clock.current.getElapsedTime();

              break;

            // default:
            //   return;
          }

          group.current.visible = true;
        }
      );
    };

    const show = () => {
      console.log("shardfocus show", focusGallery);
      // makeTl();
      if (shardsFocusAnimSet) {
        console.log(
          "shardfocus show shardsFocusAnimSet",
          group.current.visible
        );

        setPane();
        // makeTl();

        insetScene();
      } else {
        console.log(
          "shardfocus hide shardsFocusAnimSet",
          group.current.visible
        );

        hide();
      }
    };
    const hide = () => {
      titlePaneRef.current.style.visibility =
        descriptionRef.current.style.visibility =
        enterRef.current.style.visibility =
          "hidden";
      descriptionRef.current.innerHTML = titlePaneTextRef.current.innerText =
        "";
      group.current.visible = false;
      group.current.getObjectByName("wall").scale.x = 1;
      group.current.getObjectByName("wall").scale.y = 1;
      group.current.getObjectByName("holeCover").scale.x = 1;
      group.current.getObjectByName("holeCover").scale.y = 1;
    };
    const curveUpdate = (place) => {
      // console.log("shardFocus curveUpdate",place, group.current.position)
      // group.current.position.set(0, 2, 8.65 + place.position * 3);
      group.current.getObjectByName("wall").scale.x = place.position * 2;
      // setPane();
      // insetScene();
    };

    const tweenComplete = () => {
      console.log("shardFocus tweenComplete");
    };

    const makeTl = () => {
      var tl = gsap.timeline();
      //   const position = this.clock.getDelta();
      const place = { position: 0 };

      tl.fromTo(
        place,
        { position: 0 },
        {
          duration: 3,
          position: 1,
          ease: "none",
          callbackScope: this,
          onUpdateParams: [place],
          onUpdate: curveUpdate,
          onComplete: tweenComplete,
        }
      );
      return tl;
    };
    const canvas = renderer.domElement;

    const animate = () => {
      // console.log("clock.current.getElapsedTime()",clock.current.getElapsedTime())
      wall.material.uniforms.iTime.value = clock.current.getElapsedTime();
      anim.current = requestAnimationFrame(animate);
      // console.log("animating ",newUniforms.iGlobalTime.value)
    };

    if (group.current) {
      var wall = group?.current.getObjectByName("wall");

      if (focusGallery.index !== null) {
        cancelAnimationFrame(anim.current);
        show();
        animate();
        window.addEventListener("resize", insetScene, false);
      } else {
        window.removeEventListener("resize", insetScene, false);
        hide();
      }
    }
    return () => {
      cancelAnimationFrame(anim.current);
      window.removeEventListener("resize", insetScene, false);
    };
  }, [
    focusGallery,
    focusGallery.index,
    camera,
    renderer,
    group,
    setInsetScene,
    shardsFocusAnimSet,
  ]);

  const handleOnInsetGalleryLoaded = (data) => {
    onInsetGalleryLoaded(data);
  };
  const tweenComplete = () => {
    console.log("shardFocus tweenComplete");
    history.push({ pathname: "/Gallery/" + focusGallery.item.nameEncoded });
    cancelAnimationFrame(anim.current);
  };

  const getInsetScene = () => {
    const canvas = renderer.domElement;
    const getScreenFrom3 = (vector) => {
      // `renderer` is a THREE.WebGLRenderer
      console.log("getScreenFrom3", vector);
      vector.project(camera); // `camera` is a THREE.PerspectiveCamera

      vector.x = Math.round(
        (0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio)
      );
      vector.y =
        canvas.height / window.devicePixelRatio -
        Math.round(
          (0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio)
        );
      return [vector.x, vector.y];
    };

    const boundingBox = new THREE.Box3();

    console.log("holeCover", group.current.getObjectByName("holeCover"));
    boundingBox.setFromObject(group.current.getObjectByName("holeCover"));
    const low = boundingBox.min;
    const high = boundingBox.max;
    const holeBottomLeftVp = getScreenFrom3(low);
    const holeTopRightWorld = getScreenFrom3(high);
    console.log("high", high, "low".low);
    let w = high.x - low.x;
    let h = high.y - low.y;
    console.log("inset w h", w, h);
    const insetSceneViewport = [holeBottomLeftVp[0], holeBottomLeftVp[1], w, h];

    console.log("insetScene ", insetSceneViewport);
    // setInsetScene(insetSceneViewport);
    return { x: holeBottomLeftVp[0], y: holeBottomLeftVp[1], w, h };
  };
  const curveUpdate = (insetScene) => {
    console.log("insetScene", insetScene);
    // console.log("shardFocus curveUpdate",place, group.current.position)
    // group.current.position.set(0, 2, 8.65 + place.position * 3);
    // group.current.getObjectByName("wall").scale.x = 1 - place.position;
    // group.current.getObjectByName("wall").scale.y = 1 - place.position;
    // group.current.getObjectByName("holeCover").scale.x = 1 + place.position * 3;
    // group.current.getObjectByName("holeCover").scale.y = 1 + place.position * 2;

    // setPane();
    // insetScene();
    const {x,y,w,h} = insetScene;
    setInsetScene([x,y,w,h]);

  };

  const makeTl = () => {
    var tl = gsap.timeline();
    //   const position = this.clock.getDelta();
    // const place = { position: 0 };
    const insetScene = getInsetScene();
    console.log("start tween with insetScene", insetScene);
    tl.to(insetScene, {
      x: 0,
      y: 0,
      w: window.innerWidth,
      h: window.innerHeight,
      duration: 3,
      position: 1,
      ease: "none",
      callbackScope: this,
      onUpdateParams: [insetScene],
      onUpdate: curveUpdate,
      onComplete: tweenComplete,
    });
    return tl;
  };

  const doEnter = () => {
    // console.log("do enter",focusGallery.item.nameEncoded);

    makeTl();
    titlePaneRef.current.style.visibility =
      descriptionRef.current.style.visibility =
      enterRef.current.style.visibility =
        "hidden";
    descriptionRef.current.innerHTML = titlePaneTextRef.current.innerText = "";
  };

  return (
    <div style={{ position: "absolute", perspective: 500, width: "100%" }}>
      <div id="glass-title-pane" ref={titlePaneRef}>
        <div ref={measureRef}>
          <div id="glass-title-pane-text" ref={titlePaneTextRef}></div>
        </div>
        <div className="glass-title-pane-bottom">
          <div ref={titlePaneByRef} className="glass-title-pane-by"></div>
          <div ref={titlePaneBuiltRef} className="glass-title-pane-built"></div>
        </div>
        <div
          className="glass-title-pane-bottom-image"
          ref={thumbImageHolderRef}
        >
          <img ref={thumbImage}></img>
        </div>
      </div>

      {focusGallery.index && (
        <ShardFocusScene
          focusGallery={focusGallery}
          onInsetGalleryLoaded={handleOnInsetGalleryLoaded}
        ></ShardFocusScene>
      )}
      <div className="glass-title-pane-enter" ref={enterRef} onClick={doEnter}>
        <div className="glass-title-pane-enter-text">ENTER</div>
        <Footsteps className="footsteps-link" />
      </div>
      <div
        className="glass-description-pane-description"
        ref={descriptionRef}
      ></div>
    </div>
  );
};

export default withRouter(ShardFocus);
