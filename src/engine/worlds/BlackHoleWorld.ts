import * as THREE from "three";
import { BLACKHOLE_VERT, BLACKHOLE_FRAG } from "../shaders/blackhole";

export class BlackHoleWorld {
  public group: THREE.Group;
  private material: THREE.ShaderMaterial;
  private quad: THREE.Mesh;
  private center = new THREE.Vector2();
  private res = new THREE.Vector2();
  private pointer = new THREE.Vector2();

  constructor() {
    this.group = new THREE.Group();

    // Fullscreen quad for raymarched screen-space relativistic blackhole
    const geo = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader: BLACKHOLE_VERT,
      fragmentShader: BLACKHOLE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uCenter: { value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2) },
        uSize: { value: Math.min(window.innerWidth, window.innerHeight) * 0.42 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uFall: { value: 0 },
        uDive: { value: 0 },
        uTilt: { value: -0.06 },
        uIncl: { value: 0.085 },
        uFormation: { value: new THREE.Vector3(1, 1, 1) },
        uFeed: { value: 1.0 },
        uCode: { value: 1.0 },
        uOpacity: { value: 1.0 },
      },
    });

    this.quad = new THREE.Mesh(geo, this.material);
    this.quad.frustumCulled = false;
    this.group.add(this.quad);

    if (typeof window !== "undefined") {
      this.res.set(window.innerWidth, window.innerHeight);
      window.addEventListener("pointermove", this.onPointerMove);
    }
  }

  private onPointerMove = (e: MouseEvent) => {
    if (typeof window === "undefined") return;
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;
    this.pointer.set(nx, ny);
  };

  public update(time: number, delta: number, visibility: number, anchor?: { cx: number; cy: number; w: number; h: number } | null) {
    if (typeof window === "undefined") return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    this.res.set(vw, vh);

    const u = this.material.uniforms;
    u.uTime.value = time;
    u.uRes.value.copy(this.res);
    u.uOpacity.value = visibility;

    // Smooth pointer
    u.uPointer.value.lerp(this.pointer, 0.06);

    // Compute dynamic center and size based on DOM anchor or center of viewport
    if (anchor && anchor.w > 0) {
      const cx = anchor.cx + 12 * u.uPointer.value.x;
      const cy = anchor.cy - 8 * u.uPointer.value.y;
      this.center.set(cx, vh - cy);
      u.uCenter.value.copy(this.center);
      u.uSize.value = Math.max(anchor.w * 0.35, Math.min(vw, vh) * 0.38);
    } else {
      const cx = vw / 2 + 12 * u.uPointer.value.x;
      const cy = vh / 2 - 8 * u.uPointer.value.y;
      this.center.set(cx, vh - cy);
      u.uCenter.value.copy(this.center);
      u.uSize.value = Math.min(vw, vh) * 0.42;
    }

    // Dynamic tilt & inclination from pointer
    u.uTilt.value = -0.06 + 0.03 * u.uPointer.value.x;
    u.uIncl.value = 0.075 + 0.015 * u.uPointer.value.y;

    // Visibility toggle
    this.group.visible = visibility > 0.001;
  }

  public dispose() {
    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", this.onPointerMove);
    }
    this.quad.geometry.dispose();
    this.material.dispose();
  }
}
