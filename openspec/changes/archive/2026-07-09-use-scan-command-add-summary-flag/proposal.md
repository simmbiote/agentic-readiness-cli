## Why

The CLI currently takes a bare `agentlint [path]` invocation with no explicit verb, which leaves no clean place to add future subcommands (e.g. an `init` or `watch` command later) without ambiguity between "a path" and "a command name." Introducing an explicit `scan` subcommand now, while the CLI still only does one thing, avoids a harder migration later. Separately, the full per-metric report is more detail than users often want for a quick health check (e.g. skimming CI output) — a `--summary` flag gives a condensed, category-level view on demand.

## What Changes

- **BREAKING**: The CLI now requires an explicit `scan` subcommand: `agentlint scan [path] [--json] [--summary]`. The previous bare invocation `agentlint [path]` no longer runs a scan — it prints a usage error naming `scan` as the required subcommand and exits non-zero.
- Add a `--summary` flag. In the human-readable report, it condenses output to: the Overall score/grade line, the Top Improvements section, the detected-providers line, and each category's earned/max/percentage heading — omitting the individual per-metric pass/fail lines.
- When `--summary` is combined with `--json`, the JSON output is trimmed the same way: each entry in `categories` omits its `metrics` array (keeping `category`, `earned`, `max`, `percentage`); `topImprovements` and `overall` are unaffected.
- Update `README.md` usage examples to `agentlint scan [path]`.

## Capabilities

### New Capabilities

(none — this extends the existing `readiness-cli` capability)

### Modified Capabilities

- `readiness-cli`: "Scan Target Repo Path" requirement changes to require the `scan` subcommand (removing the bare-path invocation form); "Human-Readable Report Output" and "JSON Output Mode" requirements change to support a `--summary` mode.

## Impact

- `src/cli.ts`: parse `scan` as a required leading subcommand; reject any invocation that omits it with a usage error and non-zero exit; add `--summary` flag parsing.
- `src/report.ts`: add a summary rendering mode that skips per-metric lines.
- `src/cli.ts` (JSON path): when `--summary` and `--json` are both set, strip each category's `metrics` array from the serialized result before printing.
- `tests/cli.test.ts`: existing tests invoke `main([fixture.root])` and must be updated to `main(['scan', fixture.root])`; add tests for the missing-subcommand error and `--summary` (text and JSON).
- `README.md`: update all `npx agentlint [path]` examples to `npx agentlint scan [path]`.
- No changes to metric detection, provider detection, or scoring math.
