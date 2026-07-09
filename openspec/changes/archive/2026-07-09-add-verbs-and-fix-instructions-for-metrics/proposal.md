## Why

Every metric's `description` is checklist-style ("README exists", "CI runs tests") — clear as a pass/fail label in the per-metric report line, but confusing in the Top Improvements list, where a *failing* metric's description is shown as if it were already true (e.g. "CONTRIBUTING.md exists [Documentation] (+10 pts)" for a repo that has no CONTRIBUTING.md). Top Improvements exists specifically to tell the user what to do next, so it needs verb-led, actionable text instead of a restated checklist label.

## What Changes

- Add a required `instruction` field to every metric in the catalog (all ~52 metrics, across all 6 category files): an imperative, verb-led sentence describing the fix (e.g. "Add a CONTRIBUTING.md file", "Set up CI to run your test command", "Create an ADR index"). `description` is unchanged and continues to label the per-metric checklist line.
- Change the Top Improvements list (both the text report and JSON `topImprovements`) to display each entry's `instruction` instead of its `description`.
- Add a required `remediation` field to every metric: a longer explanation of what the check means and what's expected to satisfy it (1-3 sentences), distinct from the short `instruction`.
- Add a `--detailed` CLI flag. In the text report, it shows each *failing* metric's `remediation` text indented beneath that metric's line; passed metrics and all other sections are unaffected. In JSON, `--json --detailed` adds a `remediation` field to each metric result; without `--detailed`, `--json` output has no `remediation` field (matching the existing `--summary` trimming pattern, but expanding instead of trimming).
- Add a `docs:metrics` script that generates `docs/METRICS.md` from the metric catalog — a table with columns Category, Metric, Points, Description, Instruction, Remediation — and link to it from `README.md`. The catalog (`src/metrics/*.ts`) remains the single source of truth; the doc is generated output, not hand-maintained.
- **BREAKING** (JSON shape): `topImprovements` entries change from `{ id, category, description, points }` to `{ id, category, instruction, points }`.

## Capabilities

### New Capabilities

- `metrics-documentation`: generating a human-browsable `docs/METRICS.md` reference table from the metric catalog, and linking it from the README.

### Modified Capabilities

- `readiness-metrics`: "Metric Catalog Structure" requirement changes to require `instruction` and `remediation` fields on every metric, in addition to the existing `description`.
- `readiness-scoring`: "Top Improvements Ranking" requirement changes so ranked entries carry `instruction` instead of `description`.
- `readiness-cli`: "Top Improvements Section" requirement changes to render each entry's `instruction` instead of its `description`; "Human-Readable Report Output" and "JSON Output Mode" requirements change to support `--detailed`.

## Impact

- `src/metrics/types.ts`: add `instruction: string` and `remediation: string` to the `Metric` interface.
- `src/metrics/{documentation,architecture,testing,automation-guardrails,ai-context,maintainability}.ts`: add `instruction` and `remediation` strings to every metric definition (~52 metrics).
- `src/scoring.ts`: change `TopImprovement` to carry `instruction` instead of `description`; carry `remediation` on `MetricResult` so the report/JSON layers can render it under `--detailed`.
- `src/report.ts`: render `improvement.instruction` in the Top Improvements section; add a `--detailed` rendering mode that prints `remediation` beneath each failing metric line.
- `src/cli.ts`: parse `--detailed`; when combined with `--json`, include `remediation` per metric in the serialized output (omitted otherwise).
- New script (e.g. `scripts/generate-metrics-doc.ts` or similar) run via `npm run docs:metrics`, reading the catalog and writing `docs/METRICS.md`.
- `README.md`: link to `docs/METRICS.md`; document `--detailed`.
- Existing `--json` consumers of `topImprovements[].description` will need to switch to `.instruction`.
- No change to scoring math, provider detection, or the `scan`/`--summary` CLI surface otherwise.
