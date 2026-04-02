# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) when version tags are used.

How to add entries after a change: see **[docs/CHANGELOG_GUIDE.md](docs/CHANGELOG_GUIDE.md)**.

## [Unreleased]

### Changed

- **Net (FIVB):** length **9.5 m**, mesh height **1 m**, top at **2.43 m** (men) at court centre, plane on **z = 0**; posts **2.55 m** at **0.5 m** outside sidelines; antennas **0.8 m** above net top (`standard-volleyball-court`, `01`, `02`).
- All court prototypes: **neon night** look — black background, fog, emissive net/ball, colored boundary/center/attack lines, fill lights.

### Added

- **`index.html`** — homepage with links to all prototypes (GitHub Pages–friendly).
- `prototypes/05-outside-hitter-defense.html` — perimeter vs rotational defense vs outside hitter; lerp animation; role-specific silhouettes; toggles for floor rings and attack cone / triangular wedge / trajectory.
- `prototypes/04-player-positions.html` — **USAV** court zones **Z1–Z6** (RB/RF/MF/LF/LB/MB), two teams, stylized figures, **CSS2D** labels, formation presets.
- `docs/POST_WRITE.md` — post-write checklist (verify, docs, changelog, git).
- `docs/CHANGELOG_GUIDE.md` — how to maintain this changelog.
- `docs/LESSONS_LEARNED.md` — build notes and references (Three.js, FIVB, tooling).
- `CHANGELOG.md` — project history (this file).
- `prototypes/standard-volleyball-court.html` — FIVB-scale 18×9 m court, 5 cm lines, attack lines, net, free zone.
- `prototypes/01-court-scene.html` — stylized court scene with orbit controls.
- `prototypes/02-ball-arc.html` — Bézier arc animation with replay.
- `docs/THREE_JS_PLAN.md` — Three.js direction and phases.

### Changed

- `README.md` — prototype index, standard court callout, maintainer links to docs.
