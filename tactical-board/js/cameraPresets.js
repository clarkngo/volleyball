/** Camera preset positions for tactical board. */
export const CAMERA_PRESETS = {
  orbit: {
    position: [12, 11, 14],
    target: [0, 0.8, 0],
    enableOrbit: true,
  },
  top: {
    position: [0, 22, 0.01],
    target: [0, 0, 0],
    enableOrbit: true,
  },
  coach: {
    position: [14, 9, 12],
    target: [0, 1, 1],
    enableOrbit: true,
  },
  server: {
    position: [0.5, 2.2, 10.5],
    target: [0, 1.5, -2],
    enableOrbit: true,
  },
};

export function applyCameraPreset(name, camera, controls) {
  const p = CAMERA_PRESETS[name] || CAMERA_PRESETS.orbit;
  camera.position.set(...p.position);
  controls.target.set(...p.target);
  controls.enabled = p.enableOrbit !== false;
  controls.update();
}
