import * as THREE from 'three';
import {
  TEAM_A_COLOR, TEAM_B_COLOR, TEAM_A_EMISSIVE, TEAM_B_EMISSIVE, POSES,
} from './constants.js';

function limb(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true;
  return m;
}

/** Low-poly silhouette with pose sub-groups (only one visible). */
export function createPlayerMesh(team, role = 'receiver') {
  const group = new THREE.Group();
  group.userData.type = 'player';

  const color = team === 'A' ? TEAM_A_COLOR : TEAM_B_COLOR;
  const emissive = team === 'A' ? TEAM_A_EMISSIVE : TEAM_B_EMISSIVE;
  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.45,
    metalness: 0.15,
    emissive: new THREE.Color(emissive),
    emissiveIntensity: 0.35,
  });
  const limbMat = bodyMat.clone();
  limbMat.emissiveIntensity = 0.5;

  const poses = {};
  for (const p of POSES) {
    const poseGroup = new THREE.Group();
    poseGroup.name = `pose_${p}`;

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.72, 12), bodyMat);
    torso.position.y = 0.88;
    torso.castShadow = true;
    poseGroup.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), bodyMat);
    head.position.y = 1.42;
    head.castShadow = true;
    poseGroup.add(head);

    if (p === 'setter') {
      const lArm = limb(0.1, 0.42, 0.1, limbMat);
      lArm.position.set(-0.28, 1.35, 0);
      lArm.rotation.z = 0.35;
      const rArm = limb(0.1, 0.42, 0.1, limbMat);
      rArm.position.set(0.28, 1.35, 0);
      rArm.rotation.z = -0.35;
      poseGroup.add(lArm, rArm);
    } else if (p === 'attacker') {
      const lArm = limb(0.1, 0.38, 0.1, limbMat);
      lArm.position.set(-0.2, 1.1, 0.15);
      lArm.rotation.x = -0.5;
      const rArm = limb(0.1, 0.48, 0.1, limbMat);
      rArm.position.set(0.35, 1.25, -0.2);
      rArm.rotation.x = -1.1;
      rArm.rotation.z = -0.3;
      torso.rotation.x = 0.12;
      poseGroup.add(lArm, rArm);
    } else if (p === 'blocker') {
      const lArm = limb(0.1, 0.5, 0.1, limbMat);
      lArm.position.set(-0.32, 1.45, 0);
      const rArm = limb(0.1, 0.5, 0.1, limbMat);
      rArm.position.set(0.32, 1.45, 0);
      torso.position.y = 1.05;
      head.position.y = 1.58;
      poseGroup.add(lArm, rArm);
    } else {
      const lLeg = limb(0.14, 0.42, 0.14, limbMat);
      lLeg.position.set(-0.14, 0.42, 0.1);
      const rLeg = limb(0.14, 0.42, 0.14, limbMat);
      rLeg.position.set(0.14, 0.42, 0.1);
      torso.position.y = 0.72;
      head.position.y = 1.22;
      torso.rotation.x = 0.25;
      const arms = limb(0.55, 0.08, 0.12, limbMat);
      arms.position.set(0, 0.78, 0.22);
      arms.rotation.x = -0.15;
      poseGroup.add(lLeg, rLeg, arms);
    }

    poseGroup.visible = p === role;
    poses[p] = poseGroup;
    group.add(poseGroup);
  }

  group.userData.poses = poses;
  group.userData.role = role;

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.52, 28),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  ring.name = 'selectionRing';
  group.add(ring);

  return group;
}

export function setPlayerPose(group, role) {
  group.userData.role = role;
  for (const [name, poseGroup] of Object.entries(group.userData.poses)) {
    poseGroup.visible = name === `pose_${role}`;
  }
}

export function setSelected(group, on) {
  const ring = group.getObjectByName('selectionRing');
  if (ring) ring.material.opacity = on ? 0.55 : 0;
}

export function setPlayerPosition(group, x, z) {
  group.position.set(x, 0, z);
}
