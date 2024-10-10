
import * as THREE from "three";
import { Vector3, Vector2, Color } from "three";

const Shaders = {
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
    upos: {
      uniforms: {},
      vertexShader: `varying vec3 col;
  
      void main() {
        col = vec3(uv, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
        `,
      fragmentShader: `
      varying vec3 col;
      void main(void)
      {
        gl_FragColor = vec4(col, 1.0);
      }`,
    },ToonShaderHatching : {
  
      uniforms: {
    
        'uDirLightPos':	{ value: new Vector3() },
        'uDirLightColor': { value: new Color( 0xeeeeee ) },
    
        'uAmbientLightColor': { value: new Color( 0x050505 ) },
    
        'uBaseColor': { value: new Color( 0xffffff ) },
        'uLineColor1': { value: new Color( 0x000000 ) },
        'uLineColor2': { value: new Color( 0x000000 ) },
        'uLineColor3': { value: new Color( 0x000000 ) },
        'uLineColor4': { value: new Color( 0x000000 ) }
    
      },
    
      vertexShader: /* glsl */`
    
        varying vec3 vNormal;
    
        void main() {
    
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          vNormal = normalize( normalMatrix * normal );
    
        }`,
    
      fragmentShader: /* glsl */`
    
        uniform vec3 uBaseColor;
        uniform vec3 uLineColor1;
        uniform vec3 uLineColor2;
        uniform vec3 uLineColor3;
        uniform vec3 uLineColor4;
    
        uniform vec3 uDirLightPos;
        uniform vec3 uDirLightColor;
    
        uniform vec3 uAmbientLightColor;
    
        varying vec3 vNormal;
    
        void main() {
    
          float directionalLightWeighting = max( dot( normalize(vNormal), uDirLightPos ), 0.0);
          vec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting;
    
          gl_FragColor = vec4( uBaseColor, 1.0 );
    
          if ( length(lightWeighting) < 1.00 ) {
    
            if ( mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {
    
              gl_FragColor = vec4( uLineColor1, 1.0 );
    
            }
    
          }
    
          if ( length(lightWeighting) < 0.75 ) {
    
            if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {
    
              gl_FragColor = vec4( uLineColor2, 1.0 );
    
            }
    
          }
    
          if ( length(lightWeighting) < 0.50 ) {
    
            if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {
    
              gl_FragColor = vec4( uLineColor3, 1.0 );
    
            }
    
          }
    
          if ( length(lightWeighting) < 0.3465 ) {
    
            if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {
    
              gl_FragColor = vec4( uLineColor4, 1.0 );
    
          }
    
          }
    
        }`
    
    },
    matrix: {
      uniforms: {
        colour: { type: "c", value: new THREE.Color(0x89ff89) },
        rows: { type: "f", value: 15 },
        glow: { type: "f", value: 1.0 },
        glowRadius: { type: "f", value: 1.0 },
        charDetail: { type: "f", value: 3.0 },
        speed: { type: "f", value: 10.0 },
        // iGlobalTime: { type: "f", value: clock.getDelta(), hidden: 1}
      },
      vertexShader: `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  } `,
      fragmentShader: `
     
  // Author @patriciogv - 2015
  // http://patriciogonzalezvivo.com
  // https://www.shadertoy.com/view/MlfXzN
  // Modified by 2Pha
  
  uniform vec3 colour;
  uniform float rows;
  uniform float glow;
  uniform float glowRadius;
  uniform float charDetail;
  uniform float speed;
  uniform float iTime;
  varying vec2 vUv;
  
  float random(in float x){
      return fract(sin(x)*43758.5453);
  }
  
  float random(in vec2 st){
      return fract(sin(dot(st.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }
  
  float randomChar(in vec2 outer,in vec2 inner){
      float grid = charDetail;
      vec2 margin = vec2(.2,.05);
      float seed = 23.;
      vec2 borders = step(margin,inner)*step(margin,1.-inner);
      return step(.5,random(outer*seed+floor(inner*grid))) * borders.x * borders.y;
  }
  
  vec3 matrix(in vec2 st){
      vec2 ipos = floor(st*rows)+vec2(1.,0.);
  
      ipos += vec2(.0,floor(iTime*speed*random(ipos.x)));
  
      vec2 fpos = fract(st*rows);
      vec2 center = (.5-fpos);
  
      float pct = random(ipos);
      float glowamount = (glowRadius-dot(center,center)*3.)*glow;
  
      return vec3(randomChar(ipos,fpos) * pct * glowamount) * colour;
  }
  
  void main() {
      gl_FragColor = vec4(matrix(vUv),1.0);
  }
    `,
    },
    FreiChenShader : {
  
      uniforms: {
    
        'tDiffuse': { value: null },
        'aspect': { value: new Vector2( 512, 512 ) }
      },
    
      vertexShader: /* glsl */`
    
        varying vec2 vUv;
    
        void main() {
    
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
        }`,
    
      fragmentShader: /* glsl */`
    
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
    
        uniform vec2 aspect;
    
    
        mat3 G[9];
    
        // hard coded matrix values!!!! as suggested in https://github.com/neilmendoza/ofxPostProcessing/blob/master/src/EdgePass.cpp#L45
    
        const mat3 g0 = mat3( 0.3535533845424652, 0, -0.3535533845424652, 0.5, 0, -0.5, 0.3535533845424652, 0, -0.3535533845424652 );
        const mat3 g1 = mat3( 0.3535533845424652, 0.5, 0.3535533845424652, 0, 0, 0, -0.3535533845424652, -0.5, -0.3535533845424652 );
        const mat3 g2 = mat3( 0, 0.3535533845424652, -0.5, -0.3535533845424652, 0, 0.3535533845424652, 0.5, -0.3535533845424652, 0 );
        const mat3 g3 = mat3( 0.5, -0.3535533845424652, 0, -0.3535533845424652, 0, 0.3535533845424652, 0, 0.3535533845424652, -0.5 );
        const mat3 g4 = mat3( 0, -0.5, 0, 0.5, 0, 0.5, 0, -0.5, 0 );
        const mat3 g5 = mat3( -0.5, 0, 0.5, 0, 0, 0, 0.5, 0, -0.5 );
        const mat3 g6 = mat3( 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.6666666865348816, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204 );
        const mat3 g7 = mat3( -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, 0.6666666865348816, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408 );
        const mat3 g8 = mat3( 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408 );
    
        void main(void)
        {
    
          G[0] = g0,
          G[1] = g1,
          G[2] = g2,
          G[3] = g3,
          G[4] = g4,
          G[5] = g5,
          G[6] = g6,
          G[7] = g7,
          G[8] = g8;
    
          mat3 I;
          float cnv[9];
          vec3 sampleX;
    
        /* fetch the 3x3 neighbourhood and use the RGB vector's length as intensity value */
          for (float i=0.0; i<3.0; i++) {
            for (float j=0.0; j<3.0; j++) {
              sampleX = texture2D(tDiffuse, vUv + (vec2( 1.0 / aspect.x, 1.0 / aspect.y )) * vec2(i-1.0,j-1.0) ).rgb;
              I[int(i)][int(j)] = length(sampleX);
            }
          }
    
        /* calculate the convolution values for all the masks */
          for (int i=0; i<9; i++) {
            float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);
            cnv[i] = dp3 * dp3;
          }
    
          float M = (cnv[0] + cnv[1]) + (cnv[2] + cnv[3]);
          float S = (cnv[4] + cnv[5]) + (cnv[6] + cnv[7]) + (cnv[8] + M);
    
          gl_FragColor = vec4(vec3(sqrt(M/S)), 1.0);
        }`
    
    }, marble: {
      //https://www.shadertoy.com/view/tsjSWh
      uniforms: {
        iTime: { type: "f", value: 0 },
        iResolution: { value: new THREE.Vector3() },
        color1: {
          type: "c",
          value: new THREE.Color(0xb84f3d),
        },
        color2: {
          type: "c",
          value: new THREE.Color(0x924433),
        },
        color3: {
          type: "c",
          value: new THREE.Color(0x9b4a2c),
        },
        color4: {
          type: "c",
          value: new THREE.Color(0x9d4028),
        },
        color5: {
          type: "c",
          value: new THREE.Color(0x924433),
        },
        color6: {
          type: "c",
          value: new THREE.Color(0xb84f3d),
        },
        color7: {
          type: "c",
          value: new THREE.Color(0x8f4f3b),
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
          st *= 2.08;
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
        float steps = 2.;
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
        vec2 uv = (fragCoord.xy );
        uv = 2. * uv.xy ;
      
        vec3 color = gradient(pattern(uv));
      
        fragColor = vec4(color, 1.0);
      }
      void main() {
        mainImage(gl_FragColor,  vUv);
      }`,
    },
  };

  export {Shaders}