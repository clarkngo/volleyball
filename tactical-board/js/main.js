/**
 * Volleyball Tactical Board — main entry.
 * Three.js scene, drag-and-drop, timeline playback, JSON / URL hash state.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildCourt, makeCourtPlane } from './court.js';
import {
  createPlayerMesh, setPlayerPose, setSelected, setPlayerPosition,
} from './playerFactory.js';
import { BallTrajectory } from './trajectory.js';
import { applyCameraPreset } from './cameraPresets.js';
import { clampCourt } from './constants.js';
import {
  createDefaultPlay, createPlayer, samplePlayer,
  serializePlay, deserializePlay, playToHash, playFromHash,
} from './state.js';

// ─── DOM refs ───────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const scrubber = document.getElementById('scrubber');
const timeLabel = document.getElementById('timeLabel');
const btnPlay = document.getElementById('btnPlay');
const durationInput = document.getElementById('durationInput');
const selectionPanel = document.getElementById('selectionPanel');
const selSummary = document.getElementById('selSummary');
const selRole = document.getElementById('selRole');
const toastEl = document.getElementById('toast');

// ─── Scene ──────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050508);
scene.fog = new THREE.FogExp2(0x0a0c14, 0.006);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 160);
const controls = new OrbitControls(camera, canvas);
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 5;
controls.maxDistance = 55;
applyCameraPreset('orbit', camera, controls);

scene.add(new THREE.HemisphereLight(0x8899bb, 0x151820, 0.65));
const sun = new THREE.DirectionalLight(0xe8f0ff, 0.9);
sun.position.set(-12, 24, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 80;
const ext = 20;
sun.shadow.camera.left = -ext;
sun.shadow.camera.right = ext;
sun.shadow.camera.top = ext;
sun.shadow.camera.bottom = -ext;
scene.add(sun);
scene.add(new THREE.AmbientLight(0x304060, 0.25));

buildCourt(scene);
const courtPlane = makeCourtPlane();
const playersGroup = new THREE.Group();
playersGroup.name = 'players';
scene.add(playersGroup);

const trajectory = new BallTrajectory(scene);

// ─── App state ──────────────────────────────────────────────────────────────
let play = createDefaultPlay();
const playerMeshes = new Map(); // id -> THREE.Group
let selectedId = null;
let tool = 'select';
let playing = false;
let playTime = 0;
let speed = 1;
let cameraPreset = 'orbit';

// ─── Raycast drag ───────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const hitPoint = new THREE.Vector3();
let dragging = null; // { kind, id?, handleKey?, offset }

function setPointer(ev) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
}

function raycastTargets() {
  raycaster.setFromCamera(pointer, camera);
  const targets = [];
  playerMeshes.forEach((mesh) => targets.push(mesh));
  if (tool === 'ball') {
    trajectory.handles.forEach((h) => targets.push(h));
  }
  return raycaster.intersectObjects(targets, true);
}

function pickObject(ev) {
  setPointer(ev);
  const hits = raycastTargets();
  for (const hit of hits) {
    let o = hit.object;
    while (o) {
      if (o.userData?.playerId) {
        return { kind: 'player', mesh: o, id: o.userData.playerId };
      }
      if (o.userData?.type === 'ballHandle') {
        return { kind: 'handle', mesh: o, key: o.userData.handleKey };
      }
      o = o.parent;
    }
  }
  return null;
}

function intersectFloor() {
  raycaster.setFromCamera(pointer, camera);
  const pt = new THREE.Vector3();
  return raycaster.ray.intersectPlane(courtPlane, pt) ? pt : null;
}

function onPointerDown(ev) {
  if (ev.button !== 0) return;
  const pick = pickObject(ev);
  if (pick?.kind === 'player' && tool === 'select') {
    selectPlayer(pick.id);
    const floor = intersectFloor();
    if (floor) {
      const mesh = playerMeshes.get(pick.id);
      dragging = {
        kind: 'player',
        id: pick.id,
        offset: new THREE.Vector3(mesh.position.x - floor.x, 0, mesh.position.z - floor.z),
      };
      controls.enabled = false;
    }
    ev.preventDefault();
    return;
  }
  if (pick?.kind === 'handle' && tool === 'ball') {
    dragging = { kind: 'handle', key: pick.key };
    controls.enabled = false;
    ev.preventDefault();
    return;
  }
  if (tool === 'select') selectPlayer(null);
}

function onPointerMove(ev) {
  if (!dragging) return;
  setPointer(ev);
  if (dragging.kind === 'player') {
    const floor = intersectFloor();
    if (!floor) return;
    const x = floor.x + dragging.offset.x;
    const z = floor.z + dragging.offset.z;
    const c = clampCourt(x, z);
    const mesh = playerMeshes.get(dragging.id);
    setPlayerPosition(mesh, c.x, c.z);
    syncPlayerKeyframeAtPlayhead(dragging.id, c.x, c.z);
    ev.preventDefault();
    return;
  }
  if (dragging.kind === 'handle') {
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const pt = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, pt)) {
      if (dragging.key === 'p1') {
        pt.y = Math.max(0.5, Math.min(4.5, pt.y));
      } else {
        pt.y = Math.max(0.08, pt.y);
      }
      trajectory.moveHandle(dragging.key, pt);
      play.ball = trajectory.getData();
    }
    ev.preventDefault();
  }
}

function onPointerUp() {
  dragging = null;
  controls.enabled = cameraPreset === 'orbit' || true;
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

// ─── Players ────────────────────────────────────────────────────────────────
function rebuildPlayers() {
  playerMeshes.forEach((mesh) => {
    playersGroup.remove(mesh);
    mesh.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        mats.forEach((m) => m.dispose());
      }
    });
  });
  playerMeshes.clear();

  for (const p of play.players) {
    const mesh = createPlayerMesh(p.team, p.role);
    mesh.userData.type = 'player';
    mesh.userData.playerId = p.id;
    const sample = samplePlayer(p, playTime);
    setPlayerPosition(mesh, sample.x, sample.z);
    setPlayerPose(mesh, sample.pose);
    setSelected(mesh, p.id === selectedId);
    playersGroup.add(mesh);
    playerMeshes.set(p.id, mesh);
  }
}

function applyPlayTime(t) {
  playTime = Math.min(play.duration, Math.max(0, t));
  for (const p of play.players) {
    const mesh = playerMeshes.get(p.id);
    if (!mesh) continue;
    const s = samplePlayer(p, playTime);
    setPlayerPosition(mesh, s.x, s.z);
    setPlayerPose(mesh, s.pose);
  }
  const ballPos = trajectory.sampleAtTime(playTime, play.duration);
  trajectory.setBallPosition(ballPos);
  scrubber.value = String(Math.round((playTime / play.duration) * 1000));
  timeLabel.textContent = `${playTime.toFixed(1)}s`;
}

function selectPlayer(id) {
  selectedId = id;
  playerMeshes.forEach((mesh, pid) => setSelected(mesh, pid === id));
  if (id) {
    const p = play.players.find((x) => x.id === id);
    selectionPanel.hidden = false;
    selSummary.textContent = `Team ${p.team} · ${p.role}`;
    selRole.value = p.role;
  } else {
    selectionPanel.hidden = true;
  }
}

function syncPlayerKeyframeAtPlayhead(id, x, z) {
  const p = play.players.find((pl) => pl.id === id);
  if (!p) return;
  const t = playTime;
  const existing = p.keyframes.find((k) => Math.abs(k.time - t) < 0.05);
  if (existing) {
    existing.x = x;
    existing.z = z;
    existing.pose = p.role;
  } else {
    p.keyframes.push({ time: t, x, z, pose: p.role });
    p.keyframes.sort((a, b) => a.time - b.time);
  }
}

function loadPlay(next) {
  play = next;
  durationInput.value = String(play.duration);
  trajectory.setFromData(play.ball);
  rebuildPlayers();
  applyPlayTime(playTime);
}

// ─── UI ─────────────────────────────────────────────────────────────────────
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toastEl.hidden = true; }, 2200);
}

document.querySelectorAll('[data-tool]').forEach((btn) => {
  btn.addEventListener('click', () => {
    tool = btn.dataset.tool;
    document.querySelectorAll('[data-tool]').forEach((b) => b.classList.toggle('active', b === btn));
    trajectory.setEditMode(tool === 'ball');
    selectPlayer(null);
  });
});

document.getElementById('btnAddPlayer').addEventListener('click', () => {
  const team = document.getElementById('addTeam').value;
  const role = document.getElementById('addRole').value;
  const p = createPlayer(team, role, 0, team === 'A' ? 3 : -3);
  p.keyframes[0].time = playTime;
  play.players.push(p);
  rebuildPlayers();
  selectPlayer(p.id);
});

selRole.addEventListener('change', () => {
  if (!selectedId) return;
  const p = play.players.find((x) => x.id === selectedId);
  if (!p) return;
  p.role = selRole.value;
  const mesh = playerMeshes.get(selectedId);
  setPlayerPose(mesh, p.role);
  syncPlayerKeyframeAtPlayhead(selectedId, mesh.position.x, mesh.position.z);
});

document.getElementById('btnKeyframe').addEventListener('click', () => {
  if (!selectedId) return;
  const mesh = playerMeshes.get(selectedId);
  syncPlayerKeyframeAtPlayhead(selectedId, mesh.position.x, mesh.position.z);
  toast('Keyframe saved at playhead');
});

document.getElementById('btnDelete').addEventListener('click', () => {
  if (!selectedId) return;
  play.players = play.players.filter((p) => p.id !== selectedId);
  selectPlayer(null);
  rebuildPlayers();
});

durationInput.addEventListener('change', () => {
  play.duration = Math.max(2, Math.min(30, parseFloat(durationInput.value) || 6));
});

btnPlay.addEventListener('click', () => {
  playing = !playing;
  btnPlay.textContent = playing ? '⏸' : '▶';
});

scrubber.addEventListener('input', () => {
  playing = false;
  btnPlay.textContent = '▶';
  const u = parseInt(scrubber.value, 10) / 1000;
  applyPlayTime(u * play.duration);
});

document.querySelectorAll('.speed-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    speed = parseFloat(btn.dataset.speed);
    document.querySelectorAll('.speed-btn').forEach((b) => b.classList.toggle('active', b === btn));
  });
});

document.querySelectorAll('.cam-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    cameraPreset = btn.dataset.cam;
    document.querySelectorAll('.cam-btn').forEach((b) => b.classList.toggle('active', b === btn));
    applyCameraPreset(cameraPreset, camera, controls);
  });
});

document.getElementById('btnExport').addEventListener('click', () => {
  play.ball = trajectory.getData();
  const blob = new Blob([serializePlay(play)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'volleyball-play.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('JSON downloaded');
});

document.getElementById('btnImport').addEventListener('click', () => {
  document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', (ev) => {
  const file = ev.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      loadPlay(deserializePlay(reader.result));
      toast('Play imported');
    } catch (e) {
      toast(e.message || 'Import failed');
    }
  };
  reader.readAsText(file);
  ev.target.value = '';
});

document.getElementById('btnShareLink').addEventListener('click', async () => {
  play.ball = trajectory.getData();
  const url = `${location.origin}${location.pathname}${playToHash(play)}`;
  try {
    await navigator.clipboard.writeText(url);
    toast('Share link copied');
  } catch {
    toast('Copy failed — URL in console');
    console.log(url);
  }
});

document.getElementById('btnReset').addEventListener('click', () => {
  playing = false;
  btnPlay.textContent = '▶';
  playTime = 0;
  loadPlay(createDefaultPlay());
  toast('Demo play reset');
});

// ─── Boot: hash or default ──────────────────────────────────────────────────
const fromHash = playFromHash(location.hash);
if (fromHash) {
  loadPlay(fromHash);
} else {
  loadPlay(play);
}
trajectory.setEditMode(false);

function syncSize() {
  const stage = document.getElementById('stage');
  const w = Math.max(1, stage?.clientWidth ?? window.innerWidth);
  const h = Math.max(1, stage?.clientHeight ?? window.innerHeight);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', syncSize);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', syncSize);
}
syncSize();

// ─── Animation loop ─────────────────────────────────────────────────────────
let last = performance.now();
function tick(now) {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (playing) {
    playTime += dt * speed;
    if (playTime >= play.duration) {
      playTime = 0;
    }
    applyPlayTime(playTime);
  }
  controls.update();
  renderer.render(scene, camera);
}
tick(last);
