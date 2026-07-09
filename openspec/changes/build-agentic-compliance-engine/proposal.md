## Why

Teams adopting agentic coding tools (Claude Code, Cursor, etc.) get wildly inconsistent results depending on whether the target repo actually supports agent work — explicit docs, protected architecture, verifiable tests, guardrails, and repo-level AI context. There's no quick way to tell if a repo is "agent-ready" before investing in agentic workflows. `agentlint` scans a repo and produces a scored, graded readiness report so teams can see gaps and track improvement over time.

## What Changes

- Add a repo scanner that inspects a target repository's filesystem for agent-readiness signals (files, sections, configs, CI rules).
- Add a set of scored metrics grouped into six categories: Documentation, Architecture, Testing, Automation Guard Rails, AI Context, and Maintainability.
- Add provider detection: identify which agentic tooling convention(s) a repo uses — `openspec`, `claude`, `universal` (generic `AGENTS.md`), or `none` — and apply provider-specific custom metrics on top of the base catalog, cutting across any of the six categories.
- Add a scoring engine that sums per-metric points into category scores and an overall score, then maps the overall score to a letter grade (A+ through F) based on percentage of max possible points, where only metrics applicable to the detected provider(s) count toward earned/max totals.
- Add a CLI command that runs the scan against a repo path and prints a category-by-category breakdown, the detected provider(s), and the final grade.

## Capabilities

### New Capabilities
- `provider-detection`: Determines which agentic-tooling provider(s) a repo uses — `openspec` (an `openspec/` directory), `claude` (`CLAUDE.md`/`.claude/`), `universal` (a generic `AGENTS.md` with no specific-tool signal), or `none` (no signal at all) — and exposes that set to metrics and scoring.
- `readiness-metrics`: Defines the six scoring categories (Documentation, Architecture, Testing, Automation Guard Rails, AI Context, Maintainability), each with ~7-10 base metrics and point values (e.g., README sections, ADR index, CI test execution, AGENTS.md/CLAUDE.md coverage, conventional-commit adoption) — plus provider-scoped metrics that only apply when their tagged provider is in the detected set.
- `readiness-scoring`: Aggregates applicable metric results (base + provider-scoped) into category scores and an overall score, maps the overall percentage to a letter grade (A+ to F), and reports which provider(s) were detected.
- `readiness-cli`: Command-line entry point that runs the scanner + scoring engine against a target repo path and renders a human-readable report (detected providers, per-category scores, overall grade).

### Modified Capabilities
(none — this is a new project)

## Impact

- New codebase under `agentlint-poc` (currently empty aside from `.claude/` and `openspec/`).
- No existing code, specs, or dependencies affected.
- Establishes the metric definitions as the contract other capabilities (scoring, CLI) depend on — changes to metric point values later will require updating `readiness-metrics` spec.
