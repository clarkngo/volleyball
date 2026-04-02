# Changelog — how we write it

We follow **[Keep a Changelog](https://keepachangelog.com/)** (1.1.0) and **[Semantic Versioning](https://semver.org/)** for version numbers once tagged releases exist.

## File

- **`CHANGELOG.md`** lives at the **repository root** (next to `README.md`).

## When to update (post-write)

Update **`[Unreleased]`** in the same change set as the work, or immediately after merge, so “main” always reflects recent history.

## Categories (under `[Unreleased]` or a version)

Use these section headers:

| Section | Use for |
|---------|---------|
| `Added` | New files, features, prototypes, docs |
| `Changed` | Behavior or doc rewrites that aren’t fixes |
| `Fixed` | Bug fixes, incorrect dimensions, broken links |
| `Removed` | Deleted features or files |
| `Security` | Vulnerability fixes |

## Entry style

- **Present tense, imperative mood** or **past tense short phrase** — pick one and stay consistent within the file. Examples:
  - `Add standard FIVB-scale court prototype.`
  - `Fix net height label in HUD.`
- **Link issues/PRs** when relevant: `(#12)`.
- **Avoid noise:** typo-only fixes in internal comments, formatting-only edits, or WIP experiments that never landed do not need a line unless someone relies on them.

## Release flow (later)

1. Rename **`[Unreleased]`** to a version and date, e.g. `## [0.1.0] - 2026-04-02`.
2. Add a new empty **`[Unreleased]`** section at the top.
3. **Tag** the commit: `v0.1.0`.

## Example snippet

```markdown
## [Unreleased]

### Added
- `prototypes/standard-volleyball-court.html` FIVB 18×9 m court with attack lines.

### Fixed
- README prototype list order.
```
