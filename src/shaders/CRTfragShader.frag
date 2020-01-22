precision mediump float;
varying vec2 uv;
uniform sampler2D inputTexture;
float rand(vec2 co){
  return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);
}
void main(){
  vec3 col=texture2D(inputTexture,uv).r>.5?vec3(.99,.75,.81):vec3(.01,.48,.55);
  col=mod(gl_FragCoord.y,6.)<1.+rand(vec2(col.b,distance(uv,vec2(.5))))?col*.4:col;
  float cenMult=(smoothstep(.45,.9,distance(uv,vec2(.5))));
  col=col-vec3(.4)*cenMult;
  gl_FragColor=vec4(col,1);
}