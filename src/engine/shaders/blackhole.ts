// ============================================================================
// Authentic Black Hole & Accretion Disk Shader
// Extracted & reconstructed directly from poggufanz.xyz (chunk 676, modules 463 & 6387)
// Features: Relativistic Doppler beaming, Einstein gravitational lensing,
// photon sphere flaring, lensed far-side halo, and display-referred ACES tone mapping.
// ============================================================================

export const NOISE_GLSL = `
#define HASH_NOISE
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

float vnoise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float vnoise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i), hash31(i + vec3(1.0, 0.0, 0.0)), u.x),
        mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), u.x), u.y),
    mix(mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), u.x),
        mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
}

float fbm2(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise2(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

vec3 starLayer(vec2 p, float scale, float density, float seed) {
  p *= scale;
  vec2 id = floor(p);
  vec2 f = fract(p) - 0.5;
  float h = hash21(id + seed);
  if (h > density) return vec3(0.0);
  vec2 off = vec2(hash21(id + seed + 1.3), hash21(id + seed + 7.1)) - 0.5;
  float big = pow(hash21(id + seed + 3.7), 8.0);
  float warm = hash21(id + seed + 9.1);
  float d = length(f - off * 0.7);
  float s = 1.0 - smoothstep(0.0, 0.06 + big * 0.12, d);
  s = s * s;
  float tw = 0.65 + 0.35 * sin(uTime * (0.5 + h * 3.0) + h * 40.0);
  vec3 c = mix(vec3(0.72, 0.8, 1.0), vec3(1.0, 0.85, 0.68), step(0.82, warm));
  return c * s * tw * (0.35 + 2.4 * big);
}

vec3 starfield(vec2 p) {
  vec3 c = vec3(0.0);
  c += starLayer(p, 22.0, 0.10, 0.0);
  c += starLayer(p, 48.0, 0.16, 11.0) * 0.8;
  c += starLayer(p, 110.0, 0.22, 23.0) * 0.55;
  return c;
}

vec3 nebula(vec2 p, vec3 colA, vec3 colB) {
  float n = fbm2(p * 1.1 + vec2(uTime * 0.004, -uTime * 0.003));
  float n2 = fbm2(p * 2.6 - n * 1.4 + 4.0);
  float neb = smoothstep(0.42, 0.98, n * 0.62 + n2 * 0.62);
  vec3 c = mix(colA, colB, n2) * neb;
  c *= 0.55 + 0.45 * smoothstep(0.2, 0.7, fbm2(p * 4.0 + 10.0));
  return c;
}
`;

