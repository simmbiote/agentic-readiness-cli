## 1. Package metadata

- [x] 1.1 In `package.json`, change `name` from `agentlint` to `agenticgrade` and update the `bin` entry key from `agentlint` to `agenticgrade` (keep the `./dist/cli.js` target).
- [x] 1.2 Regenerate `package-lock.json` (e.g. `npm install`) so its `name`/`bin` fields match the new package name.

## 2. Source code strings

- [x] 2.1 In `src/cli.ts`, update the missing-subcommand usage error to say `agenticgrade scan ...` instead of `agentlint scan ...`.
- [x] 2.2 In `src/cli.ts`, rename the HTML temp-file prefix from `agentlint-report-` to `agenticgrade-report-`.
- [x] 2.3 In `src/html-report.ts`, update the generated report's `<title>` from `agentlint report` to `agenticgrade report`.

## 3. Docs

- [x] 3.1 In `README.md`, update the title and all `npx agentlint scan ...` examples to `npx agenticgrade scan ...`.
- [x] 3.2 Grep the rest of the repo (excluding `openspec/changes/archive/**`, `node_modules`, `dist`, `.git`) for the literal string `agentlint` and update any remaining doc references (e.g. `docs/METRICS.md` if present) to `agenticgrade`. (No doc references found beyond README, already updated; `.claude/settings.local.json` references the local directory path, not the package name, and is out of scope.)

## 4. Tests

- [x] 4.1 In `tests/helpers/fixture.ts` and `tests/cli.test.ts`, rename the `mkdtempSync` prefixes (`agentlint-`, `agentlint-out-`) to `agenticgrade-` / `agenticgrade-out-` for consistency with the new name (these are just temp-dir prefixes, not behavioral assertions).
- [x] 4.2 Add/update a test asserting the missing-subcommand usage error references `agenticgrade` (covering the new `readiness-cli` "CLI Package and Binary Name" requirement).
- [x] 4.3 Add/update a test asserting the `--html` report's `<title>` contains `agenticgrade`.

## 5. Verification

- [x] 5.1 Run `grep -ri "agentlint" .` (excluding `node_modules`, `dist`, `.git`, `openspec/changes/archive/**`) and confirm zero remaining matches. (Remaining hits are this change's own planning docs, which intentionally describe the old name as history, and `.claude/settings.local.json`, which references the local directory path `agentlint-poc`, not the package name — both out of scope per design.md.)
- [x] 5.2 Run `npm run build`, `npm test`, and `npm run lint` and confirm all pass. (build clean, 138/138 tests pass, lint clean.)
- [x] 5.3 Run `npm pack --dry-run` (or equivalent) and confirm the produced tarball/bin name reflect `agenticgrade`. (Tarball: `agenticgrade-0.1.0.tgz`, package name `agenticgrade`.)
