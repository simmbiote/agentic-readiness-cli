## 1. Types

- [x] 1.1 Add `instruction: string` to the `Metric` interface in `src/metrics/types.ts`
- [x] 1.2 Add `remediation: string` to the `Metric` interface in `src/metrics/types.ts`

## 2. Metric Text: Documentation

Add `instruction` and `remediation` to each metric in `src/metrics/documentation.ts`:

- [x] 2.1 `readme-exists`: instruction "Add a README.md file"; remediation "A README is the first thing contributors and AI agents read. Add a README.md at the repo root describing what the project does and how to get started."
- [x] 2.2 `readme-sections`: instruction "Add Setup, Usage, and Testing sections to the README"; remediation "Agents need to know how to set up, run, and test the project without guessing. Add headings covering Setup/Install, Run/Usage, and Testing to your README."
- [x] 2.3 `contributing-exists`: instruction "Add a CONTRIBUTING.md file"; remediation "Contribution guidelines set expectations for PRs, coding standards, and review process. Add a CONTRIBUTING.md describing how to propose changes."
- [x] 2.4 `docs-specs-exists`: instruction "Create a docs/specs/ directory"; remediation "A docs/specs/ directory gives agents a place to find current feature and requirement specifications. Create the directory and start adding specs as you build features."
- [x] 2.5 `docs-plans-exists`: instruction "Create a docs/plans/ directory"; remediation "A docs/plans/ directory records planned or in-progress work so agents don't duplicate effort. Create the directory and add planning docs for active initiatives."
- [x] 2.6 `docs-research-exists`: instruction "Create a docs/research/ directory"; remediation "A docs/research/ directory preserves investigation notes and decisions that informed the current design. Create the directory and capture research findings there."
- [x] 2.7 `docs-adr-exists`: instruction "Create a docs/adr/ directory for architecture decision records"; remediation "Architecture Decision Records explain why past choices were made, preventing agents from re-litigating settled decisions. Create a docs/adr/ directory to hold them."
- [x] 2.8 `adr-index-exists`: instruction "Add an ADR index"; remediation "An index makes ADRs discoverable instead of requiring a directory listing. Add an index file (e.g. docs/adr/README.md) listing all ADRs with short summaries."
- [x] 2.9 `pr-template-exists`: instruction "Add a pull request template"; remediation "A PR template ensures every change includes the context reviewers (human or agent) need. Add a pull request template under .github/."
- [x] 2.10 `spec-adr-templates-exist`: instruction "Add spec/ADR template files"; remediation "Templates keep new specs and ADRs consistent in structure. Add template files under docs/specs/ and docs/adr/ (e.g. TEMPLATE.md)."

## 3. Metric Text: Architecture

Add `instruction` and `remediation` to each metric in `src/metrics/architecture.ts`:

- [x] 3.1 `docs-adr-exists`: instruction "Create a docs/adr/ directory for architecture decision records"; remediation "Architecture Decision Records document why past design choices were made, so past decisions are discoverable instead of being re-litigated. Create a docs/adr/ directory to hold them."
- [x] 3.2 `adr-files-exist`: instruction "Write at least one ADR"; remediation "An empty ADR directory provides no value on its own. Write at least one ADR documenting a real architectural decision you've made."
- [x] 3.3 `adr-index-exists`: instruction "Add an ADR index"; remediation "An index makes ADRs discoverable instead of requiring a directory listing. Add an index file listing all ADRs with short summaries."
- [x] 3.4 `overview-doc-exists`: instruction "Add an architecture overview document"; remediation "An architecture overview gives agents a map of the system before they start editing. Add an ARCHITECTURE.md or docs/architecture/ doc describing major components and how they fit together."
- [x] 3.5 `codeowners-exists`: instruction "Add a CODEOWNERS file"; remediation "CODEOWNERS routes review responsibility to the right people or teams automatically. Add a CODEOWNERS file mapping paths to owners."
- [x] 3.6 `clear-source-root`: instruction "Establish a clear source root directory (e.g. src/)"; remediation "A single, obvious source directory helps agents locate code quickly. Consolidate application code under one clearly named root directory."
- [x] 3.7 `module-boundaries-detectable`: instruction "Organize source files into clear module/package boundaries"; remediation "Clear module/package boundaries help agents reason about where a change belongs. Organize source code into distinct subdirectories representing logical modules."
- [x] 3.8 `no-very-large-source-files`: instruction "Split up very large source files"; remediation "Very large files are hard for agents (and humans) to reason about in one pass. Split files exceeding the line threshold into smaller, focused modules."

