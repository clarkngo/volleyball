# Lessons learned — building this repo

Practical notes from building the Three.js volleyball prototypes and keeping the repo maintainable.

## Product / domain

- **Model in meters** — Set **1 Three.js unit = 1 meter**. Court math (18×9, 3 m attack line, 5 cm lines) stays readable and matches rulebooks.
- **Lines on floors** — Real lines are ~5 cm wide; use thin **boxes** (or extruded shapes), not `LineBasicMaterial` alone, if you want width in world units. Lift lines **slightly above** the floor (e.g. 1–2 cm) to reduce **z-fighting**.
- **Net geometry (FIVB)** — The **top** of the net is **2.43 m** (men) above the playing surface at court **centre**. The net **fabric** is **1 m** tall vertically and **9.5–10 m** long horizontally between posts — not a 2.43 m–tall plane. Bottom of mesh ≈ **1.43 m**. Place the net **vertical plane on the centre line** (perpendicular to court length). **Posts** are **2.55 m** high and **0.5–1 m** outside the sidelines; **antennas** sit above the sidelines and extend **0.8 m** above the net top.

## Three.js / browser

- **Neon-on-black courts** — Use a **near-black** `scene.background`, **`FogExp2`** for depth, **`MeshBasicMaterial`** for floor lines (constant brightness), and **`emissive` / low `emissiveIntensity`** on the net, ball, and poles so highlights read without blowing out. Weak **point lights** in cyan and magenta add rim without fighting the palette.
- **Player labels** — `CSS2DRenderer` + `CSS2DObject` (`three/addons/renderers/CSS2DRenderer.js`) overlay text on the WebGL canvas; size the overlay on window resize and set `pointer-events: none` on the label layer. When removing labeled objects from the scene, call **`object.element.remove()`** (or equivalent) so old divs are not left stacked in the label layer.
- **WebGL + CSS2D sizing** — Do not assign **`element.style.cssText = ...` after `renderer.setSize()` / `labelRenderer.setSize()`**: `cssText` replaces all inline styles and **wipes the `width`/`height` px** that Three set. The canvas can fall back to wrong intrinsic layout while CSS2D still projects with the stored size → **labels and geometry misaligned**, court shoved to a corner on first paint. Set `position` / `z-index` / `pointer-events` on **separate properties**, then **`setSize` again** (or a shared `syncRenderSize()` on `load` + `requestAnimationFrame` + `resize`).
- **Mobile single-file Three demos** — Use **`viewport-fit=cover`**, **`touch-action: none`** on the **WebGL canvas** (so OrbitControls gets pinch/rotate without the browser stealing gestures), **`100dvh`** / **`visualViewport` `resize`** for sizing when the URL bar shows/hides, and a **bottom-sheet HUD** (`max-height` + `overflow-y: auto` + **`env(safe-area-inset-*)`**) so controls stay reachable. **`font-size: 16px`** on `<select>` / primary buttons avoids iOS zoom-on-focus.
- **USAV zone names** — USA Volleyball uses **zones 1–6** for *court location*: Z1 right back (RB), Z2 right front (RF), Z3 middle front (MF), Z4 left front (LF), Z5 left back (LB), Z6 middle back (**MB** = middle *back*, not “middle blocker” the role). Distinct from **rotation** Roman numerals on a lineup sheet.
- **Tactical overlays** — Use **`ConeGeometry`** with **`setFromUnitVectors(new Vector3(0,1,0), flightDir)`** so local **+Y** (apex) matches the vector from landing point toward contact. A **low radial segment count** (e.g. 3) gives a triangular wedge inside the same window. **RingGeometry** on the floor (transparent, `depthWrite: false`) reads well for “area of responsibility.” Prefer **`openEnded: false`** on cones so shells stay visible from typical camera angles.
- **ES modules** — Put **`import`** at the **top** of `<script type="module">` before other statements; some browsers reject or behave oddly otherwise. **`file://`** pages may fail to load CDN modules — use a tiny static server (`npx serve`). **`CSS2DRenderer`** overlay: **`background: transparent`**, **`z-index`** above the WebGL canvas but below UI HUD.
- **Addons vs `THREE`** — `CSS2DRenderer` / `CSS2DObject` come from **`three/addons/...`** as **named imports**. Use **`new CSS2DRenderer()`**, not **`new THREE.CSS2DRenderer()`** (the latter is undefined on the core namespace and breaks on GitHub Pages once the module actually loads).
- **ES modules + import map** — Single-file prototypes load Three from a **CDN** with a pinned version (`unpkg.com/.../three@0.170.0/...`). Pinning avoids silent API breaks.
- **OrbitControls** — Great for **authoring and demos**; swap for a gameplay camera when you add interaction loops.
- **Shadows** — Directional light + `shadow.camera` frustum must cover the **whole court**; expand `left/right/top/bottom` when the floor grows (free zone).
- **Fog** — Hides edge of world; tune `near/far` when court size changes so the scene doesn’t look clipped.

## Process

- **Prototype before framework** — Validate scale and look in static HTML before Vite/npm if you want zero tooling friction.
- **Pre-write** — Before a new prototype: skim **[IDEAS.md](./IDEAS.md)** and **[PRE_WRITE.md](./PRE_WRITE.md)** so you do not redo a planned or shipped idea.
- **Post-write** — After changes: open files, check console, update **README** and **CHANGELOG** (see **[POST_WRITE.md](./POST_WRITE.md)**).

## References

### Three.js

- [Three.js manual](https://threejs.org/manual/) — fundamentals, lights, cameras.
- [Three.js docs](https://threejs.org/docs/) — API reference.
- [examples/jsm](https://github.com/mrdoob/three.js/tree/dev/examples/jsm) — `OrbitControls` and addons paths match import map `three/addons/`.

### Volleyball rules / dimensions

- [FIVB — Rules of the Game](https://www.fivb.com/en/thegame/rules) — official source for court and net (confirm current edition for competitions).
- Wikipedia summaries (cross-check against FIVB): [Volleyball court](https://en.wikipedia.org/wiki/Volleyball#Court_dimensions), [Net height](https://en.wikipedia.org/wiki/Volleyball#Net).

### Changelog / versioning

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)

### Web platform

- [MDN — JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [MDN — import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)
