#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float rect(vec2 tr, vec2 bl){
    //    float b=floor(st.y*10.);
    // float l=floor(st.x+.9);
    // float t=1.-floor(st.y+.1);
    // float r=1.-floor(st.x+.1);
  return 1.0;
}

void main(){
    vec2 st=gl_FragCoord.xy/u_resolution.xy;
    vec3 color=vec3(0.);
    
    // bottom-left
    // float pct  = smoothstep(0.0,st.x, 0.15);
    
    //    vec2 bl = smoothstep(vec2(0.0), vec2(0.1),st);
    //    vec2 tr = 1.0 - smoothstep(vec2(0.9), vec2(1.0),st);
    //  color = vec3(tr.x) * vec3(bl.y)* vec3(bl.x)* vec3(tr.y) ;
    
    float b=floor(st.y*10.);
    float l=floor(st.x+.9);
    float t=1.-floor(st.y+.1);
    float r=1.-floor(st.x+.1);
    color=vec3(t)*vec3(b)*vec3(r)*vec3(l);
    
    gl_FragColor=vec4(color,1.);
}