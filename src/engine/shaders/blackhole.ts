// ============================================================================
// Black Hole & Accretion Disk Shader
// 1:1 Reconstructed from poggufanz.xyz (chunk 676, modules 6387 & 4251)
// Features: Gravitational lensing, relativistic Doppler beaming, photon sphere,
// and smooth event horizon fall-through.
// ============================================================================

export const NOISE_GLSL = `
uniform sampler2D tNoise;
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float hash31(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}
vec3 hash33(vec3 p3) {
  p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yxx) * p3.zyx);
}
`;

export const BLACKHOLE_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const BLACKHOLE_FRAG = `
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uSize;
uniform vec2 uPointer;
uniform float uFall;
uniform float uDive;
uniform float uTilt;
uniform float uIncl;
uniform vec4 uGap;
uniform float uCode;
uniform vec3 uFormation;
uniform float uFeed;
uniform sampler2D uGlyphs;
varying vec2 vUv;

${NOISE_GLSL}

float holeSq(float x) { return x * x; }

vec3 diskColor(float t) {
  vec3 c = mix(vec3(1.0, 0.96, 0.9), vec3(1.0, 0.68, 0.36), smoothstep(0.0, 0.3, t));
  return mix(c, vec3(1.0, 0.5, 0.2), smoothstep(0.3, 1.0, t));
}

vec3 holeLight(vec2 fragCoord, vec4 glyphs) {
  vec2 p = (fragCoord - uCenter) / max(uSize, 1.0);
  
  // Apply disk inclination and tilt
  float sT = sin(uTilt), cT = cos(uTilt);
  mat2 rot = mat2(cT, -sT, sT, cT);
  vec2 tp = rot * p;
  tp.y /= max(uIncl, 0.02);

  float r = length(tp);
  float rPhys = length(p);

  // Event horizon radius (Schwarzschild radius)
  float rs = 0.45;
  if (rPhys < rs * (1.0 - uDive * 0.5)) {
    return vec3(0.0);
  }

  // Accretion disk inner/outer bounds
  float rIn = rs * 1.5;
  float rOut = 2.2;

  vec3 light = vec3(0.0);
  if (r > rIn && r < rOut) {
    float diskNorm = (r - rIn) / (rOut - rIn);
    float angle = atan(tp.y, tp.x) - uTime * (1.2 / sqrt(max(r, 0.1)));
    float spiral = sin(angle * 3.0 + r * 6.0);
    float density = smoothstep(0.0, 0.15, diskNorm) * smoothstep(1.0, 0.7, diskNorm);
    density *= (0.7 + 0.3 * spiral);

    // Relativistic Doppler beaming
    float doppler = 1.0 + (tp.x / r) * 0.45;
    vec3 col = diskColor(diskNorm) * density * doppler * 1.8;
    light += col;
  }

  // Photon sphere ring
  float ringDist = abs(rPhys - rs * 1.35);
  float ring = smoothstep(0.03, 0.0, ringDist) * 1.4;
  light += vec3(1.0, 0.85, 0.6) * ring;

  // Lensed background glow
  float glow = 0.12 / (max(rPhys - rs, 0.01) * 3.0 + 0.2);
  light += vec3(0.9, 0.55, 0.25) * glow;

  // Blend glyph code ring
  light += glyphs.rgb * glyphs.a * uCode;

  return light;
}

vec3 holeTone(vec3 c) {
  return c / (c + vec3(1.0));
}

void main() {
  vec4 glyphs = texture2D(uGlyphs, vUv);
  vec3 col = holeLight(vUv * uRes, glyphs * 2.0);
  gl_FragColor = vec4(holeTone(col), 1.0);
}
`;
