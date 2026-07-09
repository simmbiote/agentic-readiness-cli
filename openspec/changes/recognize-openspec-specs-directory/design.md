## Context

`documentation.docs-specs-exists` and `ai-context.docs-specs-exists` both call `ctx.hasPath('docs/specs')` directly, with no awareness of OpenSpec's own specs convention at `openspec/specs/`. This mirrors the existing `adrDir(ctx)` helper in `src/metrics/helpers.ts`, which resolves a single canonical ADR directory path (`docs/adr`) — but unlike ADRs, specs already have a second real, tool-generated convention (`openspec/specs/`) that this codebase itself uses.

## Goals / Non-Goals

**Goals:**
- Stop penalizing OpenSpec-convention repos for not duplicating their specs under `docs/specs/`.
- Keep the fix scoped to detection logic only — no change to point values, categories, or metric text.

**Non-Goals:**
- No change to `adrDir(ctx)` or ADR-related metrics — OpenSpec has no equivalent canonical ADR directory (its closest analog, per-change `design.md`, already has its own dedicated `openspec.design-docs-present` provider-scoped metric).
- No new provider-scoped metric — `docs-specs-exists` stays a base metric; only its `check` function becomes provider-aware.
- No generalized "path aliases per provider" system — this is a targeted fix for one known real-world case, not a configurable mapping layer.

## Decisions

**`openspec/specs/` only counts when `openspec` is in the detected provider set — not merely because the directory exists.**
A stray `openspec/specs/` directory left over from an abandoned OpenSpec experiment (with no other OpenSpec signals) shouldn't count as "specs are documented," since the repo isn't actually following the convention. Gating on provider detection (already computed once per scan via `provider-detection`) keeps this consistent with how every other provider-scoped bonus metric works, even though this specific metric remains a base metric applicable to all repos.

**New `specsDir(ctx)` helper, not a change to `adrDir(ctx)`'s pattern or a shared generic helper.**
`specsDir` takes the same shape as `adrDir` (`ScanContext → string | null`) for consistency, but is its own function — `docs-specs-exists` and ADR checks have different fallback rules (specs has a provider fallback; ADRs don't), so a shared abstraction would need a branching parameter for no real reuse benefit.

**Check order: `docs/specs` first, `openspec/specs` second.**
If a repo somehow has both (e.g. mid-migration), `docs/specs` wins arbitrarily — the check only needs a boolean pass/fail, so which directory "wins" has no observable effect beyond this internal resolution order.

## Risks / Trade-offs

- [Risk] A repo with `openspec` detected via unrelated signals (e.g. a leftover `openspec/` directory from a different tool) but no real spec-driven workflow could pass this check without meaningful specs. → Mitigation: accepted — this is the same provider-detection trust boundary every other OpenSpec-scoped metric already relies on; `provider-detection`'s OpenSpec signal already requires an `openspec/` directory to exist, which is a reasonable proxy.
- [Risk] Fixing this changes this project's own score (this repo's Documentation and AI Context categories will show higher earned points after this change). → Mitigation: expected and desired — that's the bug being fixed, not a side effect to guard against.

## Migration Plan

No data migration. Purely a detection-logic change inside two existing metrics' `check` functions; no JSON/report shape changes.
