# Post-write checklist

Use this after a meaningful change (feature, fix, doc, or prototype) so the repo stays shippable and history stays honest.

## 1. Verify what you shipped

- **Run or open the thing** — e.g. open `prototypes/*.html` in a browser, watch the devtools **Console** for module or WebGL errors.
- **Smoke the happy path** — orbit camera, resize window, replay buttons (if any).
- **Cross-browser spot check** (optional but valuable): one Chromium-based browser + Safari or Firefox.

## 2. Align docs with reality

- **README** — if paths, ports, prerequisites, or “how to run” changed, update the root README.
- **In-repo specs** — if `docs/THREE_JS_PLAN.md` or architecture notes are wrong, fix them in the same PR/commit as the code.

## 3. Dependencies and security

- **Pin CDN versions** in HTML import maps (e.g. `three@0.170.0`) so prototypes do not drift silently.
- **No secrets** in HTML, JS, or markdown (API keys, DB passwords, `.env` contents).

## 4. Git hygiene

- **One logical change per commit** when practical; message should state *what* and *why* in normal language.
- **Optional:** prefixes like `feat:`, `fix:`, `docs:` help readers scan history.

## 5. Changelog (post-write)

After user-visible or maintainer-visible work, add an entry under **`[Unreleased]`** in **`CHANGELOG.md`** at the repo root.

See **[CHANGELOG_GUIDE.md](./CHANGELOG_GUIDE.md)** for format, categories, and when *not* to log something.

**Minimum bar:** if you would tell another developer “pull main, here’s what changed,” it probably belongs in the changelog.

## 6. Optional polish

- **Performance:** reduce pixel ratio on weak GPUs if you add heavy shaders later.
- **Accessibility:** if you add UI beyond a HUD div, consider focus order and labels.

---

**TL;DR:** run it → fix console errors → update README/docs if needed → append **`CHANGELOG.md`** → commit.
