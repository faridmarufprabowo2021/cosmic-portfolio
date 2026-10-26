import * as THREE from "three";

export class TrailsWorld {
  public group: THREE.Group;
  private trailLines: THREE.Line[] = [];
  private roleRings: THREE.Line[] = [];
  private poleStar!: THREE.Points;
  private trailCount = 64;

  constructor() {
    this.group = new THREE.Group();
    this.initTrails();
  }

  private initTrails() {
    // 1. Concentric circular star trails with random arc lengths
    for (let i = 0; i < this.trailCount; i++) {
      const radius = 1.2 + Math.random() * 9.0;
      const startAngle = Math.random() * Math.PI * 2;
      const arcLength = 0.4 + Math.random() * 1.8; // arc length in radians
      const segments = Math.floor(arcLength * 36);

      const points: THREE.Vector3[] = [];
      for (let s = 0; s <= segments; s++) {
        const a = startAngle + (s / segments) * arcLength;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;
        const z = (Math.random() - 0.5) * 0.4;
        points.push(new THREE.Vector3(x, y, z));
      }

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const isWarm = Math.random() > 0.65;
      const col = isWarm ? 0xffbe76 : 0x78a6ff;

      const mat = new THREE.LineBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.15 + Math.random() * 0.45,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(geo, mat);
      this.trailLines.push(line);
      this.group.add(line);
    }

    // 2. 4 Prominent Highlighted Role Arcs (4 roles)
    const roleColors = [0x38bdf8, 0x818cf8, 0xa78bfa, 0x34d399];
    const roleRadii = [3.2, 4.8, 6.2, 7.8];

    for (let r = 0; r < 4; r++) {
      const radius = roleRadii[r];
      const segments = 128;
      const points: THREE.Vector3[] = [];

      // Extended full orbit with subtle gap
      for (let s = 0; s <= segments; s++) {
        const a = (s / segments) * Math.PI * 1.85;
        points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
      }

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: roleColors[r],
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        linewidth: 2,
      });

      const ring = new THREE.Line(geo, mat);
      this.roleRings.push(ring);
      this.group.add(ring);
    }

    // 3. Bright Celestial Pole Star at center
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.45,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    this.poleStar = new THREE.Points(pGeo, pMat);
    this.group.add(this.poleStar);

    // Tilt camera perspective like true astrophotography
    this.group.rotation.x = Math.PI / 4.2;
    this.group.rotation.y = -Math.PI / 8.0;
  }

  public update(time: number, visibility: number) {
    this.group.visible = visibility > 0.01;
    if (!this.group.visible) return;

    // Continuous celestial long-exposure rotation
    this.group.rotation.z = time * 0.05;

    // Pulse role rings
    for (let i = 0; i < this.roleRings.length; i++) {
      const pulse = Math.sin(time * 2.0 + i) * 0.2 + 0.8;
      (this.roleRings[i].material as THREE.LineBasicMaterial).opacity = visibility * 0.75 * pulse;
    }

    for (let line of this.trailLines) {
      (line.material as THREE.LineBasicMaterial).opacity = visibility * 0.4;
    }
    (this.poleStar.material as THREE.PointsMaterial).opacity = visibility * 0.95;
  }
}
