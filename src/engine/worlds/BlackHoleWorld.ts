import * as THREE from "three";

export class BlackHoleWorld {
  public group: THREE.Group;
  private diskMaterial!: THREE.ShaderMaterial;
  private photonRing!: THREE.Mesh;
  private particleSystem!: THREE.Points;
  private particlePositions!: Float32Array;
  private particleSpeeds!: Float32Array;
  private particleRadii!: Float32Array;
  private particleAngles!: Float32Array;
  private particleCount = 1200;

  constructor() {
    this.group = new THREE.Group();
    this.init();
  }

  private init() {
    // 1. Event Horizon Sphere (Pure Black void)
    const horizonGeo = new THREE.SphereGeometry(2.4, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    this.group.add(horizon);

    // 2. Photon Ring (High-intensity sharp rim)
    const ringGeo = new THREE.RingGeometry(2.42, 2.7, 96);
    const ringMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - vec2(0.5));
          float intensity = smoothstep(0.49, 0.45, dist) * smoothstep(0.38, 0.44, dist) * 2.2;
          vec3 col = mix(vec3(1.0, 0.85, 0.6), vec3(0.5, 0.75, 1.0), sin(uTime * 2.0) * 0.5 + 0.5);
          gl_FragColor = vec4(col * intensity, intensity * uOpacity * 0.95);
        }
      `,
    });
    this.photonRing = new THREE.Mesh(ringGeo, ringMat);
    this.photonRing.rotation.x = Math.PI / 2.3;
    this.group.add(this.photonRing);

    // 3. Accretion Disk (Shader with Doppler beaming & swirling noise)
    const diskGeo = new THREE.RingGeometry(2.8, 8.5, 128);
    this.diskMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        varying vec3 vPos;

        // Pseudo noise
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                     mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
        }

        void main() {
          float r = length(vPos.xy);
          float angle = atan(vPos.y, vPos.x);

          // Swirl coord
          float spiral = angle * 3.0 - r * 1.5 + uTime * 2.2;
          float n = noise(vec2(spiral, r * 2.0));

          // Radial falloff: brightest near photon ring, soft at outer edge
          float radialFade = smoothstep(2.7, 3.8, r) * smoothstep(8.5, 4.2, r);

          // Relativistic Doppler Beaming: forward moving side (left) is brighter and bluer
          float doppler = 1.0 + 0.65 * sin(angle);

          // Thermal spectrum palette: deep red -> orange -> gold -> hot blue-white
          vec3 coldCol = vec3(0.9, 0.28, 0.08);
          vec3 midCol  = vec3(1.0, 0.72, 0.25);
          vec3 hotCol  = vec3(0.85, 0.92, 1.0);

          vec3 baseColor = mix(coldCol, midCol, smoothstep(8.0, 4.5, r));
          baseColor = mix(baseColor, hotCol, smoothstep(4.5, 2.9, r) * doppler);

          float alpha = radialFade * (0.6 + 0.4 * n) * doppler * uOpacity;
          gl_FragColor = vec4(baseColor * (1.2 + n * 0.8), clamp(alpha, 0.0, 1.0));
        }
      `,
    });

    const disk = new THREE.Mesh(diskGeo, this.diskMaterial);
    disk.rotation.x = Math.PI / 2.3;
    this.group.add(disk);

    // 4. Infalling Incretion Particle Dust
    const pGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleRadii = new Float32Array(this.particleCount);
    this.particleAngles = new Float32Array(this.particleCount);
    this.particleSpeeds = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      const radius = 3.0 + Math.random() * 8.0;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 0.4 * (radius / 5.0);

      this.particleRadii[i] = radius;
      this.particleAngles[i] = angle;
      this.particleSpeeds[i] = (1.5 / Math.sqrt(radius)) * 0.8;

      this.particlePositions[i * 3 + 0] = Math.cos(angle) * radius;
      this.particlePositions[i * 3 + 1] = height;
      this.particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    pGeo.setAttribute("position", new THREE.BufferAttribute(this.particlePositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffd28a,
      size: 0.055,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleSystem = new THREE.Points(pGeo, pMat);
    this.particleSystem.rotation.x = Math.PI / 2.3;
    this.group.add(this.particleSystem);
  }

  public update(time: number, delta: number, visibility: number) {
    this.group.visible = visibility > 0.01;
    if (!this.group.visible) return;

    // Subtle drift & wobble
    this.group.rotation.y = time * 0.08;
    this.group.rotation.z = Math.sin(time * 0.15) * 0.05;

    // Uniforms
    this.diskMaterial.uniforms.uTime.value = time;
    this.diskMaterial.uniforms.uOpacity.value = visibility;
    (this.photonRing.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
    (this.photonRing.material as THREE.ShaderMaterial).uniforms.uOpacity.value = visibility;

    // Particle infalling orbital simulation
    const pos = this.particlePositions;
    for (let i = 0; i < this.particleCount; i++) {
      this.particleAngles[i] += this.particleSpeeds[i] * delta * 1.5;
      this.particleRadii[i] -= delta * 0.25;

      if (this.particleRadii[i] < 2.5) {
        this.particleRadii[i] = 10.5 + Math.random() * 1.5;
        this.particleAngles[i] = Math.random() * Math.PI * 2;
      }

      const r = this.particleRadii[i];
      const a = this.particleAngles[i];
      pos[i * 3 + 0] = Math.cos(a) * r;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
    (this.particleSystem.material as THREE.PointsMaterial).opacity = visibility * 0.8;
  }
}
