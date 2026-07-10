## Why

The package is currently named `agentlint`, but that name is already published on
npm by an unrelated project (a static analysis/security scanner for AI agent
configuration files), so this project cannot be published to npm under its
current name. `agenticgrade` is available on the npm registry and better reflects
what the tool does (grades a repo's agentic-coding readiness), so the project
needs to be renamed before its first npm publish.

## What Changes

- Rename the npm package from `agentlint` to `agenticgrade` in `package.json`
  (name field, `bin` entry, `files`/`main` untouched).
- Rename the CLI binary from `agentlint` to `agenticgrade` (invocation changes
  from `npx agentlint scan ...` to `npx agenticgrade scan ...`). **BREAKING**:
  any existing installs or scripts invoking `agentlint` will need to switch to
  `agenticgrade`.
- Update all user-facing strings that hardcode the old name: the CLI usage/error
  message, the temp-file prefix used when writing an HTML report, and the
  `<title>` of the generated HTML report.
- Update `README.md` (title, install/run examples) and any other docs
  referencing `agentlint` by name.
- Update test fixtures/expectations in `tests/cli.test.ts` and
  `tests/helpers/fixture.ts` that assert on the old name.
- No change to scoring behavior, metrics, or CLI flags/output structure — this
  is a rename only.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `readiness-cli`: adds a requirement pinning the published package/binary name
  to `agenticgrade` (previously unspecified). No other existing requirement in
  this capability changes — the usage-error and HTML-report requirements
  already describe behavior generically (e.g. "prints a usage error naming
  `scan` as the required subcommand") without pinning the literal
  package/binary name.

## Impact

- Affected files: `package.json`, `package-lock.json`, `README.md`, `src/cli.ts`,
  `src/html-report.ts`, `tests/cli.test.ts`, `tests/helpers/fixture.ts`.
- No dependency or API surface changes; this is a naming/branding change in
  preparation for publishing to npm.
- Anyone with the package already installed globally or referencing the
  `agentlint` bin name in scripts/CI must switch to `agenticgrade` after this
  change ships.
