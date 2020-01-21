precision mediump float;

varying vec2 adjUV;
uniform vec2 resolution;
uniform sampler2D inputTexture;
uniform float kernal[9];
uniform float isVert;

void main(){
  vec2 xy=adjUV*vec2(640.,640.);
  vec3 outcol=vec3(0.);
  for(int i=0;i<9;i++){
    vec2 offset;
    if(isVert<.5){
      offset=vec2(float(i)-5.,0.);
    }else{
      offset=vec2(0.,float(i)-5.);
    }
    vec2 samplePos=(xy+offset)/vec2(640.,640.);
    vec3 sampleTexel=texture2D(inputTexture,samplePos).xyz*kernal[i];
    outcol=outcol+sampleTexel;
  }
  gl_FragColor=vec4(outcol,1.);
  
}