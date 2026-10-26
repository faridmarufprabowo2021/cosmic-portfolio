import * as THREE from "three";

export class TesseractWorld {
  public group: THREE.Group;
  private lineSegments!: THREE.LineSegments;
  private nodePoints!: THREE.Points;
  private vertices4D: number[][] = [];
  private edges: [number, number][] = [];
  private currentPositions!: Float32Array;
  private nodePositions!: Float32Array;

  constructor() {
    this.group = new THREE.Group();
    this.init4DGeometry();
    this.initMeshes();
  }

  private init4DGeometry() {
    // 16 vertices of a 4D hypercube (±1, ±1, ±1, ±1)
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          for (let w = -1; w <= 1; w += 2) {
            this.vertices4D.push([x, y, z, w]);
          }
        }
      }
    }

    // 32 edges connecting vertices that differ by exactly 1 coordinate
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) {
          if (this.vertices4D[i][k] !== this.vertices4D[j][k]) diff++;
        }
        if (diff === 1) {
          this.edges.push([i, j]);
        }
      }
    }
  }

  private initMeshes() {
    // 32 edges * 2 points per edge * 3 coords = 192 floats
    this.currentPositions = new Float32Array(this.edges.length * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(this.currentPositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x78a6ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    this.group.add(this.lineSegments);

    // 16 Node Spheres/Points
    this.nodePositions = new Float32Array(16 * 3);
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(this.nodePositions, 3));

    const nodeMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.22,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    this.nodePoints = new THREE.Points(nodeGeo, nodeMat);
    this.group.add(this.nodePoints);

    // Initial scale and position
    this.group.position.set(0, 0, 0);
  }

  public update(time: number, visibility: number, activeRoomIndex: number = 0) {
    this.group.visible = visibility > 0.01;
    if (!this.group.visible) return;

    // 4D Rotations: XW plane and YZ plane
    const theta = time * 0.45 + activeRoomIndex * 0.8;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const phi = time * 0.25;
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);

    // Project each 4D vertex to 3D with perspective division
    const projected3D: [number, number, number][] = [];
    const cameraDistance4D = 2.4;
    const scale = 3.6;

    for (let i = 0; i < 16; i++) {
      let [x, y, z, w] = this.vertices4D[i];

      // Rotate in XW
      const x1 = x * cosT - w * sinT;
      const w1 = x * sinT + w * cosT;

      // Rotate in YZ
      const y1 = y * cosP - z * sinP;
      const z1 = y * sinP + z * cosP;

      // Perspective projection from 4D to 3D
      const factor = 1.0 / (cameraDistance4D - w1 * 0.5);
      const px = x1 * factor * scale;
      const py = y1 * factor * scale;
      const pz = z1 * factor * scale;

      projected3D.push([px, py, pz]);

      // Update node vertex
      this.nodePositions[i * 3 + 0] = px;
      this.nodePositions[i * 3 + 1] = py;
      this.nodePositions[i * 3 + 2] = pz;
    }

    // Update lines
    for (let e = 0; e < this.edges.length; e++) {
      const [iA, iB] = this.edges[e];
      const pA = projected3D[iA];
      const pB = projected3D[iB];

      const idx = e * 6;
      this.currentPositions[idx + 0] = pA[0];
      this.currentPositions[idx + 1] = pA[1];
      this.currentPositions[idx + 2] = pA[2];

      this.currentPositions[idx + 3] = pB[0];
      this.currentPositions[idx + 4] = pB[1];
      this.currentPositions[idx + 5] = pB[2];
    }

    this.lineSegments.geometry.attributes.position.needsUpdate = true;
    this.nodePoints.geometry.attributes.position.needsUpdate = true;

    // Opacity
    (this.lineSegments.material as THREE.LineBasicMaterial).opacity = visibility * 0.85;
    (this.nodePoints.material as THREE.PointsMaterial).opacity = visibility * 0.95;

    // Slow orientation drift
    this.group.rotation.x = Math.sin(time * 0.2) * 0.2;
    this.group.rotation.y = time * 0.15;
  }
}