## 4. Metric Text: Testing

Add `instruction` and `remediation` to each metric in `src/metrics/testing.ts`:

- [x] 4.1 `test-command-detected`: instruction "Add a test command (e.g. npm test)"; remediation "Without a discoverable test command, agents can't verify their own changes. Add a test script (e.g. \"test\": \"vitest run\") to package.json."
- [x] 4.2 `test-command-documented`: instruction "Document the test command in the README"; remediation "Even a working test command is easy to miss if it isn't written down. Document how to run tests in your README's Testing section."
- [x] 4.3 `ci-runs-tests`: instruction "Configure CI to run your test command"; remediation "Tests that don't run in CI don't protect against regressions. Configure your CI workflow to invoke your test command on every push and PR."
- [x] 4.4 `test-files-exist`: instruction "Add test files"; remediation "A test command with nothing to run doesn't verify anything. Add test files exercising your code's behavior."
- [x] 4.5 `coverage-exists`: instruction "Add test coverage configuration or reporting"; remediation "Without coverage reporting, gaps in test coverage go unnoticed. Add coverage configuration (e.g. vitest --coverage) or a coverage report step."
- [x] 4.6 `unit-integration-structure`: instruction "Organize tests into unit/integration directories"; remediation "Separating unit and integration tests clarifies what's being verified and at what level. Organize tests into unit/ and integration/ (or equivalent) directories."
- [x] 4.7 `tests-required-check`: instruction "Make tests a required check before merging"; remediation "Tests that aren't required checks can be bypassed, defeating their purpose. Configure branch protection to require tests to pass before merging."

## 5. Metric Text: Automation Guard Rails

Add `instruction` and `remediation` to each metric in `src/metrics/automation-guardrails.ts`:

- [x] 5.1 `ci-workflow-exists`: instruction "Add a CI workflow"; remediation "Without CI, nothing verifies changes automatically before merge. Add a CI workflow (e.g. GitHub Actions) that runs on push and PR."
- [x] 5.2 `lint-command-detected`: instruction "Add a lint command"; remediation "A lint command catches style and correctness issues before review. Add a lint script (e.g. \"lint\": \"eslint .\") to package.json."
- [x] 5.3 `format-command-detected`: instruction "Add a format command"; remediation "A format command keeps style consistent without manual nitpicking. Add a format script (e.g. \"format\": \"prettier --write .\")."
- [x] 5.4 `typecheck-detected`: instruction "Add typecheck or static analysis"; remediation "Static analysis and typechecking catch type errors before runtime. Add a typecheck script (e.g. \"tsc --noEmit\") or equivalent static analysis tool."
- [x] 5.5 `security-scan-exists`: instruction "Add a security/dependency scan"; remediation "Unscanned dependencies can introduce known vulnerabilities silently. Add a security/dependency scan (e.g. npm audit, Dependabot, Snyk) to your workflow."
- [x] 5.6 `pr-template-exists`: instruction "Add a pull request template"; remediation "A PR template ensures every change includes the context reviewers need. Add a pull request template under .github/."
- [x] 5.7 `conventional-commit-config-exists`: instruction "Add conventional commit configuration"; remediation "Conventional commits make history and changelogs machine-parseable. Add commit linting configuration (e.g. commitlint) enforcing the convention."
- [x] 5.8 `required-checks-hint`: instruction "Document required checks or branch protection rules"; remediation "Without documented required checks, it's unclear what must pass before merge. Document your required checks or branch protection rules (e.g. in CONTRIBUTING.md)."

## 6. Metric Text: AI Context

Add `instruction` and `remediation` to each metric in `src/metrics/ai-context.ts`:

