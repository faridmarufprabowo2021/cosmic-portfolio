import * as THREE from "three";

export class GalaxyWorld {
  public group: THREE.Group;
  private galaxyPoints!: THREE.Points;
  private cmbMesh!: THREE.Mesh;
  private warpStars!: THREE.Points;
  private warpStarPositions!: Float32Array;
  private warpStarVelocities!: Float32Array;
  private warpCount = 600;
  public isWarping = false;
  private warpProgress = 0;

  constructor() {
    this.group = new THREE.Group();
    this.initCMB();
    this.initGalaxy();
    this.initWarpStars();
  }

  private initCMB() {
    // Cosmic Microwave Background (Using real Planck CMB map from poggufanz.xyz)
    const textureLoader = new THREE.TextureLoader();
    const cmbTexture = textureLoader.load("/textures/space/cmb-field.webp");
    cmbTexture.wrapS = THREE.RepeatWrapping;
    cmbTexture.wrapT = THREE.RepeatWrapping;

    const cmbGeo = new THREE.PlaneGeometry(36, 24, 32, 32);
    const cmbMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMap: { value: cmbTexture },
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
        uniform sampler2D uMap;
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          vec4 tex = texture2D(uMap, vUv);
          // Subtle cosmic pulse
          float pulse = sin(uTime * 0.4) * 0.05 + 0.95;
          gl_FragColor = vec4(tex.rgb * pulse, tex.a * 0.38 * uOpacity);
        }
      `,
    });

    this.cmbMesh = new THREE.Mesh(cmbGeo, cmbMat);
    this.cmbMesh.position.set(0, 0, -14);
    this.group.add(this.cmbMesh);
  }

  private initGalaxy() {
    const starCount = 3500;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const arms = 2;
    const armSpin = 3.5;
    const maxRadius = 7.5;

    for (let i = 0; i < starCount; i++) {
      const r = Math.pow(Math.random(), 2.2) * maxRadius;
      const armAngle = ((i % arms) * (Math.PI * 2)) / arms;
      const spinAngle = r * armSpin;

      const spreadX = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.45) * r;
      const spreadY = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3) * r;
      const spreadZ = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.45) * r;

      positions[i * 3 + 0] = Math.cos(armAngle + spinAngle) * r + spreadX;
      positions[i * 3 + 1] = spreadY;
      positions[i * 3 + 2] = Math.sin(armAngle + spinAngle) * r + spreadZ;

      // Color: Core is warm golden/white, outer arms are electric blue/cyan
      const mixedColor = new THREE.Color();
      if (r < 1.8) {
        mixedColor.setRGB(1.0, 0.85, 0.65);
      } else {
        mixedColor.setRGB(0.42, 0.68, 1.0);
      }

      colors[i * 3 + 0] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.galaxyPoints = new THREE.Points(geo, mat);
    this.galaxyPoints.position.set(2.5, 0, -2);
    this.galaxyPoints.rotation.x = Math.PI / 3.0;
    this.group.add(this.galaxyPoints);
  }

  private initWarpStars() {
    // Hyperdrive warp jump star streaks
    const geo = new THREE.BufferGeometry();
    this.warpStarPositions = new Float32Array(this.warpCount * 3);
    this.warpStarVelocities = new Float32Array(this.warpCount);

    for (let i = 0; i < this.warpCount; i++) {
      this.warpStarPositions[i * 3 + 0] = (Math.random() - 0.5) * 30;
      this.warpStarPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      this.warpStarPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      this.warpStarVelocities[i] = 15 + Math.random() * 25;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(this.warpStarPositions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.12,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.warpStars = new THREE.Points(geo, mat);
    this.group.add(this.warpStars);
  }

  public triggerWarp(onComplete: () => void) {
    if (this.isWarping) return;
    this.isWarping = true;
    this.warpProgress = 0;

    const duration = 2.5; // seconds
    let startTime: number | null = null;

    const animateWarp = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = (time - startTime) / 1000;
      this.warpProgress = Math.min(1.0, elapsed / duration);

      if (this.warpProgress < 1.0) {
        requestAnimationFrame(animateWarp);
      } else {
        this.isWarping = false;
        (this.warpStars.material as THREE.PointsMaterial).opacity = 0;
        onComplete();
      }
    };
    requestAnimationFrame(animateWarp);
  }

  public update(time: number, delta: number, visibility: number) {
    this.group.visible = visibility > 0.01 || this.isWarping;
    if (!this.group.visible) return;

    // Spiral galaxy rotation
    this.galaxyPoints.rotation.y = time * 0.08;

    // CMB uniforms
    (this.cmbMesh.material as THREE.ShaderMaterial).uniforms.uOpacity.value = visibility;
    (this.galaxyPoints.material as THREE.PointsMaterial).opacity = visibility * 0.85;

    // If warping, animate hyperdrive star streaks
    if (this.isWarping) {
      const warpMat = this.warpStars.material as THREE.PointsMaterial;
      warpMat.opacity = Math.sin(this.warpProgress * Math.PI) * 0.95;
      warpMat.size = 0.12 + this.warpProgress * 0.35;

      const pos = this.warpStarPositions;
      for (let i = 0; i < this.warpCount; i++) {
        pos[i * 3 + 2] += this.warpStarVelocities[i] * delta * 2.5;
        if (pos[i * 3 + 2] > 20) {
          pos[i * 3 + 2] = -25;
        }
      }
      this.warpStars.geometry.attributes.position.needsUpdate = true;
    }
  }
}
