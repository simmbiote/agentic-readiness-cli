## 1. CLI: Require `scan` Subcommand

- [x] 1.1 In `src/cli.ts`, update `parseArgs` to require `argv[0] === 'scan'`; return a parse error/flag when it's missing so `main` can reject the invocation
- [x] 1.2 In `main`, when the `scan` subcommand is missing, print a usage error to `console.error` naming `scan` as required and return a non-zero exit code, without attempting to score
- [x] 1.3 Update path/`--json`/`--summary` parsing to read from `argv.slice(1)` (after the `scan` token)
- [x] 1.4 Update `tests/cli.test.ts`: change existing `main([fixture.root])`/`main([fixture.root, '--json'])` calls to `main(['scan', fixture.root])`/`main(['scan', fixture.root, '--json'])`
- [x] 1.5 Add a test asserting a bare path (no `scan`) or no arguments exits non-zero with a usage error naming `scan`

## 2. CLI: `--summary` Flag Parsing

- [x] 2.1 Add `--summary` to `parseArgs`' recognized flags (alongside `--json`), independent of flag order relative to the path
- [x] 2.2 Pass the parsed `summary` boolean into `renderReport` (text mode) and into the JSON-serialization step (JSON mode)

## 3. Report: Summary Rendering Mode

- [x] 3.1 Change `renderReport` in `src/report.ts` to accept an options object (e.g. `{ summary?: boolean }`) as a second parameter
- [x] 3.2 When `summary` is true, skip the per-metric loop inside each category, printing only the category heading (earned/max/percentage)
- [x] 3.3 Verify all other sections (Overall, Top Improvements, providers) render unchanged regardless of `summary`
- [x] 3.4 Add tests in `tests/report.test.ts` covering: `summary: true` omits per-metric lines but keeps category headings, overall, top improvements, and providers; `summary` unset/false behaves exactly as before (regression check)

## 4. JSON: `--summary` Trimming

- [x] 4.1 In `src/cli.ts`, when both `--json` and `--summary` are set, before `JSON.stringify`, map `result.categories` to omit the `metrics` field from each entry (leave `result.topImprovements`, `result.providers`, `result.overall` untouched)
- [x] 4.2 Add a CLI test asserting `--json --summary` output has `categories[].metrics === undefined` while `topImprovements`/`overall`/`providers` are present and correct
- [x] 4.3 Add a CLI test asserting `--json` without `--summary` is unchanged (still includes `categories[].metrics`)

## 5. Documentation

- [x] 5.1 Update `README.md` usage examples from `npx agentlint [path]` to `npx agentlint scan [path]`, and document `--summary`
- [x] 5.2 Update the existing README note about the `npx` symlink bug (if still present) to use the `scan` subcommand in its `node dist/cli.js` workaround examples

## 6. Verification

- [x] 6.1 Run `npm run build && npm test` and confirm all tests pass
- [x] 6.2 Run `node dist/cli.js scan .` against this repo and visually confirm it still works end-to-end
- [x] 6.3 Run `node dist/cli.js .` (no `scan`) and confirm it exits non-zero with a usage error naming `scan`
- [x] 6.4 Run `node dist/cli.js scan . --summary` and visually confirm per-metric lines are omitted but category totals, overall, top improvements, and providers still show
- [x] 6.5 Run `node dist/cli.js scan . --json --summary | jq '.categories[0]'` and confirm no `metrics` field is present
