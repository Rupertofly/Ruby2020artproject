precision mediump float;

attribute vec2 position;
varying vec2 uv;

void main(){
  gl_Position=vec4(position,0.,1.);
  uv=.5+position/2.;
}