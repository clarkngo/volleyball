/** FIVB court dimensions — 1 Three.js unit = 1 meter */
export const COURT_L = 18;
export const COURT_W = 9;
export const HALF_L = COURT_L / 2;
export const HALF_W = COURT_W / 2;
export const LINE_W = 0.05;
export const ATTACK_DIST = 3;
export const FREE = 3;
export const NET_LENGTH = 9.5;
export const NET_MESH_H = 1.0;
export const NET_TOP = 2.43;
export const NET_CENTER_Y = NET_TOP - NET_MESH_H / 2;
export const POLE_X = HALF_W + 0.5;
export const POLE_H = 2.55;
export const LINE_Y = 0.018;

export const TEAM_A_COLOR = 0x3b82f6;
export const TEAM_B_COLOR = 0xff6b35;
export const TEAM_A_EMISSIVE = 0x2563eb;
export const TEAM_B_EMISSIVE = 0xea580c;

export const POSES = ['setter', 'attacker', 'blocker', 'receiver'];
export const DEFAULT_DURATION = 6;

export function clampCourt(x, z) {
  return {
    x: Math.min(HALF_W - 0.2, Math.max(-HALF_W + 0.2, x)),
    z: Math.min(HALF_L - 0.2, Math.max(-HALF_L + 0.2, z)),
  };
}

export function uid() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
