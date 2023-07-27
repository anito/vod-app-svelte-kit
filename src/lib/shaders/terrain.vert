vec3 mod289(vec3 x){
  return x-floor(x*(1./289.))*289.;
}
vec2 mod289(vec2 x){
  return x-floor(x*(1./289.))*289.;
}

vec3 permute(vec3 x){
  return mod289(((x*34.)+1.)*x);
}

float snoise(vec2 v)
{
  // const vec4 C=vec4((3.0-sqrt(3.0))/6.0,0.5*(sqrt(3.0)-1.0),-1.0 + 2.0 * C.x,1.0 / 41.0
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  // First corner
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  
  // Other corners
  vec2 i1;
  
  i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  
  vec4 x12=x0.xyxy+C.xxzz;
  x12.xy-=i1;
  
  // Permutations
  i=mod289(i);// Avoid truncation effects in permutation
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))
  +i.x+vec3(0.,i1.x,1.));
  
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m;
  m=m*m;
  
  // Gradients: 41 points uniformly over a line, mapped onto a diamond.
  // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
  
  vec3 x=2.*fract(p*C.www)-1.;
  vec3 h=abs(x)-.5;
  vec3 ox=floor(x+.5);
  vec3 a0=x-ox;
  
  // Normalise gradients implicitly by scaling m
  // Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  
  // Compute final noise value at P
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}

uniform float time;
uniform float waveDefinition;
uniform float waveAmplitude;

varying vec3 vPosition;
varying vec2 vUv;

void main(void){
  float newZ=snoise(uv)+snoise((uv*waveDefinition)+time*.05);
  newZ*=waveAmplitude;
  
  vec3 newPosition=vec3(position.xy,position.z+newZ);
  vPosition=newPosition;
  vUv=uv;
  
  gl_Position=projectionMatrix*modelViewMatrix*vec4(newPosition,1.);
}