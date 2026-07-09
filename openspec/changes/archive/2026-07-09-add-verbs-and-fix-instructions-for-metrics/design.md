## Context

`Metric` (`src/metrics/types.ts`) currently has one text field, `description`, used for two purposes: the per-metric checklist line in the report (`[x] README exists (10/10)`) and, since the Top Improvements feature, the label shown for failing metrics in the Top Improvements list. The checklist phrasing works for the first use and reads backwards for the second — `topImprovements` currently reuses `MetricResult.description` (via `Pick<MetricResult, 'id' | 'category' | 'description' | 'points'>`) with no separate text for "what to do about it."

## Goals / Non-Goals

**Goals:**
- Give every metric a second, imperative text field (`instruction`) written as a concrete next action, distinct from its checklist-style `description`.
- Give every metric a third field (`remediation`): a longer explanation of what the check means and what satisfies it, surfaced only on demand via `--detailed`.
- Make the Top Improvements list (text and JSON) render `instruction` instead of `description`, so it reads as guidance rather than a restated check name.
- Keep the default report and default `--json` output unchanged in verbosity — `remediation` only appears with `--detailed`.
- Generate a browsable `docs/METRICS.md` reference table from the catalog so `description`/`instruction`/`remediation` for every metric are discoverable without running the CLI.

**Non-Goals:**
- No change to `description` text, scoring math, detection logic, or which metrics exist.
- No i18n/templating system for instructions or remediation text — each is a plain hardcoded string, same as `description` today.
- No enforcement mechanism (e.g. a lint rule) requiring `instruction`/`remediation` to follow a specific grammatical form; it's a written convention applied by hand across all metrics in this change, not a runtime check.
- No hand-maintained copy of the metrics table anywhere — `docs/METRICS.md` is generated output; editing it directly would be silently overwritten on the next `npm run docs:metrics`.

## Decisions

**Add `instruction: string` as a required field on `Metric`, not optional.**
Making it required (rather than `instruction?: string` with a fallback to `description`) forces every metric definition to be updated in this change and guarantees `topImprovements` never silently falls back to checklist phrasing for a metric someone forgets to update. TypeScript's structural typing means every metric literal in the six catalog files will fail to compile until `instruction` is added, giving a build-time completeness check for free.

**`TopImprovement` carries `instruction` instead of `description`.**
`export type TopImprovement = Pick<MetricResult, 'id' | 'category' | 'points'> & { instruction: string }` (or equivalently pick `instruction` from `MetricResult` once `MetricResult` also carries it). This is a breaking change to the `topImprovements[]` JSON shape, called out in the proposal — acceptable because `topImprovements` was introduced in this project's immediately preceding change and has no external consumers yet.

**Convention: instructions are short imperative sentences naming the concrete artifact or action, no punctuation beyond the sentence itself** (e.g. "Add a CONTRIBUTING.md file", "Configure CI to run your test command", "Split up very large source files"). Chosen for consistency with how the report already reads (short lines, no trailing periods elsewhere in the report) and so instructions fit on one line in the Top Improvements list next to `[Category] (+N pts)`.

**Where a `description` already reads as a real check name that maps 1:1 to a single fix, the instruction is a direct imperative version of it** (e.g. "docs/adr/ exists" → "Create a docs/adr/ directory for architecture decision records"); no attempt is made to generate instructions from descriptions programmatically, since several descriptions (e.g. "module/package boundaries detectable", "no generated files mixed with source") need meaningfully different phrasing as an instruction than a naive verb-prepend would produce.

**Field name: `remediation`, not `howToFix`.**
Matches the term used across lint/security tooling (ESLint rule docs, SARIF's `help`/`ruleHelp`, security scanners) for "what this finding means and how to resolve it." Distinct from `instruction` in scope and length: `instruction` is a one-line imperative fit for a ranked list; `remediation` is 1-3 sentences of context, only worth reading when a user explicitly asks for it.

**`--detailed` shows `remediation` only for failing metrics, indented beneath the metric line — not for passed metrics, and not inside the Top Improvements section.**
Passed metrics need no fix, so their remediation text would be pure noise. Top Improvements already carries the concise `instruction` plus category and points; adding multi-sentence remediation there would push the list past a skimmable length, and a user who wants that detail can look at the same metric's line in the category breakdown (or `docs/METRICS.md`). Alternative considered: show remediation for all metrics under `--detailed` — rejected as needlessly verbose for a report whose whole point (per the Top Improvements/summary work) has been to surface what's actionable, not restate what's already fine.

**`--detailed` composes with `--json` by adding a `remediation` field per metric result, mirroring how `--summary` composes with `--json` by removing a field.**
Same mechanism as the existing `--summary --json` trimming in `src/cli.ts`: a small post-processing map over `result.categories[].metrics` immediately before `JSON.stringify`, keeping `scoreRepo`'s output as the single untouched source of truth. `--detailed` and `--summary` are independent flags; `--summary --detailed` together would omit per-metric lines entirely (summary wins for the per-metric list), so `--detailed` has no effect when `--summary` is also set — this is a natural consequence of `--summary` already skipping the per-metric loop, not a special case to implement.

**`docs/METRICS.md` is generated by a script (`npm run docs:metrics`), not committed by hand and not regenerated automatically on every build.**
Keeping it a manual, explicit script run (rather than wiring it into `npm run build`) avoids surprising diffs on every build and keeps the doc-generation concern decoupled from the CLI build. The generated file is still committed to the repo (so GitHub/README links resolve without requiring a build step), and CI or a pre-commit check could later enforce it's up to date — out of scope for this change. Table format: one row per metric, columns Category | Metric (id) | Points | Description | Instruction | Remediation, grouped/sorted by category to match the report's category order.

## Risks / Trade-offs

- [Risk] Hand-writing ~52 instructions and ~52 remediation texts risks inconsistent tone/verb choice across files. → Mitigation: the full list is authored together in one pass (see tasks.md) rather than piecemeal per file, using a small set of recurring verbs (Add, Create, Configure, Document, Split up, Reduce, Organize) for consistency.
- [Risk] Breaking `topImprovements[].description` → `.instruction` could surprise any script already parsing the JSON from the prior change. → Mitigation: called out explicitly as **BREAKING** in the proposal; the field was added only one change ago, minimizing real-world impact.
- [Risk] `instruction`/`remediation` duplicate information already implied by `description` for straightforward metrics (e.g. "README exists" / "Add a README.md file" / "A README is the first thing contributors and agents read..."), adding maintenance surface (three strings to keep conceptually in sync, though not textually coupled). → Mitigation: accepted trade-off — the three fields serve different audiences and surfaces (checklist label, actionable next step, full explanation) and diverge more as metrics get more nuanced.
- [Risk] `docs/METRICS.md` can drift from the catalog if someone edits a metric's text but forgets to rerun `npm run docs:metrics`. → Mitigation: documented in the script's own output/README note; a future CI check (`npm run docs:metrics -- --check`, out of scope here) could fail the build on drift.

## Migration Plan

No data migration. This only affects in-memory `Metric`/`MetricResult`/`TopImprovement` shapes, rendered/serialized output, and adds one generated doc file and one new npm script — update all metric definitions and the consumers (`report.ts`, `scoring.ts`, `cli.ts`) in one change; there is no persisted state to migrate.
