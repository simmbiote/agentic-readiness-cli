## Context

`src/report.ts` renders `ScoringResult` (from `src/scoring.ts`) as a flat, uncolored text block: a provider line, then per-category `earned/max` headers each followed by `[x]`/`[ ]` metric lines, then an `Overall: earned/max (pct%) — Grade: X` line. `src/scoring.ts` computes `ScoringResult` with no derived rankings — `categories[].metrics[]` already carries every metric's `passed`/`points`/`category`/`description`, so a "top failing metrics" ranking can be derived from data that already exists, in `scoreRepo`, without touching detection or the scoring math. The project has no runtime `dependencies` today (only `devDependencies`); adding color output introduces the project's first one.

## Goals / Non-Goals

**Goals:**
- Color the existing report elements (pass/fail marks, category scores, overall grade) without changing what information is shown.
- Add a ranked "Top Improvements" list (5 highest-point failing metrics) to both the text report and `ScoringResult`/JSON.
- Reorder the text report to lead with Overall, then Top Improvements, then detected providers, then the full category/metric breakdown.
- Show each category's percentage alongside its earned/max score in the report.
- Keep color output opt-out automatic: plain text when stdout isn't a TTY, so piping to a file or CI log stays clean.

**Non-Goals:**
- No change to metric detection, provider detection, category weighting, or grade boundaries.
- No interactive/progress-bar UI, no configurable color themes, no `--no-color`/`--color` flags (TTY detection is sufficient for v1).
- No change to the `--json` flag's overall shape beyond the two new fields (`topImprovements`, per-category `percentage`).

## Decisions

**Color library: `picocolors` over `chalk` or hand-rolled ANSI codes.**
`picocolors` is ~2kB, zero-dependency, and does its own TTY/`NO_COLOR`/`FORCE_COLOR` detection identically to what Node tooling (Vite, PostCSS, etc.) already relies on — so "disable color when not a TTY" comes for free instead of being reimplemented. `chalk` v5 is ESM-only and heavier for what's needed here (a handful of `red`/`green`/`yellow`/`bold` wrappers). Hand-rolled codes would require reimplementing TTY detection and `NO_COLOR` handling ourselves for no benefit.

**Ranking computed in `scoreRepo` (scoring.ts), not in `report.ts`.**
`topImprovements` is added as a field on `ScoringResult` (populated once, in `scoreRepo`) rather than derived ad hoc inside `renderReport`. This keeps `ScoringResult` the single source of truth consumed identically by both the text renderer and `--json` mode, matching how `overall` is already computed once and rendered two ways. Alternative considered: compute the ranking only in `report.ts` and skip adding it to JSON — rejected per the proposal's requirement that JSON tooling/CI consumers get the same ranking without recomputing it from `categories`.

**Ranking rule: flatten all applicable metrics across categories, filter to `passed === false`, sort by `points` descending, take 5.**
Ties (equal points) are broken by each metric's position in category iteration order (`CATEGORIES` order, then within-category order) — i.e. a stable sort, no secondary tiebreak field needed. This matches the "Top 5 failed metrics by point value" scope agreed with the user (as opposed to one-per-weakest-category), and requires no new data beyond what `MetricResult` already has (`points`, `passed`, `category`, `description`).

**Color mapping:**
- Metric mark: green `[x]` when passed, red `[ ]` when failed.
- Category `earned/max`: green if `earned/max >= 0.8`, yellow if `>= 0.5`, red otherwise (same thresholds reused for the overall line).
- Overall grade letter: green for A-range, yellow for B/C-range, red for D/F.
- Top Improvements entries: printed in red/bold to stand out as action items (they're all failing metrics by definition).

These thresholds are a presentation-only judgment call with no spec-testable boundary beyond "high/mid/low"; exact cutoffs live in `report.ts` as implementation detail, not in the spec scenarios (scenarios only assert that passed vs. failed, and higher vs. lower grades, render with different colors).

**Report section order: Overall → Top Improvements → Detected providers → category/metric breakdown.**
This leads with the two things a user checks first (their grade, and what to fix next) before the provider context line and the full per-metric detail, which are more reference-like than actionable. Alternative considered: keep providers first (as today) since it explains *why* the AI Context category may score differently — rejected because it delays the score/grade, which is the report's primary payload, behind a context line most users only need when digging into AI Context specifically.

**Category percentage: computed the same way as `overall.percentage` (`earned/max*100`, 0 when `max` is 0), stored as a new `percentage` field on `CategoryScore`.**
Storing it on `CategoryScore` (rather than computing it ad hoc in `report.ts`) keeps it consistent with how `overall.percentage` is already a stored field, and makes it available to `--json` consumers for free. Alternative considered: compute it only in the renderer — rejected for the same single-source-of-truth reason as `topImprovements`.

## Risks / Trade-offs

- [Risk] Snapshot/string-matching tests against `renderReport` output will break once ANSI codes are interposed. → Mitigation: existing report tests should assert on stripped/plain content (or run with `NO_COLOR=1` / non-TTY stdout in the test harness, which `picocolors` already honors) rather than exact color codes.
- [Risk] A repo with fewer than 5 failing metrics (e.g. a perfect score) has an empty or short Top Improvements list. → Mitigation: render nothing (omit the section) when there are zero failing metrics; render fewer than 5 entries when fewer than 5 exist — no padding or placeholder rows.
- [Risk] Introducing the project's first runtime dependency increases install footprint and supply-chain surface. → Mitigation: `picocolors` is a single small, dependency-free, widely-used package (already a transitive dependency of much of the JS tooling ecosystem); acceptable trade-off for the readability gain.

## Migration Plan

No data migration. This is additive to the JSON shape (`topImprovements` is a new optional-in-spirit field, always present but may be an empty array) and purely presentational for the text report. Existing consumers of `--json` output that ignore unknown fields are unaffected; consumers doing strict schema validation will need to allow the new field.
