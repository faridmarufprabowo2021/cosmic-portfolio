import * as THREE from "three";

export class EarthWorld {
  public group: THREE.Group;
  private earthMesh!: THREE.Mesh;
  private atmosphereMesh!: THREE.Mesh;
  private cloudsMesh!: THREE.Mesh;
  private pinBeacon!: THREE.Mesh;
  private pinRings!: THREE.Points;

  constructor() {
    this.group = new THREE.Group();
    this.initEarth();
  }

  private initEarth() {
    const radius = 3.2;

    // 1. Procedural Surface Shader Earth (Land, Ocean, Night lights)
    const earthGeo = new THREE.SphereGeometry(radius, 64, 64);
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 1.0 },
        uSunDir: { value: new THREE.Vector3(1.0, 0.4, 0.8).normalize() },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPos = (modelMatrix * vec4(position, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        uniform float uOpacity;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPos;
        varying vec2 vUv;

        // Hash / noise for continents
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
        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for(int i=0; i<5; i++) {
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          // Continents pattern from spherical UV
          float continent = fbm(vUv * vec2(8.0, 4.0));
          bool isLand = continent > 0.48;

          vec3 oceanCol = vec3(0.02, 0.12, 0.28);
          vec3 shallowCol = vec3(0.05, 0.22, 0.42);
          vec3 landCol = vec3(0.12, 0.28, 0.16);
          vec3 mountainCol = vec3(0.35, 0.32, 0.25);

          vec3 surfaceColor = isLand ? mix(landCol, mountainCol, smoothstep(0.55, 0.72, continent))
                                     : mix(oceanCol, shallowCol, smoothstep(0.40, 0.48, continent));

          // Lighting from sun direction
          vec3 norm = normalize(vNormal);
          float diff = max(0.0, dot(norm, uSunDir));

          // Night city lights on dark side
          float night = smoothstep(0.2, -0.2, dot(norm, uSunDir));
          float cityGrid = step(0.72, hash(floor(vUv * 160.0))) * (isLand ? 1.0 : 0.0);
          vec3 cityLights = vec3(1.0, 0.75, 0.35) * cityGrid * night * 1.8;

          // Day / Night combination
          vec3 finalColor = surfaceColor * (diff * 1.1 + 0.04) + cityLights;

          // Subtle rim light
          float rim = 1.0 - max(0.0, dot(norm, vec3(0.0, 0.0, 1.0)));
          finalColor += vec3(0.25, 0.55, 0.95) * pow(rim, 3.5) * 0.75;

          gl_FragColor = vec4(finalColor, uOpacity);
        }
      `,
    });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.group.add(this.earthMesh);

    // 2. Cloud Layer (slightly larger radius)
    const cloudGeo = new THREE.SphereGeometry(radius * 1.025, 48, 48);
    const cloudMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        varying vec3 vNormal;

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
          vec2 p = vUv * vec2(12.0, 6.0) + vec2(uTime * 0.02, 0.0);
          float n = noise(p) * 0.6 + noise(p * 2.0) * 0.4;
          float alpha = smoothstep(0.48, 0.75, n) * 0.45 * uOpacity;
          gl_FragColor = vec4(vec3(0.92, 0.95, 1.0), alpha);
        }
      `,
    });
    this.cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
    this.group.add(this.cloudsMesh);

    // 3. Rayleigh Scattering Atmosphere Rim Glow
    const atmosGeo = new THREE.SphereGeometry(radius * 1.15, 48, 48);
    const atmosMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: {
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.3, 0.65, 1.0, 1.0) * intensity * uOpacity * 1.5;
        }
      `,
    });
    this.atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    this.group.add(this.atmosphereMesh);

    // 4. Surakarta Coordinate Pin: 7.5561°S, 110.7725°E
    const lat = -7.5561 * (Math.PI / 180);
    const lon = (110.7725 - 180) * (Math.PI / 180);

    const pinPos = new THREE.Vector3(
      -(radius + 0.05) * Math.cos(lat) * Math.cos(lon),
      (radius + 0.05) * Math.sin(lat),
      (radius + 0.05) * Math.cos(lat) * Math.sin(lon)
    );

    // Pin Beacon Stick & Top Light
    const beaconGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
    beaconGeo.translate(0, 0.3, 0);
    beaconGeo.rotateX(Math.PI / 2);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.pinBeacon = new THREE.Mesh(beaconGeo, beaconMat);
    this.pinBeacon.position.copy(pinPos);
    this.pinBeacon.lookAt(pinPos.clone().multiplyScalar(2));
    this.group.add(this.pinBeacon);

    // Pin Glowing Ring
    const pRingGeo = new THREE.BufferGeometry();
    const ringCount = 32;
    const ringPos = new Float32Array(ringCount * 3);
    for (let i = 0; i < ringCount; i++) {
      const a = (i / ringCount) * Math.PI * 2;
      ringPos[i * 3 + 0] = Math.cos(a) * 0.18;
      ringPos[i * 3 + 1] = Math.sin(a) * 0.18;
      ringPos[i * 3 + 2] = 0;
    }
    pRingGeo.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
    this.pinRings = new THREE.Points(
      pRingGeo,
      new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.08, transparent: true, opacity: 0.9 })
    );
    this.pinRings.position.copy(pinPos.clone().multiplyScalar(1.02));
    this.pinRings.lookAt(pinPos.clone().multiplyScalar(2));
    this.group.add(this.pinRings);
  }

  public update(time: number, visibility: number) {
    this.group.visible = visibility > 0.01;
    if (!this.group.visible) return;

    // Earth axial rotation
    this.earthMesh.rotation.y = time * 0.06;
    this.cloudsMesh.rotation.y = time * 0.075;
    this.pinBeacon.rotation.y = time * 0.06;
    this.pinRings.rotation.y = time * 0.06;

    // Pulse beacon light
    const pulse = Math.sin(time * 4.0) * 0.3 + 0.7;
    (this.pinBeacon.material as THREE.MeshBasicMaterial).color.setRGB(0.22 * pulse, 0.74 * pulse, 0.97 * pulse);

    // Uniforms
    (this.earthMesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
    (this.earthMesh.material as THREE.ShaderMaterial).uniforms.uOpacity.value = visibility;
    (this.cloudsMesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
    (this.cloudsMesh.material as THREE.ShaderMaterial).uniforms.uOpacity.value = visibility;
    (this.atmosphereMesh.material as THREE.ShaderMaterial).uniforms.uOpacity.value = visibility;
  }
}
