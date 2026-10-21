import * as THREE from 'three';

const ARC_SEGMENTS = 48;

export class BallTrajectory {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'ballTrajectory';
    scene.add(this.group);

    this.ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.105, 24, 18),
      new THREE.MeshStandardMaterial({
        color: 0xf5f0e8,
        roughness: 0.35,
        emissive: new THREE.Color(0xffaa66),
        emissiveIntensity: 0.2,
      }),
    );
    this.ball.castShadow = true;
    this.ball.userData.type = 'ball';
    this.group.add(this.ball);

    const cpMat = new THREE.MeshStandardMaterial({
      color: 0xffcc66,
      emissive: new THREE.Color(0xffaa00),
      emissiveIntensity: 0.5,
      roughness: 0.4,
    });
    this.handles = ['p0', 'p1', 'p2'].map((key) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), cpMat.clone());
      m.userData.type = 'ballHandle';
      m.userData.handleKey = key;
      m.castShadow = true;
      this.group.add(m);
      return m;
    });

    this.line = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({
        color: 0xffcc66,
        dashSize: 0.25,
        gapSize: 0.15,
        transparent: true,
        opacity: 0.75,
      }),
    );
    this.group.add(this.line);

    this.data = { type: 'bezier', p0: [0, 1, 5], p1: [0, 2.5, 3], p2: [0, 1.1, 1.5] };
    this.editMode = false;
    this.updateVisual();
  }

  setFromData(ball) {
    this.data = {
      type: 'bezier',
      p0: [...ball.p0],
      p1: [...ball.p1],
      p2: [...ball.p2],
    };
    this.updateVisual();
  }

  getData() {
    return {
      type: 'bezier',
      p0: [...this.data.p0],
      p1: [...this.data.p1],
      p2: [...this.data.p2],
    };
  }

  setEditMode(on) {
    this.editMode = on;
    this.handles.forEach((h) => {
      h.visible = on;
    });
  }

  getCurve() {
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3().fromArray(this.data.p0),
      new THREE.Vector3().fromArray(this.data.p1),
      new THREE.Vector3().fromArray(this.data.p2),
    );
  }

  updateVisual() {
    const keys = ['p0', 'p1', 'p2'];
    keys.forEach((k, i) => {
      this.handles[i].position.fromArray(this.data[k]);
    });
    const curve = this.getCurve();
    const pts = curve.getPoints(ARC_SEGMENTS);
    this.line.geometry.dispose();
    this.line.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    this.line.computeLineDistances();
  }

  setBallPosition(vec) {
    this.ball.position.copy(vec);
  }

  sampleAtTime(time, duration) {
    const u = Math.min(1, Math.max(0, time / Math.max(0.01, duration)));
    const s = u * u * (3 - 2 * u);
    return this.getCurve().getPoint(s);
  }

  moveHandle(key, pos) {
    this.data[key] = [pos.x, pos.y, pos.z];
    this.updateVisual();
  }
}
