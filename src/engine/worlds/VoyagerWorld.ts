import * as THREE from "three";

export class VoyagerWorld {
  public group: THREE.Group;
  private voyagerGroup: THREE.Group;
  private saturnGroup: THREE.Group;
  private saturnMesh!: THREE.Mesh;
  private saturnRings!: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();
    this.voyagerGroup = new THREE.Group();
    this.saturnGroup = new THREE.Group();

    this.initSaturn();
    this.initVoyager();

    this.group.add(this.saturnGroup);
    this.group.add(this.voyagerGroup);
  }

  private initSaturn() {
    // Saturn Sphere
    const saturnRadius = 3.6;
    const saturnGeo = new THREE.SphereGeometry(saturnRadius, 48, 48);
    const saturnMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: new THREE.Vector3(1.0, 0.3, 0.8).normalize() },
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        uniform float uOpacity;
        varying vec3 vNormal;
        varying vec3 vPos;
        void main() {
          // Horizontal cloud bands based on Y coordinate
          float band = sin(vPos.y * 3.5) * 0.15 + sin(vPos.y * 8.0) * 0.08;
          vec3 baseOchre = vec3(0.88, 0.78, 0.58) + band;
          vec3 darkBand  = vec3(0.72, 0.60, 0.42);
          vec3 col = mix(baseOchre, darkBand, sin(vPos.y * 12.0) * 0.5 + 0.5);

          // Sunlight
          float diff = max(0.04, dot(vNormal, uSunDir));
          gl_FragColor = vec4(col * diff, uOpacity);
        }
      `,
    });
    this.saturnMesh = new THREE.Mesh(saturnGeo, saturnMat);
    this.saturnGroup.add(this.saturnMesh);

    // Saturn Rings
    const ringGeo = new THREE.RingGeometry(saturnRadius * 1.35, saturnRadius * 2.35, 96);
    const ringMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
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
        uniform float uOpacity;
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          float r = length(vPos.xy);
          // Ring division stripes (Cassini division)
          float stripe = sin(r * 24.0) * 0.3 + sin(r * 50.0) * 0.2;
          float cassini = smoothstep(6.2, 6.35, r) * smoothstep(6.5, 6.35, r); // gap
          float alpha = (0.55 + stripe) * (1.0 - cassini * 0.85) * uOpacity;

          vec3 ringColor = mix(vec3(0.85, 0.76, 0.58), vec3(0.68, 0.58, 0.42), stripe);
          gl_FragColor = vec4(ringColor, clamp(alpha, 0.0, 1.0));
        }
      `,
    });

    this.saturnRings = new THREE.Mesh(ringGeo, ringMat);
    this.saturnRings.rotation.x = Math.PI / 2.2;
    this.saturnGroup.add(this.saturnRings);

    // Place Saturn in the background
    this.saturnGroup.position.set(7.5, 2.0, -12.0);
    this.saturnGroup.rotation.z = -0.35;
    this.saturnGroup.rotation.x = 0.25;
  }

  private initVoyager() {
    // 1. High-Gain Antenna Dish (White parabolic reflector)
    const dishGeo = new THREE.CylinderGeometry(1.6, 0.2, 0.45, 32, 1, true);
    dishGeo.rotateX(Math.PI);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf0f4f8,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    this.voyagerGroup.add(dish);

    // Sub-reflector antenna feed
    const feedGeo = new THREE.ConeGeometry(0.12, 0.6, 8);
    feedGeo.translate(0, 0.45, 0);
    const feed = new THREE.Mesh(feedGeo, new THREE.MeshBasicMaterial({ color: 0x334155 }));
    this.voyagerGroup.add(feed);

    // 2. Spacecraft Bus Core (10-sided polygon compartment)
    const busGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.45, 10);
    busGeo.translate(0, -0.4, 0);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.4,
      metalness: 0.6,
    });
    const bus = new THREE.Mesh(busGeo, busMat);
    this.voyagerGroup.add(bus);

    // 3. Magnetometer Boom (Long lattice truss extending diagonally)
    const boomGeo = new THREE.CylinderGeometry(0.025, 0.025, 4.2, 6);
    boomGeo.translate(0, 2.1, 0);
    boomGeo.rotateZ(Math.PI / 2.8);
    boomGeo.translate(-0.3, -0.4, 0);
    const boomMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const boom = new THREE.Mesh(boomGeo, boomMat);
    this.voyagerGroup.add(boom);

    // 4. RTG Power Generator Boom (with radiator fins)
    const rtgBoomGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);
    rtgBoomGeo.translate(0, 0.9, 0);
    rtgBoomGeo.rotateZ(-Math.PI / 2.5);
    rtgBoomGeo.translate(0.3, -0.4, 0);
    const rtgBoom = new THREE.Mesh(rtgBoomGeo, new THREE.MeshBasicMaterial({ color: 0x334155 }));
    this.voyagerGroup.add(rtgBoom);

    // RTG Canister
    const canisterGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 12);
    canisterGeo.translate(1.4, -0.9, 0);
    const canister = new THREE.Mesh(canisterGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
    this.voyagerGroup.add(canister);

    // 5. The Golden Record (Gold phonograph record plate)
    const recordGeo = new THREE.CircleGeometry(0.28, 32);
    const recordMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.15,
      side: THREE.DoubleSide,
    });
    const record = new THREE.Mesh(recordGeo, recordMat);
    record.position.set(-0.55, -0.4, 0.3);
    record.rotation.y = -Math.PI / 6;
    this.voyagerGroup.add(record);

    // Initial position & scale
    this.voyagerGroup.position.set(-1.8, -0.4, 1.2);
    this.voyagerGroup.rotation.set(0.4, -0.6, 0.2);
  }

  public update(time: number, visibility: number) {
    this.group.visible = visibility > 0.01;
    if (!this.group.visible) return;

    // Slow space drift of Voyager 1
    this.voyagerGroup.rotation.y = -0.6 + Math.sin(time * 0.12) * 0.08;
    this.voyagerGroup.rotation.x = 0.4 + Math.cos(time * 0.1) * 0.06;
    this.voyagerGroup.position.y = -0.4 + Math.sin(time * 0.2) * 0.1;

    // Saturn axial spin
    this.saturnMesh.rotation.y = time * 0.03;

    // Opacity
    (this.saturnMesh.material as THREE.ShaderMaterial).uniforms.uOpacity.value = visibility;
    (this.saturnRings.material as THREE.ShaderMaterial).uniforms.uOpacity.value = visibility;
  }
}
