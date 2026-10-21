# Volleyball Tactical Board

Interactive **3D tactical board** and play visualizer for coaches and players. Place team silhouettes on an FIVB-scale court, edit ball Bézier arcs, keyframe positions, scrub a timeline, and share plays via JSON or URL hash.

## Quick start

1. Serve the repo root (or open over HTTPS — ES modules need a server):

   ```bash
   cd /path/to/volleyball
   python3 -m http.server 8080
   ```

2. Open **`http://localhost:8080/tactical-board/`**

## Features

| Area | What you get |
|------|----------------|
| **Court** | 18×9 m, net, posts, antennas, attack lines, neon lines, dark floor |
| **Players** | Team A (blue) / B (orange) low-poly silhouettes: setter, attacker, blocker, receiver |
| **Interaction** | Raycast drag on floor (Y=0); ball path handles in *Ball path* mode |
| **Timeline** | Play / pause, scrubber, 0.25×–1.5× speed |
| **Camera** | Free orbit, top-down, coach iso, behind-server presets |
| **Export** | Download JSON, import file, copy share link (`#p=…` in URL) |

## Project layout

```
tactical-board/
  index.html          # Shell + import map (Three.js CDN)
  css/style.css       # Dark UI (sidebar + bottom dock)
  js/
    main.js           # Scene loop, drag, UI wiring
    court.js          # FIVB court mesh
    playerFactory.js  # Pose silhouettes
    trajectory.js     # Ball + dashed Bézier arc
    state.js          # Play model, keyframe sampling, hash/JSON
    cameraPresets.js  # Camera positions
    constants.js      # Court dimensions
```

## GitHub Pages

This repo is already set up for **static hosting from the repository root**.

1. Push `tactical-board/` to `main`.
2. In the repo: **Settings → Pages → Build from branch → `main` / root**.
3. Live URL: `https://<user>.github.io/volleyball/tactical-board/`

No build step required — pure HTML + ES modules + Three.js from unpkg.

## Play JSON format

```json
{
  "version": 1,
  "duration": 6,
  "players": [
    {
      "id": "…",
      "team": "A",
      "role": "setter",
      "keyframes": [{ "time": 0, "x": 1.2, "z": 3.2, "pose": "receiver" }]
    }
  ],
  "ball": {
    "type": "bezier",
    "p0": [x, y, z],
    "p1": [x, y, z],
    "p2": [x, y, z]
  }
}
```

## Tips

- **Select / drag** — move players; positions update a keyframe at the current playhead (or merge if one is within 0.05 s).
- **Keyframe at playhead** — explicitly save role/position for the selected player.
- **Ball path** — drag yellow control points; middle point sets arc height.
- Share links can get long for big plays; prefer JSON export for full libraries.

## Stack

- **Three.js** r170 (CDN import map)
- **OrbitControls** (three/addons)
- Vanilla ES modules — no bundler
