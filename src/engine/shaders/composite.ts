// ============================================================================
// Multi-Pass Compositor Fragment Shader
// 1:1 Reconstructed from poggufanz.xyz (chunk 676)
// Features: Spectral chromatic aberration, ACES tone-mapping, radial warp smear,
// tear seam transitions, horizon gravitational lens, and film grain.
// ============================================================================

export const COMPOSITE_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const COMPOSITE_FRAG = `
uniform sampler2D tA;
uniform sampler2D tB;
uniform float uHasB;
uniform float uCut;       // next section top, 0 (top) .. 1 (bottom of viewport)
uniform float uTime;
uniform vec2 uRes;
uniform float uVel;
uniform float uIntro;
uniform float uBootFx;    // worker handoff: no sample offsets until the plain light is on screen
uniform vec2 uOrigin;     // intro centre, uv: the loader's singularity
uniform float uDetail;
uniform float uHorizon;   // -1 off; 0..1 falling from the black hole into the tesseract
uniform vec2 uHole;       // horizon centre, uv
uniform float uHoleR;     // horizon radius, in screen heights
varying vec2 vUv;

#define WARP_TAPS 16

float h1(float n){ return fract(sin(n * 12.9898) * 43758.5453); }
float h2(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float n1(float x){ float i = floor(x); float f = fract(x); return mix(h1(i), h1(i + 1.0), f * f * (3.0 - 2.0 * f)); }

uniform float uWarp;        // trip progress, -1 when idle
uniform vec2 uWarpCenter;   // vanishing point, uv
uniform float uWarpZoom;    // scene magnification about the vanishing point
uniform float uWarpBlur;    // radial smear length, fraction of the distance to the centre
uniform vec3 uWarpRing;     // ring radius px, softness px, lens strength
uniform vec2 uWarpShake;    // uv offset

float warpIgn(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

vec3 warpScene(sampler2D t, vec2 uv){
  vec2 c = uWarpCenter;
  vec2 d = uv - c;
  float dist = length(d * uRes);
  float lens = 0.0;
  if (uWarpRing.x > 0.0) {
    float rz = (dist - uWarpRing.x) / (uWarpRing.y * 2.5 + 1.0);
    lens = uWarpRing.z * exp(-rz * rz);
  }
  vec2 o = d * (1.0 - lens) / max(uWarpZoom, 0.001);
  vec2 shake = uWarpShake;
  float jitter = warpIgn(gl_FragCoord.xy);
  vec3 acc = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < WARP_TAPS; i++) {
    float s = (float(i) + jitter) / float(WARP_TAPS);
    float k = s * uWarpBlur;
    float weight = 1.0 - s * 0.6;
    acc.r += texture2D(t, c + shake + o * (1.0 - k * 1.07)).r * weight;
    acc.g += texture2D(t, c + shake + o * (1.0 - k)).g * weight;
    acc.b += texture2D(t, c + shake + o * (1.0 - k * 0.93)).b * weight;
    total += weight;
  }
  return acc / total * (1.0 + uWarpBlur * 0.35);
}

// Interleaved Gradient Noise for film grain
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

// Chromatic aberration
vec3 aberr(sampler2D t, vec2 uv, float amt){
  vec2 dir = vec2(0.0, amt) + (uv - 0.5) * amt * 0.6;
  return vec3(texture2D(t, uv + dir).r, texture2D(t, uv).g, texture2D(t, uv - dir).b);
}

// Five-tap spectral fringe
vec3 spectral(sampler2D t, vec2 uv, vec2 d){
  vec3 c = texture2D(t, uv - d).rgb * vec3(0.0, 0.0, 0.55);
  c += texture2D(t, uv - d * 0.5).rgb * vec3(0.0, 0.25, 0.45);
  c += texture2D(t, uv).rgb * vec3(0.3, 0.5, 0.0);
  c += texture2D(t, uv + d * 0.5).rgb * vec3(0.45, 0.25, 0.0);
  c += texture2D(t, uv + d).rgb * vec3(0.25, 0.0, 0.0);
  return c;
}

vec3 sceneTex(sampler2D t, vec2 uv, float amt){
  return uWarp >= 0.0 ? warpScene(t, uv) : aberr(t, uv, amt);
}

float tear(vec2 uv, float pos, float aspect, float seed){
  float yTop = 1.0 - uv.y;
  float wave = (n1(uv.x * 5.0 + uTime * 0.25 + seed) - 0.5) * 0.03;
  float edge = pos + (uv.x - 0.5) * 0.09 * aspect + wave;
  return yTop - edge;
}

// ACES Tone-mapping
vec3 ACESFilm(vec3 x) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main(){
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float px = 1.0 / uRes.y;
  float vel = clamp(uVel, 0.0, 1.0);
  float baseCA = (0.0003 + vel * 0.0065) * uBootFx;
  vec3 col;

  if (uHorizon >= 0.0) {
    vec2 q = (uv - uHole) * vec2(aspect, 1.0);
    float r = length(q);
    float R = max(uHoleR, 1e-4);
    float aa = 1.5 / uRes.y;
    float inside = 1.0 - smoothstep(R * 0.97 - aa, R * 0.97 + aa, r);
    float relax = smoothstep(0.3, 1.0, uHorizon);
    float rn = clamp(r / R, 0.0, 1.0);
    vec2 portal = 0.5 + (uv - uHole) * (0.42 / R);
    portal += (uv - uHole) * (0.42 / R) * rn * rn * 0.35;
    vec2 tuv = mix(portal, uv, relax);
    vec3 colA = sceneTex(tA, uv, baseCA);
    vec3 colB = sceneTex(tB, tuv, baseCA);
    col = mix(colA, colB, inside);
  } else if (uHasB > 0.5 && uCut < 1.0) {
    float dist = tear(uv, uCut, aspect, 0.0);
    float aa = 2.0 * px;
    float mixB = smoothstep(-aa, aa, dist);
    vec3 colA = sceneTex(tA, uv, baseCA);
    vec3 colB = sceneTex(tB, uv, baseCA);
    col = mix(colA, colB, mixB);
  } else {
    col = sceneTex(tA, uv, baseCA);
  }

  // Dithering & Grain
  float grain = (ign(gl_FragCoord.xy + uTime * 60.0) - 0.5) * (1.5 / 255.0);
  col += vec3(grain);

  // ACES Tone-mapping
  col = ACESFilm(col);

  gl_FragColor = vec4(col, 1.0);
}
`;
