## Context

`src/cli.ts` currently parses argv as: any non-`--json` token is treated as the target path (first one wins), `--json` toggles JSON mode. There is no subcommand concept. `src/report.ts` renders the full per-metric breakdown unconditionally.

Note: as of this writing, `openspec/specs/readiness-cli/spec.md` (the main spec) is stale — the change `enhance-output-report-styling-and-add-top-5-improvements` is fully implemented in code (color output, report reordering, category percentages, Top Improvements section) but not yet archived/synced. This change's delta specs are written against the *effective* current behavior (main spec + that pending delta), not the stale main spec text, so that archiving both changes later does not silently drop the color/reorder/percentage requirements. Archiving the pending change before or alongside this one is recommended to avoid further drift.

## Goals / Non-Goals

**Goals:**
- Require an explicit `scan` subcommand as the CLI's first argument, rejecting any other invocation shape with a usage error.
- Add a `--summary` flag that condenses both the text report and (when paired with `--json`) the JSON output to category-level totals, dropping per-metric detail.
- Keep the change to argument parsing only — no change to scanning, detection, or scoring logic.

**Non-Goals:**
- No other subcommands are introduced now (no `init`, `watch`, etc.) — `scan` is the only one, added to make room for those later without redesigning argument parsing again.
- No config file or persisted flags; `--summary`/`--json` remain per-invocation flags.
- `--summary` does not change what Top Improvements or the providers line show — only the per-category metric list is affected.

## Decisions

**`scan` as a required, hardcoded subcommand check — not a general subcommand framework.**
`parseArgs` checks `argv[0] === 'scan'` and errors otherwise. Building a generic subcommand dispatcher (e.g. a command registry) for a single command would be speculative — add that structure when a second subcommand actually arrives, not now.

**`--summary` JSON trimming happens in `src/cli.ts`, not by changing `ScoringResult` or `scoreRepo`.**
`scoreRepo`'s output stays the single, complete source of truth; `main()` strips each category's `metrics` array from the JSON-serialized object only when both `--json` and `--summary` are passed, immediately before `JSON.stringify`. Alternative considered: add a `summary` parameter to `scoreRepo` that omits `metrics` — rejected because it would make the scoring engine aware of a presentation concern and would require computing per-metric results twice if both a full and summary view were ever needed in the same process.

**`--summary` in the text report is a rendering-mode flag passed into `renderReport`, not a second render function.**
`renderReport(result, { summary: boolean })` skips the per-metric loop when `summary` is true but keeps every other section (Overall, Top Improvements, providers, category headings with percentage) identical to the full report. This avoids duplicating the section-ordering logic between a "full" and "summary" renderer.

**Missing-subcommand error message names `scan` explicitly and exits non-zero, matching the existing invalid-path error pattern.**
Consistent with `Error: path does not exist or is not a directory: ...` — usage errors go to `console.error` and return a non-zero exit code from `main`, so `cli.ts`'s existing error-handling shape doesn't need a new pattern.

## Risks / Trade-offs

- [Risk] This is a **BREAKING** CLI change — any existing script or CI job calling `agentlint <path>` or `npx agentlint <path>` (per the current README) will start failing with a usage error. → Mitigation: the error message explicitly names the required `scan` subcommand so the fix is a one-token edit; call this out prominently in the proposal and README update.
- [Risk] The stale main spec (see Context) could cause the archive of this change to clobber the pending change's color/reorder requirements if archived out of order or if the delta text drifts from what's actually in main by then. → Mitigation: this change's delta is written against the effective (main + pending-delta) text; recommend archiving `enhance-output-report-styling-and-add-top-5-improvements` first.
- [Risk] `--summary --json` producing a different JSON shape than plain `--json` could surprise tooling that always expects `categories[].metrics`. → Mitigation: this is opt-in (only when `--summary` is explicitly passed) and documented in the spec/README.

## Migration Plan

Update `README.md` usage examples from `npx agentlint [path]` to `npx agentlint scan [path]` as part of this change. No data migration. Existing `--json` consumers that don't pass `--summary` see no change in shape.
