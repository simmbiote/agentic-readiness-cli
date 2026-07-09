## Context

`agentlint-poc` is currently an empty scaffold (just `.claude/` and `openspec/`). This change builds the first working version of the tool: scan a target repo, run a catalog of readiness metrics across six categories, and produce a scored, graded report. No existing code, users, or data to preserve — this is a from-scratch PoC.

## Goals / Non-Goals

**Goals:**
- Define a metrics catalog covering Documentation, Architecture, Testing, Automation Guard Rails, AI Context, and Maintainability, each metric carrying a point value and a concrete detection rule.
- Compute a per-category score and an overall score (points earned / max possible points).
- Map the overall percentage to a letter grade (A+ through F).
- Provide a CLI that runs the scan against a local repo path and prints a readable report.

**Non-Goals:**
- No auto-remediation — the tool reports gaps, it doesn't fix them.
- No deep static/AST analysis of code quality — checks are file-existence and lightweight content-pattern based (e.g., "does README have a Setup section"), not semantic code review.
- No CI integration, web dashboard, or historical trend tracking in this PoC — read one repo, print one report.
- No multi-repo or remote-URL scanning in v1 — local filesystem path only.

## Decisions

1. **Runtime: Node.js/TypeScript CLI.**
   Alternatives considered: Python (common for CLI linters). Chosen Node/TS because it packages as a single `npx`-able CLI, matches the surrounding tooling in this environment (`openspec` itself is an npm package), and keeps everything in one language.

2. **Metrics as declarative data, not hardcoded logic.**
   Each metric is `{ id, category, description, points, check }`, where `check` is a small function operating on a scanned file tree. This separates "what we check" (the catalog, editable independently) from "how we score" (fixed aggregation logic). Alternative — hardcoding checks inline per category — rejected because it makes adding/tuning metrics later harder to review.

3. **Filesystem-signal detection, not content correctness.**
   Metrics detect presence and structural signals (file exists, section header exists, glob pattern matches) rather than validating that content is accurate. This keeps v1 tractable and language-agnostic. Alternative — parsing/validating content semantically — rejected as out of scope for a PoC.

4. **No category weighting; score is a flat point sum.**
   Category score = sum of earned metric points in that category. Overall score = sum across all categories. Grade = overall earned points / overall max points, mapped through a standard academic scale (A+ 97%+, A 93–96%, A− 90–92%, B+ 87–89%, ... F <60%). Alternative — weighting categories differently (e.g., Testing worth more than Documentation) — rejected for v1 to keep the model simple and auditable; can be revisited once real usage shows category imbalance.

5. **CLI output: human-readable table by default, `--json` for machine-readable.**
   Default output is a per-category breakdown (metric-by-metric pass/fail with points) plus the final grade, printed to the terminal. A `--json` flag emits the same data as structured JSON for future CI/tooling integration. Alternative — JSON-only output — rejected because the primary use case in this PoC is a human running the tool locally and reading the result.

6. **Scan excludes common heavy/irrelevant directories.**
   The file walker skips `node_modules`, `.git`, `dist`, `build`, and similar generated/vendored directories by default, to keep scans fast and avoid false signals from vendored code.

7. **Provider detection: independent, non-exclusive for specific tools; tiered fallback for generic/none.**
   `openspec` and `claude` are each detected purely from their own filesystem signal (`openspec/` dir; `CLAUDE.md`/`.claude/`) and can co-occur in the same scan. `universal` only applies when `AGENTS.md` is present and neither specific provider was detected; `none` only applies when nothing was detected at all. Alternative — a single fixed precedence order (e.g., always prefer `openspec` over `claude`) — rejected because a repo can legitimately use both Claude and OpenSpec conventions at once, and picking one would silently drop applicable metrics for the other.

8. **Provider-scoped metrics are cross-cutting and change the max score, not just the AI Context category.**
   A metric may carry an optional `provider` tag; untagged metrics always apply, tagged metrics only apply (count toward earned *and* max) when their provider is in the detected set. This means the overall max score is repo-specific rather than a fixed constant. Alternative — keep a fixed universal max and only vary earned score — rejected because it would unfairly penalize repos whose provider unlocks fewer bonus metrics, and would let provider-scoped metrics leak into categories where they don't apply as unearned "missing" points.

9. **A small git-log reader sits alongside the filesystem walker.**
   Most metrics only need the file tree, but a few (`conventional commits used recently`, `docs updated recently`) need commit history — recent commit subject lines and last-touched dates for specific paths. Rather than growing the walker to understand git, this change adds a narrow git-log adapter (`git log --oneline -20`, `git log -1 --format=%ct -- <path>`) that these specific checks call directly. Alternative — skip git-derived metrics for v1 — rejected because they were explicitly requested in the metrics list and are cheap to implement as a thin adapter.

10. **Heuristic thresholds ship as fixed defaults, documented alongside the metric.**
    Where the metric name implies a judgment call rather than a hard existence check, v1 uses one fixed default per metric rather than leaving it undefined: large-file flag at 800 lines (`no very large source files`, `large files below threshold`); docs freshness at 90 days since last commit touching `docs/` or the README (`docs updated recently`); conventional-commit adoption at ≥70% of the last 20 commits (`conventional commits used recently`); TODO/FIXME density at <0.5% of source lines (`TODO/FIXME count reasonable`). These defaults live next to their metric definitions in the catalog (not scattered through scoring/CLI code) so they can be tuned later without a structural change.

## Risks / Trade-offs

- **Existence checks miss content quality** (e.g., README exists but is empty) → Mitigation: metrics that matter most (README, CLAUDE.md/AGENTS.md) check for required section headers or minimum content, not just file presence.
- **Point values are inherently opinionated** → Mitigation: keep the metrics catalog as an isolated, well-documented data structure so values can be tuned without touching scoring/CLI code.
- **Non-standard repo conventions cause false negatives** (e.g., docs live in an external wiki) → Mitigation: document this as a known limitation; v1 scope is explicitly repo-local signals only.
- **Unbounded directory walks on huge repos could be slow** → Mitigation: skip default-ignored directories; cap walk depth if needed after profiling.
- **Repo-specific max scores make cross-repo grade comparisons misleading** (an `openspec` repo has more applicable points than a `none` repo, so a raw score comparison isn't apples-to-apples) → Mitigation: the letter grade is always a percentage of *that repo's own* applicable max, so grades stay comparable even though raw point totals don't; the CLI report always shows detected provider(s) alongside the grade for context.

## Migration Plan

N/A — greenfield PoC, no existing installation or data to migrate.

## Open Questions

- Should metric point values be configurable per-repo (e.g., a `.agentlintrc`) in v1, or fixed in the catalog for now? Leaning fixed for the PoC; configurability is a natural follow-up change.
- Should metrics support partial credit (e.g., README has some but not all required sections) or stay strictly pass/fail per metric? Leaning pass/fail for v1 simplicity.
- Should the CLI target a single repo path only, or also support scanning multiple paths in one invocation? Leaning single path for v1.
