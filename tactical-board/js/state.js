import * as THREE from 'three';
import { DEFAULT_DURATION, uid } from './constants.js';

/** Default demo: receive → set → approach on one side. */
export function createDefaultPlay() {
  return {
    version: 1,
    duration: DEFAULT_DURATION,
    players: [
      {
        id: uid(),
        team: 'A',
        role: 'receiver',
        keyframes: [
          { time: 0, x: -2.2, z: 5.5, pose: 'receiver' },
          { time: 2.2, x: -2.0, z: 5.2, pose: 'receiver' },
        ],
      },
      {
        id: uid(),
        team: 'A',
        role: 'setter',
        keyframes: [
          { time: 0, x: 1.2, z: 3.2, pose: 'receiver' },
          { time: 2.5, x: 0.4, z: 1.6, pose: 'setter' },
          { time: 5.5, x: 0.35, z: 1.5, pose: 'setter' },
        ],
      },
      {
        id: uid(),
        team: 'A',
        role: 'attacker',
        keyframes: [
          { time: 0, x: -3.8, z: 4.0, pose: 'receiver' },
          { time: 3.0, x: -2.8, z: 2.2, pose: 'attacker' },
          { time: 4.2, x: -2.2, z: 1.1, pose: 'attacker' },
        ],
      },
      {
        id: uid(),
        team: 'B',
        role: 'blocker',
        keyframes: [
          { time: 0, x: -1.0, z: -0.8, pose: 'blocker' },
          { time: 4.0, x: -1.2, z: -0.6, pose: 'blocker' },
        ],
      },
      {
        id: uid(),
        team: 'B',
        role: 'receiver',
        keyframes: [
          { time: 0, x: 2.5, z: -6.0, pose: 'receiver' },
        ],
      },
    ],
    ball: {
      type: 'bezier',
      p0: [-2.0, 1.0, 5.8],
      p1: [-0.3, 2.8, 3.0],
      p2: [0.35, 1.15, 1.55],
    },
  };
}

export function createPlayer(team, role, x = 0, z = 2) {
  return {
    id: uid(),
    team,
    role,
    keyframes: [{ time: 0, x, z, pose: role }],
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Sample player x/z/pose at play time (seconds). */
export function samplePlayer(player, time) {
  const kf = [...player.keyframes].sort((a, b) => a.time - b.time);
  if (!kf.length) return { x: 0, z: 0, pose: player.role };
  if (time <= kf[0].time) return { ...kf[0] };
  if (time >= kf[kf.length - 1].time) return { ...kf[kf.length - 1] };
  for (let i = 0; i < kf.length - 1; i++) {
    const a = kf[i];
    const b = kf[i + 1];
    if (time >= a.time && time <= b.time) {
      const t = (time - a.time) / Math.max(1e-6, b.time - a.time);
      const s = t * t * (3 - 2 * t);
      return {
        x: lerp(a.x, b.x, s),
        z: lerp(a.z, b.z, s),
        pose: t < 0.5 ? a.pose : b.pose,
      };
    }
  }
  return { ...kf[kf.length - 1] };
}

export function sampleBall(ball, time, duration) {
  const u = Math.min(1, Math.max(0, time / Math.max(0.01, duration)));
  const s = u * u * (3 - 2 * u);
  const p0 = new THREE.Vector3().fromArray(ball.p0);
  const p1 = new THREE.Vector3().fromArray(ball.p1);
  const p2 = new THREE.Vector3().fromArray(ball.p2);
  const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
  return curve.getPoint(s);
}

export function serializePlay(play) {
  return JSON.stringify(play, null, 2);
}

export function deserializePlay(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  if (!data || data.version !== 1 || !Array.isArray(data.players)) {
    throw new Error('Invalid play JSON');
  }
  return data;
}

export function playToHash(play) {
  const compact = JSON.stringify(play);
  return `#p=${encodeURIComponent(compact)}`;
}

export function playFromHash(hash) {
  if (!hash || !hash.startsWith('#p=')) return null;
  try {
    return deserializePlay(decodeURIComponent(hash.slice(3)));
  } catch {
    return null;
  }
}
