import * as THREE from 'three';
import {
  COURT_L, COURT_W, HALF_L, HALF_W, LINE_W, ATTACK_DIST, FREE,
  NET_LENGTH, NET_MESH_H, NET_CENTER_Y, NET_TOP, POLE_X, POLE_H, LINE_Y,
} from './constants.js';

const neonCyan = 0x00f5d4;
const neonMagenta = 0xff2ec4;
const neonLime = 0xc8ff00;
const neonViolet = 0xa855f7;

function makeNetTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0a0e18';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = 'rgba(0, 255, 234, 0.65)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 256; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += 14) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function lineAlongX(scene, z0, span, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(span, LINE_Y * 2, LINE_W), mat);
  m.position.set(0, LINE_Y, z0);
  scene.add(m);
}

function lineAlongZ(scene, x0, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(LINE_W, LINE_Y * 2, COURT_L), mat);
  m.position.set(x0, LINE_Y, 0);
  scene.add(m);
}

/** Build FIVB-scale court into scene; returns static group reference. */
export function buildCourt(scene) {
  const root = new THREE.Group();
  root.name = 'court';

  const courtMat = new THREE.MeshStandardMaterial({
    color: 0x12151f,
    roughness: 0.9,
    metalness: 0.1,
    emissive: new THREE.Color(0x040608),
    emissiveIntensity: 0.35,
  });
  const freeMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c12,
    roughness: 0.98,
    metalness: 0.06,
    emissive: new THREE.Color(0x12081f),
    emissiveIntensity: 0.2,
  });

  const outerL = COURT_L + FREE * 2;
  const outerW = COURT_W + FREE * 2;
  const freeFloor = new THREE.Mesh(new THREE.PlaneGeometry(outerW, outerL), freeMat);
  freeFloor.rotation.x = -Math.PI / 2;
  freeFloor.position.y = -0.005;
  freeFloor.receiveShadow = true;
  root.add(freeFloor);

  const playFloor = new THREE.Mesh(new THREE.PlaneGeometry(COURT_W, COURT_L), courtMat);
  playFloor.rotation.x = -Math.PI / 2;
  playFloor.receiveShadow = true;
  root.add(playFloor);

  const lineBoundary = new THREE.MeshBasicMaterial({ color: neonCyan });
  const lineCenter = new THREE.MeshBasicMaterial({ color: neonMagenta });
  const lineAttack = new THREE.MeshBasicMaterial({ color: neonLime });
  const lineEnd = new THREE.MeshBasicMaterial({ color: neonViolet });

  lineAlongZ(root, -HALF_W, lineBoundary);
  lineAlongZ(root, HALF_W, lineBoundary);
  lineAlongX(root, HALF_L, COURT_W, lineEnd);
  lineAlongX(root, -HALF_L, COURT_W, lineEnd);
  lineAlongX(root, 0, COURT_W, lineCenter);
  lineAlongX(root, ATTACK_DIST, COURT_W, lineAttack);
  lineAlongX(root, -ATTACK_DIST, COURT_W, lineAttack);

  const netTex = makeNetTexture();
  netTex.wrapS = netTex.wrapT = THREE.RepeatWrapping;
  netTex.repeat.set(14, 3);
  const net = new THREE.Mesh(
    new THREE.PlaneGeometry(NET_LENGTH, NET_MESH_H),
    new THREE.MeshStandardMaterial({
      map: netTex,
      color: 0x7cf0ff,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(0x00fff0),
      emissiveIntensity: 0.35,
      emissiveMap: netTex,
    }),
  );
  net.position.set(0, NET_CENTER_Y, 0);
  root.add(net);

  const poleGeo = new THREE.CylinderGeometry(0.1, 0.11, POLE_H, 20);
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0xe2edf5,
    metalness: 0.8,
    roughness: 0.3,
    emissive: new THREE.Color(0x40fff8),
    emissiveIntensity: 0.4,
  });
  [-POLE_X, POLE_X].forEach((x) => {
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, POLE_H / 2, 0);
    root.add(pole);
  });

  const antGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.8, 8);
  const antMat = new THREE.MeshStandardMaterial({
    color: 0xff4d00,
    emissive: new THREE.Color(0xff6600),
    emissiveIntensity: 0.85,
  });
  [-HALF_W, HALF_W].forEach((x) => {
    const a = new THREE.Mesh(antGeo, antMat);
    a.position.set(x, NET_TOP + 0.4, 0);
    root.add(a);
  });

  const grid = new THREE.GridHelper(COURT_W + 4, 13, 0x1a2840, 0x101828);
  grid.position.y = 0.002;
  root.add(grid);

  scene.add(root);
  return root;
}

/** Infinite horizontal plane at y=0 for raycasts. */
export function makeCourtPlane() {
  return new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
}