- [x] 6.1 `agents-md-exists`: instruction "Add an AGENTS.md file"; remediation "AGENTS.md is the canonical entry point AI agents look for. Add an AGENTS.md describing how to work in this repo."
- [x] 6.2 `claude-shim-import-exists`: instruction "Add a CLAUDE.md shim that imports AGENTS.md"; remediation "Claude-specific tooling looks for CLAUDE.md; without a shim it won't find your AGENTS.md content. Add a CLAUDE.md that imports or references AGENTS.md."
- [x] 6.3 `covers-testing`: instruction "Document testing conventions in your agent file"; remediation "Agents need to know how you expect tests to be written and run. Add a Testing section to your agent file describing conventions."
- [x] 6.4 `covers-code-style`: instruction "Document code style conventions in your agent file"; remediation "Agents default to generic style without explicit guidance. Document your code style and conventions in your agent file."
- [x] 6.5 `covers-architecture-rules`: instruction "Document architecture rules in your agent file"; remediation "Agents can violate architectural boundaries without knowing they exist. Document architecture rules and module boundaries in your agent file."
- [x] 6.6 `covers-adr-spec-rules`: instruction "Document ADR/spec conventions in your agent file"; remediation "Agents won't know to consult or write ADRs/specs unless told. Document your ADR/spec conventions in your agent file."
- [x] 6.7 `docs-specs-exists`: instruction "Create a docs/specs/ directory"; remediation "A docs/specs/ directory gives agents a place to find current feature and requirement specifications. Create the directory and start adding specs as you build features."
- [x] 6.8 `docs-plans-exists`: instruction "Create a docs/plans/ directory"; remediation "A docs/plans/ directory records planned or in-progress work so agents don't duplicate effort. Create the directory and add planning docs for active initiatives."
- [x] 6.9 `docs-research-exists`: instruction "Create a docs/research/ directory"; remediation "A docs/research/ directory preserves investigation notes and decisions that informed the current design. Create the directory and capture research findings there."
- [x] 6.10 `agentignore-exists`: instruction "Add a .agentignore file (or equivalent)"; remediation "Without an ignore file, agents may read or modify files you never intended them to touch. Add a .agentignore (or equivalent) listing paths agents should avoid."

## 7. Metric Text: Maintainability

Add `instruction` and `remediation` to each metric in `src/metrics/maintainability.ts`:

- [x] 7.1 `pr-template-checklist`: instruction "Add a checklist to the pull request template"; remediation "A checklist reminds contributors and agents of steps that are easy to forget. Add a Markdown checklist (- [ ] items) to your PR template."
- [x] 7.2 `pr-size-guidance`: instruction "Document PR size guidance"; remediation "Large PRs are hard to review thoroughly. Document guidance encouraging small, focused pull requests."
- [x] 7.3 `conventional-commits-recent`: instruction "Use conventional commit messages"; remediation "Inconsistent commit messages make history and changelogs hard to parse. Adopt conventional commit messages (e.g. feat:, fix:) across recent commits."
- [x] 7.4 `large-files-below-threshold`: instruction "Split up files exceeding the size threshold"; remediation "Very large files are hard for agents (and humans) to reason about in one pass. Split files exceeding the line threshold into smaller, focused modules."
- [x] 7.5 `todo-fixme-reasonable`: instruction "Reduce the number of TODO/FIXME comments"; remediation "A high density of TODO/FIXME comments signals accumulating unaddressed debt. Resolve or track outstanding TODOs/FIXMEs to bring the count down."
- [x] 7.6 `dependency-lockfile-exists`: instruction "Commit a dependency lockfile"; remediation "Without a lockfile, dependency versions can drift between installs, causing inconsistent behavior. Commit your package manager's lockfile (e.g. package-lock.json)."
- [x] 7.7 `codeowners-exists`: instruction "Add a CODEOWNERS file"; remediation "CODEOWNERS routes review responsibility to the right people or teams automatically. Add a CODEOWNERS file mapping paths to owners."
- [x] 7.8 `docs-updated-recently`: instruction "Update your documentation"; remediation "Stale docs mislead agents into acting on outdated information. Review and update documentation to reflect the current state of the code."
- [x] 7.9 `no-generated-files-mixed`: instruction "Keep generated files out of the source tree"; remediation "Generated files mixed with source can confuse agents about what's hand-written versus build output. Move generated files out of the source tree (e.g. into a build/dist directory) and gitignore them."

