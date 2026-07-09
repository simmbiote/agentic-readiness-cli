## 1. Dependencies

- [x] 1.1 Add `picocolors` to `dependencies` in `package.json` and install it

## 2. Scoring: Top Improvements Ranking and Category Percentage

- [x] 2.1 Add `TopImprovement` type and `topImprovements: TopImprovement[]` field to `ScoringResult` in `src/scoring.ts`
- [x] 2.2 In `scoreRepo`, flatten all applicable metric results across categories, filter to `passed === false`, sort descending by `points` (stable sort preserves `CATEGORIES`/within-category order for ties), and take the first 5 to populate `topImprovements`
- [x] 2.3 Add a `percentage` field to `CategoryScore` in `src/scoring.ts`, computed the same way as `overall.percentage` (`earned/max*100`, 0 when `max` is 0)
- [x] 2.4 Add/update unit tests in `tests/scoring.test.ts` covering: more than 5 failing metrics (top 5 by points), fewer than 5 failing metrics, zero failing metrics (empty array), a tie broken by category order, category percentage computed correctly, and category percentage of 0 when max is 0

## 3. Report: Reorder, Color, and Category Percentage

- [x] 3.1 In `src/report.ts`, reorder `renderReport` output to: overall score/grade, Top Improvements section, detected providers, then the category/metric breakdown
- [x] 3.2 Show each category's `percentage` alongside its earned/max score in the category heading (e.g. `Documentation: 35/110 (31.8%)`)
- [x] 3.3 Import `picocolors` and detect color support via its TTY/`NO_COLOR` handling (no custom flag needed)
- [x] 3.4 Color each metric mark: green when passed, red when failed
- [x] 3.5 Color category and overall earned/max/percentage by percentage band (green >=80%, yellow 50-79%, red <50%)
- [x] 3.6 Color the overall grade letter by grade band (green A-range, yellow B/C-range, red D/F)
- [x] 3.7 Verify no ANSI codes are emitted when stdout is not a TTY (picocolors' default behavior) — add a test that forces non-TTY/`NO_COLOR` and asserts plain output

## 4. Report: Top Improvements Section

- [x] 4.1 In `renderReport`, immediately after the Overall line, append a "Top Improvements" section listing each `topImprovements` entry's description, category, and point value
- [x] 4.2 Omit the section entirely when `topImprovements` is empty, so the detected-providers line follows the Overall line directly
- [x] 4.3 Add/update tests in `tests/cli.test.ts` (or a new `tests/report.test.ts`) covering: full section order (overall → top improvements → providers → categories), section omitted for an empty list, and category headings showing percentage

## 5. Verification

- [x] 5.1 Run `npm run build && npm test` and confirm all tests pass
- [x] 5.2 Run `node dist/cli.js .` against this repo and visually confirm the new section order, colored output, category percentages, and a Top Improvements section
- [x] 5.3 Run `node dist/cli.js . --json | jq '.topImprovements, .categories[0].percentage'` and confirm both fields are present and correct
- [x] 5.4 Run `node dist/cli.js . > /tmp/report.txt` and confirm the redirected file contains no ANSI escape codes
