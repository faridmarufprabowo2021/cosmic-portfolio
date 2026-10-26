import * as THREE from "three";
import { BlackHoleWorld } from "./worlds/BlackHoleWorld";
import { TesseractWorld } from "./worlds/TesseractWorld";
import { EarthWorld } from "./worlds/EarthWorld";
import { TrailsWorld } from "./worlds/TrailsWorld";
import { VoyagerWorld } from "./worlds/VoyagerWorld";
import { GalaxyWorld } from "./worlds/GalaxyWorld";

export class SpaceEngine {
  private canvas: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;

  // 6 Worlds
  public blackHoleWorld!: BlackHoleWorld;
  public tesseractWorld!: TesseractWorld;
  public earthWorld!: EarthWorld;
  public trailsWorld!: TrailsWorld;
  public voyagerWorld!: VoyagerWorld;
  public galaxyWorld!: GalaxyWorld;

  // Background deep starfield
  private backgroundStars!: THREE.Points;

  // Animation Loop & Scroll State
  private reqId: number | null = null;
  private clock: THREE.Clock;
  private targetProgress = 0;
  private currentProgress = 0;
  private activeRoomIndex = 0;

  // Camera Path Keyframes (x, y, z, lookX, lookY, lookZ)
  private cameraStations = [
    { pos: new THREE.Vector3(0, 0, 11), look: new THREE.Vector3(0, 0, 0) },       // 0: Black Hole
    { pos: new THREE.Vector3(0, 0, 9.5), look: new THREE.Vector3(0, 0, 0) },      // 1: Tesseract
    { pos: new THREE.Vector3(1.2, 0.4, 8.5), look: new THREE.Vector3(0, 0, 0) },   // 2: Earth Origin
    { pos: new THREE.Vector3(0, 0, 10.5), look: new THREE.Vector3(0, 0, 0) },     // 3: Star Trails
    { pos: new THREE.Vector3(-1.0, 0.2, 9), look: new THREE.Vector3(0, 0, 0) },    // 4: Voyager 1
    { pos: new THREE.Vector3(1.5, 0, 10), look: new THREE.Vector3(0, 0, 0) },      // 5: Galaxy
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.init();
  }

  private init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030409, 0.012);

    // 2. Camera
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 11);

    // 3. Renderer with clamped DPR
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
    dirLight.position.set(5, 8, 10);
    this.scene.add(dirLight);

    // 5. Background Starfield
    this.initBackgroundStars();

    // 6. Instantiate 6 Worlds
    this.blackHoleWorld = new BlackHoleWorld();
    this.tesseractWorld = new TesseractWorld();
    this.earthWorld = new EarthWorld();
    this.trailsWorld = new TrailsWorld();
    this.voyagerWorld = new VoyagerWorld();
    this.galaxyWorld = new GalaxyWorld();

    this.scene.add(this.blackHoleWorld.group);
    this.scene.add(this.tesseractWorld.group);
    this.scene.add(this.earthWorld.group);
    this.scene.add(this.trailsWorld.group);
    this.scene.add(this.voyagerWorld.group);
    this.scene.add(this.galaxyWorld.group);

    // Event listeners
    window.addEventListener("resize", this.onResize);

    // Start loop
    this.tick();
  }

  private initBackgroundStars() {
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = -15 - Math.random() * 45;

      const brightness = 0.5 + Math.random() * 0.5;
      colors[i * 3 + 0] = brightness * 0.85;
      colors[i * 3 + 1] = brightness * 0.92;
      colors[i * 3 + 2] = brightness * 1.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });

    this.backgroundStars = new THREE.Points(geo, mat);
    this.scene.add(this.backgroundStars);
  }

  public anchor(selector: string): { cx: number; cy: number; w: number; h: number } | null {
    if (typeof document === "undefined") return null;
    const el = document.querySelector(selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      w: rect.width,
      h: rect.height,
    };
  }

  public setScrollProgress(progress: number, activeRoom = 0) {
    this.targetProgress = Math.max(0, Math.min(1, progress));
    this.activeRoomIndex = activeRoom;
  }

  public triggerWarp(onComplete: () => void) {
    // Hyperdrive effect
    this.galaxyWorld.triggerWarp(() => {
      this.targetProgress = 0;
      this.currentProgress = 0;
      onComplete();
    });
  }

  private onResize = () => {
    if (!this.canvas) return;
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  };

  private calculateVisibility(progress: number, start: number, peak: number, end: number): number {
    if (progress <= start || progress >= end) return 0;
    if (progress < peak) {
      return (progress - start) / (peak - start);
    }
    return (end - progress) / (end - peak);
  }

  private tick = () => {
    this.reqId = requestAnimationFrame(this.tick);

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Smooth lerp scroll progress
    this.currentProgress += (this.targetProgress - this.currentProgress) * 0.085;
    const p = this.currentProgress;

    // Station index from 0 to 5
    const stationFraction = p * 5.0;
    const fromStation = Math.min(4, Math.floor(stationFraction));
    const toStation = Math.min(5, fromStation + 1);
    const stationMix = stationFraction - fromStation;

    // Camera Lerp
    const stFrom = this.cameraStations[fromStation];
    const stTo = this.cameraStations[toStation];

    this.camera.position.lerpVectors(stFrom.pos, stTo.pos, stationMix);
    const lookTarget = new THREE.Vector3().lerpVectors(stFrom.look, stTo.look, stationMix);
    this.camera.lookAt(lookTarget);

    // Compute visibility for each world (smooth bell-curve envelopes)
    // 0: Black Hole (0.0 to 0.22)
    const vBlackHole = this.calculateVisibility(p, -0.05, 0.0, 0.24);
    // 1: Tesseract (0.16 to 0.42)
    const vTesseract = this.calculateVisibility(p, 0.14, 0.28, 0.44);
    // 2: Earth Origin (0.36 to 0.62)
    const vEarth = this.calculateVisibility(p, 0.36, 0.48, 0.64);
    // 3: Star Trails (0.56 to 0.78)
    const vTrails = this.calculateVisibility(p, 0.54, 0.68, 0.82);
    // 4: Voyager 1 (0.74 to 0.92)
    const vVoyager = this.calculateVisibility(p, 0.72, 0.84, 0.94);
    // 5: Galaxy (0.86 to 1.05)
    const vGalaxy = this.calculateVisibility(p, 0.84, 1.0, 1.05);

    // Update worlds
    this.blackHoleWorld.update(time, delta, vBlackHole);
    this.tesseractWorld.update(time, vTesseract, this.activeRoomIndex);
    this.earthWorld.update(time, vEarth);
    this.trailsWorld.update(time, vTrails);
    this.voyagerWorld.update(time, vVoyager);
    this.galaxyWorld.update(time, delta, vGalaxy);

    // Background starfield slow drift
    if (this.backgroundStars) {
      this.backgroundStars.rotation.y = time * 0.015;
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.reqId) cancelAnimationFrame(this.reqId);
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
  }
}
