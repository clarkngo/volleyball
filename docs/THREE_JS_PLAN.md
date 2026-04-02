# Three.js revamp — plan

## Goal

Rebuild the volleyball experience as a **browser-based 3D scene** (court, ball, optional characters) using **Three.js**, with room to grow into drills, replays, or RiftRetail-style UI overlays later.

## Prototypes (this repo)

| File | What it proves |
|------|----------------|
| `prototypes/01-court-scene.html` | Scale, materials, lighting, orbit camera — “does it feel like a space?” |
| `prototypes/02-ball-arc.html` | Time-based animation + simple physics-ish motion (serve arc) |

Open any `.html` in a browser (double-click or “Open with Live Server”). **Requires network** the first time to load Three.js from the CDN.

## Recommended stack (after prototypes)

- **Three.js** (r170+) — scene graph, WebGL2.
- **Optional:** `vite` + `three` npm package for bundling, tree-shaking, and TypeScript.
- **Controls:** `OrbitControls` for dev; later **custom camera** for game-like follow or fixed broadcast angles.
- **Animation:** `requestAnimationFrame` + manual lerp/splines first; consider **Rapier** or **cannon-es** only if you need real collisions.

## Phases

1. **Prototype** — validate look + performance on your target devices (done with `prototypes/`).
2. **Scene kit** — extract court/net/ball into modules; consistent units (e.g. 1 unit = 1 m).
3. **Interaction** — click/tap to serve, slider for power, or keyboard.
4. **Polish** — shadows, environment map, post-processing (bloom optional), responsive resize.
5. **Content** — tie to your app (scores, drills, or shop UI as HTML/CSS overlay on canvas).

## Open decisions

- **Style:** low-poly / flat vs PBR stadium look.
- **Camera:** fixed sideline vs orbit vs follow-ball.
- **Multiplayer / replay:** out of scope until single-player loop feels good.