## 8. Scoring: Top Improvements Uses Instruction; MetricResult Carries Remediation

- [x] 8.1 In `src/scoring.ts`, add `remediation: string` to `MetricResult`, sourced from the metric's `remediation`
- [x] 8.2 Change `TopImprovement` to carry `instruction` instead of `description` (e.g. `Pick<MetricResult, 'id' | 'category' | 'points'> & { instruction: string }`)
- [x] 8.3 Ensure `MetricResult` carries `instruction` (from the source `Metric`) so `topImprovements` can be built from it
- [x] 8.4 Update the `topImprovements` construction in `scoreRepo` to map `instruction` instead of `description`
- [x] 8.5 Update `tests/scoring.test.ts`: add `instruction`/`remediation` to test fixture metrics; update assertions that reference `topImprovements[].description` to use `.instruction`

## 9. CLI: `--detailed` Flag

- [x] 9.1 Add `--detailed` to `parseArgs`' recognized flags in `src/cli.ts`, alongside `--json` and `--summary`
- [x] 9.2 Pass the parsed `detailed` boolean into `renderReport` (text mode)
- [x] 9.3 When `--json` and `--detailed` are both set, include `remediation` on each metric result in the serialized output (no change when `--detailed` is absent)
- [x] 9.4 Add a CLI test asserting `--json --detailed` output has `categories[0].metrics[0].remediation` present, and `--json` without `--detailed` has it absent

## 10. Report: Top Improvements Uses Instruction; Detailed Mode

- [x] 10.1 In `src/report.ts`, change the Top Improvements section to print `improvement.instruction` instead of `improvement.description`
- [x] 10.2 Add a `detailed` option to `RenderReportOptions`; when true, print each failing metric's `remediation` text indented on the line(s) beneath it (only for `passed: false` metrics, and only when `summary` is not also set)
- [x] 10.3 Update `tests/report.test.ts`: update the `buildResult` fixture's `topImprovements` entries to use `instruction`; add tests for `detailed: true` (remediation shown for failing metrics, absent for passing ones) and confirm `summary: true, detailed: true` together show no per-metric lines

## 11. Metrics Documentation Generation

- [x] 11.1 Add a script (e.g. `scripts/generate-metrics-doc.ts`) that imports the full metric catalog and writes `docs/METRICS.md`: a Markdown table with columns Category, Metric, Points, Description, Instruction, Remediation, rows grouped by category in `CATEGORIES` order
- [x] 11.2 Add a `docs:metrics` script to `package.json` (e.g. `"docs:metrics": "tsx scripts/generate-metrics-doc.ts"`) that runs it
- [x] 11.3 Run `npm run docs:metrics` and commit the generated `docs/METRICS.md`
- [x] 11.4 Add a link to `docs/METRICS.md` from `README.md`
- [x] 11.5 Document `--detailed` in `README.md`'s usage section

## 12. Verification

- [x] 12.1 Run `npm run build` and confirm it fails to compile if any metric is missing `instruction` or `remediation`, then confirm it succeeds once all metrics are updated
- [x] 12.2 Run `npm test` and confirm all tests pass
- [x] 12.3 Run `node dist/cli.js scan .` and visually confirm the Top Improvements section shows imperative instructions (e.g. "Add a CONTRIBUTING.md file"), not checklist descriptions
- [x] 12.4 Run `node dist/cli.js scan . --detailed` and visually confirm failing metrics show indented remediation text and passing metrics do not
- [x] 12.5 Run `node dist/cli.js scan . --json | jq '.topImprovements'` and confirm each entry has `instruction` and no `description` field
- [x] 12.6 Run `node dist/cli.js scan . --json --detailed | jq '.categories[0].metrics[0]'` and confirm a `remediation` field is present; confirm it's absent without `--detailed`
- [x] 12.7 Run `npm run docs:metrics` and confirm `docs/METRICS.md` is generated with a row for every metric
- [x] 12.8 Run `npm run lint` and confirm it passes
