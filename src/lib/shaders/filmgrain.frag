uniform float amount;
uniform sampler2D tDiffuse;
varying vec2 vUv;

float random(vec2 p)
{
  vec2 K1=vec2(
    23.14069263277926,// e^pi (Gelfond's constant)
    2.665144142690225// 2^sqrt(2) (Gelfondâ€“Schneider constant)
  );
  return fract(cos(dot(p,K1))*121345.6789);
}

void main(){
  vec4 color=vec4(.3,.35,.4,.0025);// color here: r, g, b, a.
  // Note the alpha doesn't work as you might expect. I recommend leaving it
  color.r*=random(vUv*(amount+12.123));
  color.g*=random(vUv*(amount+11.913));
  color.b*=random(vUv*(amount+8.19));
  color.a*=random(vUv*(amount*.0001));
  // *= vec4() * 0.2; // old intensity
  gl_FragColor=color;
}