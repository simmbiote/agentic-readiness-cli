## Why

The current human-readable report is a flat, uncolored text dump — every pass and fail looks the same at a glance, and after reading a long metric list the user still has to manually scan for what to fix first. Adding color and a ranked "top improvements" list makes the report immediately actionable: a user can see their grade and their next 5 highest-value fixes without re-reading the whole breakdown.

## What Changes

- Add ANSI color to the human-readable report: pass/fail marks, category earned/max scores, and the overall grade are colored (e.g. green for passed/high grades, red for failed/low grades, yellow for mid-range), using a lightweight color library (no other layout changes).
- Add a "Top Improvements" ranking: the 5 currently-failing metrics with the highest point value, across all categories, sorted descending by point value (ties broken by category order). Each entry shows the metric description, category, and point value.
- Reorder the human-readable report top-to-bottom to lead with the most actionable information: (1) Overall score/grade, (2) Top Improvements, (3) Detected providers, (4) the full category/metric breakdown.
- Each category heading in the breakdown SHALL show its percentage alongside its earned/max score (e.g. `Documentation: 35/110 (31.8%)`).
- Add a `topImprovements` array and a per-category `percentage` field to the JSON output (`ScoringResult`) so tooling/CI can consume the same ranking and percentages without re-deriving them from `earned`/`max`.
- Color output SHALL be automatically disabled when stdout is not a TTY (e.g. piped to a file or CI log) to keep plain-text consumers unaffected.

## Capabilities

### New Capabilities

(none — this extends existing capabilities)

### Modified Capabilities

- `readiness-cli`: "Human-Readable Report Output" requirement changes to include color-coded output, the new section order, per-category percentages, and a new Top Improvements section.
- `readiness-scoring`: "Scoring Result Structure" and "Category Score Aggregation" requirements change to include a `topImprovements` field and a per-category `percentage` field.

## Impact

- `src/report.ts`: rewrite rendering to add color, the new section order, per-category percentages, and the Top Improvements section; add TTY detection.
- `src/scoring.ts`: compute the top-5 ranked list and per-category percentage, and include both in `ScoringResult`.
- New dependency: a small ANSI color library (e.g. `picocolors`) added to `dependencies`.
- No changes to metric detection, provider detection, or scoring math — this only adds a derived ranking and presentation changes.