export const BLACKHOLE_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const BLACKHOLE_FRAG = `
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uCenter;   // render-target pixels
uniform float uSize;    // pixels per disk unit
uniform vec2 uPointer;
uniform float uFall;    // 0..1 scroll-driven "falling in"
uniform float uDive;    // 0..1 crossing the horizon into the tesseract
uniform float uTilt;    // frame rotation
uniform float uIncl;    // disk inclination: minor over major axis of its orbits
uniform vec4 uGap;      // the gap the cursor opens
uniform float uCode;
uniform vec3 uFormation; // shadow growth, lensed far side, photon ring
uniform float uFeed;     // matter captured into the direct disk
uniform float uOpacity;

varying vec2 vUv;

${NOISE_GLSL}

float holeSq(float x) { return x * x; }

// white-hot at the inner edge, amber, then orange
vec3 diskColor(float t) {
  vec3 c = mix(vec3(1.0, 0.96, 0.9), vec3(1.0, 0.68, 0.36), smoothstep(0.0, 0.3, t));
  return mix(c, vec3(1.0, 0.5, 0.2), smoothstep(0.3, 1.0, t));
}

vec3 holeLight(vec2 frag) {
  vec2 p = (frag - uCenter) / max(uSize, 1.0);
  float r = length(p);
  vec2 dir = p / max(r, 1e-4);

  float rs = 0.4500 * max(0.003, uFormation.x); // shadow radius (disk units)

  // the tilted frame: the disk's orbits are flat ellipses along its x axis
  float ca = cos(uTilt);
  float sa = sin(uTilt);
  vec2 pr = vec2(ca * p.x + sa * p.y, -sa * p.x + ca * p.y);
  float k = max(uIncl, 0.02);

  // ── background, gravitationally lensed ─────────────────────────────
  float defl = rs * rs * 1.15 / max(r - rs * 0.55, 0.015);
  vec2 q = p - dir * defl;
  vec2 bgUv = q * (uSize / max(uRes.y, 1.0)) * 1.25 + uPointer * 0.02;
  vec3 col = vec3(0.004, 0.005, 0.009);
  col += nebula(bgUv * 1.4 + vec2(3.0, 1.0), vec3(0.05, 0.065, 0.09), vec3(0.11, 0.08, 0.07)) * 0.55;
  col += starfield(bgUv);
  // Einstein ring brightening of the lensed sky
  col *= 1.0 + 2.2 * exp(-holeSq((r - rs * 1.45) / (rs * 0.22)));

  col *= uFormation.x;

  // ── accretion disk (direct image) ──────────────────────────────────
  vec2 d = vec2(pr.x, pr.y / k);
  float rd = length(d);
  float ang = atan(d.y, d.x);
  float rin = 0.7200;
  float rout = 1.5000;
  float spin = uTime * 0.2200;
  float sw = ang + spin * (0.9 / (rd + 0.15));
  float n = fbm2(vec2(rd * 15.0) + vec2(cos(sw), sin(sw)) * 2.2);
  float n2 = vnoise2(vec2(rd * 42.0, 0.0) + vec2(cos(sw), sin(sw)) * 5.0);
  float t = clamp((rd - rin) / (rout - rin), 0.0, 1.0);
  float diskMask = smoothstep(rin - 0.015, rin + 0.03, rd) * (1.0 - smoothstep(rout * 0.6, rout, rd));
  vec3 dcol = diskColor(t);
  float doppler = 1.0 + 0.75 * (d.x / max(rd, 1e-3));
  float dI = diskMask * (0.25 + 1.15 * n + 0.35 * n2) * (1.0 - t) * (1.0 - t) * 1.9 * doppler * uFeed;

  // ── lensed far side of the disk: halo over the top, thin arc under ──
  float hin = rs * 1.02;
  float hout = rs * 1.95;
  float hang = atan(pr.y, pr.x);
  float hsw = hang + spin * (0.9 / (rin + max(r - hin, 0.0) * 3.4000 + 0.15));
  float hn = fbm2(vec2(r * 24.0) + vec2(cos(hsw), sin(hsw)) * 2.4);
  float ht = clamp((r - hin) / (hout - hin), 0.0, 1.0);
  float hMask = smoothstep(hin, hin + 0.015 * max(0.003, uFormation.x), r) * (1.0 - smoothstep(hin + 0.06 * max(0.003, uFormation.x), hout, r));
  float up = pr.y / max(r, 1e-3);
  float topW = smoothstep(-0.250, 0.850, up);
  float under = 0.550 * (1.0 - smoothstep(rs * 1.060, rs * 1.320, r));
  float halo = hMask * mix(under, 1.0, topW) * (0.35 + 1.05 * hn) * pow(1.0 - ht, 1.7);
  halo *= 1.0 + 0.55 * (pr.x / max(r, 1e-3));
  vec3 hcol = mix(vec3(1.0, 0.94, 0.86), vec3(1.0, 0.6, 0.3), ht);

  // ── photon ring ────────────────────────────────────────────────────
  float photonWidth = max(0.0018, 1.25 / max(uSize, 1.0));
  float ring = exp(-holeSq((r - rs * 1.01) / photonWidth)) * 1.7;
  ring += exp(-holeSq((r - rs * 1.035) / (photonWidth * 0.8))) * 0.42;
  ring += exp(-holeSq((r - rs) / 0.035)) * 0.24;
  ring *= uFormation.z;

  // ── compose ────────────────────────────────────────────────────────
  float behind = 1.0 - smoothstep(0.0, 0.6, uDive);
  halo *= behind;
  dI *= behind;
  col += hcol * halo * 1.4;
  col += vec3(1.0, 0.9, 0.78) * ring;
  float shadow = 1.0 - smoothstep(rs * 0.93, rs * 1.0, r);
  col *= 1.0 - shadow;
  float back = step(0.0, pr.y);
  col += dcol * dI * back * (1.0 - shadow);
  col += dcol * dI * (1.0 - back);

  // soft bloom around the disk plane
  float bloom = exp(-abs(pr.y) * 9.0) * exp(-max(r - rs, 0.0) * 2.6) * 0.32;
  col += vec3(1.0, 0.62, 0.32) * bloom * (1.0 - shadow * 0.85) * uFeed;
  col += vec3(0.85, 0.55, 0.3) * exp(-r * 1.9) * 0.06 * uFeed;

  // falling in: lift exposure and contrast near the hole as we scroll away
  col *= 1.0 + uFall * 0.35;
  // the photon ring flares once as the horizon passes the camera
  col += vec3(1.0, 0.88, 0.7) * ring * uDive * (1.0 - uDive) * 2.2;

  return col;
}

// The same display-referred light in the worker and the hero.
vec3 holeTone(vec3 col) {
  return 1.0 - exp(-col * 1.35) + vec3(0.0, 0.004, 0.012);
}

void main() {
  vec3 col = holeLight(vUv * uRes);
  gl_FragColor = vec4(holeTone(col), uOpacity);
}
`;
