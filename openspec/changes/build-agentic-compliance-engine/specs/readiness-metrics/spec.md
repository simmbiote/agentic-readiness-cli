## ADDED Requirements

### Requirement: Metric Catalog Structure
The system SHALL define a metrics catalog grouped into exactly six categories: Documentation, Architecture, Testing, Automation Guard Rails, AI Context, and Maintainability. Each metric in the catalog SHALL have a unique id, a category, a point value greater than zero, a human-readable description, an optional `provider` tag, and a detection rule that operates on a scanned repo file tree.

#### Scenario: Catalog covers all six categories
- **WHEN** the metrics catalog is loaded
- **THEN** it contains at least one metric for each of Documentation, Architecture, Testing, Automation Guard Rails, AI Context, and Maintainability

#### Scenario: Metric ids are unique
- **WHEN** the metrics catalog is loaded
- **THEN** no two metrics share the same id

### Requirement: Provider-Scoped Metrics
A metric MAY carry a `provider` tag with value `openspec`, `claude`, or `universal`. A metric with no `provider` tag is a base metric that applies to every scan regardless of detected providers (see `provider-detection`). A metric with a `provider` tag SHALL only be applicable — and therefore only counted in scoring — when that provider is present in the repo's detected provider set. Provider-scoped metrics are not restricted to the AI Context category; they MAY appear in any of the six categories.

#### Scenario: Base metric always applies
- **WHEN** a metric has no `provider` tag
- **THEN** it is evaluated and counted in every scan regardless of which providers are detected

#### Scenario: Provider-scoped metric applies when its provider is detected
- **WHEN** a metric is tagged `provider: openspec` and the repo's detected provider set includes `openspec`
- **THEN** the metric is evaluated and counted toward both the earned and max score

#### Scenario: Provider-scoped metric is excluded when its provider is absent
- **WHEN** a metric is tagged `provider: claude` and the repo's detected provider set does not include `claude`
- **THEN** the metric is excluded entirely from scoring — it counts toward neither earned nor max points

#### Scenario: Provider-scoped metrics span multiple categories
- **WHEN** the catalog defines `provider: openspec` metrics in the Architecture, Automation Guard Rails, and Maintainability categories
- **THEN** each is evaluated independently within its own category whenever `openspec` is detected

### Requirement: Documentation Category Metrics
The system SHALL measure whether repo knowledge is explicit and versioned, using the following metrics: README exists (10), README has setup/run/test sections (15), CONTRIBUTING.md exists (10), `docs/specs/` exists (10), `docs/plans/` exists (10), `docs/research/` exists (10), `docs/adr/` exists (10), ADR index exists (10), PR template exists (10), Spec/ADR templates exist (5).

#### Scenario: README existence detected
- **WHEN** scanning a repo that contains a `README.md` (or `README`) at its root
- **THEN** the "README exists" metric is marked passed and awards 10 points

#### Scenario: README missing
- **WHEN** scanning a repo without a README file at its root
- **THEN** the "README exists" metric is marked failed and awards zero points

#### Scenario: README section coverage detected
- **WHEN** the README contains headings matching Setup, Run, and Test (case-insensitive, any heading level)
- **THEN** the "README has setup/run/test sections" metric is marked passed and awards 15 points

#### Scenario: CONTRIBUTING.md existence detected
- **WHEN** scanning a repo that contains a `CONTRIBUTING.md` file at its root
- **THEN** the "CONTRIBUTING.md exists" metric is marked passed and awards 10 points

#### Scenario: docs/specs directory detected (Documentation)
- **WHEN** scanning a repo that contains a `docs/specs/` directory with at least one file inside
- **THEN** the "docs/specs/ exists" metric is marked passed and awards 10 points

#### Scenario: docs/plans directory detected (Documentation)
- **WHEN** scanning a repo that contains a `docs/plans/` directory with at least one file inside
- **THEN** the "docs/plans/ exists" metric is marked passed and awards 10 points

#### Scenario: docs/research directory detected (Documentation)
- **WHEN** scanning a repo that contains a `docs/research/` directory with at least one file inside
- **THEN** the "docs/research/ exists" metric is marked passed and awards 10 points

#### Scenario: docs/adr directory detected (Documentation)
- **WHEN** scanning a repo that contains a `docs/adr/` directory with at least one file inside
- **THEN** the "docs/adr/ exists" metric is marked passed and awards 10 points

#### Scenario: ADR index detected (Documentation)
- **WHEN** scanning a repo whose `docs/adr/` (or equivalent ADR directory) contains an index file (e.g. `README.md`, `index.md`, or `0000-*.md`) listing recorded decisions
- **THEN** the "ADR index exists" metric is marked passed and awards 10 points

#### Scenario: PR template detected (Documentation)
- **WHEN** scanning a repo that contains a pull request template under `.github/` (e.g. `PULL_REQUEST_TEMPLATE.md`)
- **THEN** the "PR template exists" metric is marked passed and awards 10 points

#### Scenario: Spec/ADR templates detected
- **WHEN** scanning a repo that contains a template file for specs and/or ADRs (e.g. `docs/adr/template.md`, `docs/specs/_template.md`)
- **THEN** the "Spec/ADR templates exist" metric is marked passed and awards 5 points

### Requirement: Architecture Category Metrics
The system SHALL measure whether architectural intent is discoverable and protected, using the following metrics: `docs/adr/` exists (20), ADR files exist (15), ADR index exists (10), architecture overview doc exists (15), CODEOWNERS exists (10), clear source root detected (10), module/package boundaries detectable (10), no very large source files (10).

#### Scenario: docs/adr directory detected (Architecture)
- **WHEN** scanning a repo that contains a `docs/adr/` directory
- **THEN** the "docs/adr/ exists" metric is marked passed and awards 20 points

#### Scenario: ADR files detected
- **WHEN** the `docs/adr/` directory contains at least one file matching a numbered ADR naming convention (e.g. `0001-*.md`, `ADR-001*.md`)
- **THEN** the "ADR files exist" metric is marked passed and awards 15 points

#### Scenario: ADR index detected (Architecture)
- **WHEN** the ADR directory contains an index file listing recorded decisions
- **THEN** the "ADR index exists" metric is marked passed and awards 10 points

#### Scenario: Architecture overview doc detected
- **WHEN** scanning a repo that contains an `ARCHITECTURE.md` file or a directory matching `docs/architecture*`
- **THEN** the "architecture overview doc exists" metric is marked passed and awards 15 points

#### Scenario: CODEOWNERS detected (Architecture)
- **WHEN** scanning a repo that contains a `CODEOWNERS` file (at root, under `.github/`, or under `docs/`)
- **THEN** the "CODEOWNERS exists" metric is marked passed and awards 10 points

#### Scenario: Clear source root detected
- **WHEN** the repo root contains a recognizable source root directory (e.g. `src`, `app`, `services`, `packages`, `cmd`, `internal`, `pkg`)
- **THEN** the "clear source root detected" metric is marked passed and awards 10 points

#### Scenario: Module/package boundaries detectable
- **WHEN** the detected source root contains two or more sibling subdirectories that each carry their own manifest/entry file (e.g. `package.json`, `go.mod`, `Cargo.toml`, or an index/entry file), indicating distinct modules
- **THEN** the "module/package boundaries detectable" metric is marked passed and awards 10 points

#### Scenario: No very large source files
- **WHEN** no source file under the detected source root exceeds 800 lines
- **THEN** the "no very large source files" metric is marked passed and awards 10 points

#### Scenario: Very large source file fails the metric
- **WHEN** at least one source file under the detected source root exceeds 800 lines
- **THEN** the "no very large source files" metric is marked failed

### Requirement: Testing Category Metrics
The system SHALL measure whether an agent can verify its own work, using the following metrics: test command detected (20), test command documented (15), CI runs tests (20), test files exist (15), coverage config/report exists (10), unit/integration structure detectable (10), tests are required checks (10).

#### Scenario: Test command detected
- **WHEN** a test command can be inferred from a project manifest or build file (e.g. `package.json` `scripts.test`, a Makefile `test` target, `go.mod` implying `go test`, `pom.xml`/`build.gradle`, `pytest.ini`/`pyproject.toml` pytest config)
- **THEN** the "test command detected" metric is marked passed and awards 20 points

#### Scenario: Test command documented
- **WHEN** the README or CONTRIBUTING.md shows the literal test command (e.g. inside a code block such as `` `npm test` ``, `` `pytest` ``, `` `go test ./...` ``, `` `make test` ``)
- **THEN** the "test command documented" metric is marked passed and awards 15 points

#### Scenario: CI test execution detected
- **WHEN** a CI workflow file (e.g. `.github/workflows/*.yml`) contains a step that runs the detected test command
- **THEN** the "CI runs tests" metric is marked passed and awards 20 points

#### Scenario: Test files exist
- **WHEN** scanning a repo that contains a `test/`, `tests/`, `spec/`, or `__tests__/` directory, or files matching a test naming convention (e.g. `*.test.*`, `*_test.go`, `*_spec.rb`)
- **THEN** the "test files exist" metric is marked passed and awards 15 points

#### Scenario: Coverage config or report detected
- **WHEN** scanning a repo that contains a recognized coverage tool config or report (e.g. `.nycrc`, a jest `coverageThreshold`, `.coveragerc`, `coverage.xml`, `codecov.yml`)
- **THEN** the "coverage config/report exists" metric is marked passed and awards 10 points

#### Scenario: Unit/integration structure detectable
- **WHEN** test files are organized into distinguishable unit vs. integration groups (e.g. separate `tests/unit/` and `tests/integration/` directories, or `*.unit.test.*` / `*.integration.test.*` naming)
- **THEN** the "unit/integration structure detectable" metric is marked passed and awards 10 points

#### Scenario: Tests are required checks
- **WHEN** a committed repo settings file (e.g. `.github/settings.yml`) or documented contribution policy names the test job as a required status check for merging
- **THEN** the "tests are required checks" metric is marked passed and awards 10 points

### Requirement: Automation Guard Rails Category Metrics
The system SHALL measure whether automated guardrails are in place, using the following metrics: CI workflow exists (20), lint command detected (15), format command detected (10), typecheck/static analysis detected (15), security/dependency scan exists (10), PR template exists (10), conventional commit config exists (10), required checks/branch protection hint (10).

#### Scenario: CI workflow detected
- **WHEN** scanning a repo that contains at least one CI workflow configuration file (e.g. `.github/workflows/*.yml`, `.gitlab-ci.yml`)
- **THEN** the "CI workflow exists" metric is marked passed and awards 20 points

#### Scenario: Lint command detected
- **WHEN** a lint command/config can be inferred (e.g. an ESLint/Ruff/Flake8/RuboCop/golangci-lint config file, or a `lint` script in the project manifest)
- **THEN** the "lint command detected" metric is marked passed and awards 15 points

#### Scenario: Format command detected
- **WHEN** a formatter command/config can be inferred (e.g. Prettier/Black/gofmt/rustfmt config, or a `format` script in the project manifest)
- **THEN** the "format command detected" metric is marked passed and awards 10 points

#### Scenario: Typecheck/static analysis detected
- **WHEN** a typecheck or static analysis command/config can be inferred (e.g. a strict `tsconfig.json`, a `typecheck` script, `mypy.ini`, Sorbet, or Flow config)
- **THEN** the "typecheck/static analysis detected" metric is marked passed and awards 15 points

#### Scenario: Security/dependency scan detected
- **WHEN** scanning a repo that contains a Dependabot or Renovate config, or a CI step running a security/dependency audit tool (e.g. `npm audit`, `pip-audit`, Snyk, Trivy, a CodeQL workflow)
- **THEN** the "security/dependency scan exists" metric is marked passed and awards 10 points

#### Scenario: PR template detected (Automation Guard Rails)
- **WHEN** scanning a repo that contains a pull request template under `.github/`
- **THEN** the "PR template exists" metric is marked passed and awards 10 points

#### Scenario: Conventional commit config detected
- **WHEN** scanning a repo that contains a commit-linting config (e.g. `.commitlintrc*`, `commitlint.config.*`) or a commit-msg hook enforcing Conventional Commits
- **THEN** the "conventional commit config exists" metric is marked passed and awards 10 points

#### Scenario: Required checks/branch protection hint detected
- **WHEN** a committed repo settings file or documented contribution policy names any required status check for merging (not limited to tests)
- **THEN** the "required checks/branch protection hint" metric is marked passed and awards 10 points

### Requirement: AI Context Category Metrics
The system SHALL measure whether Claude or other coding agents have explicit repo-level guidance, using the following metrics: AGENTS.md exists (20), CLAUDE.md shim/import exists (15), agent file covers testing (10), agent file covers code style (10), agent file covers architecture rules (10), agent file covers ADR/spec rules (10), `docs/specs` exists (10), `docs/plans` exists (5), `docs/research` exists (5), `.agentignore` or equivalent exists (5).

#### Scenario: AGENTS.md existence detected
- **WHEN** scanning a repo that contains an `AGENTS.md` file at its root
- **THEN** the "AGENTS.md exists" metric is marked passed and awards 20 points

#### Scenario: CLAUDE.md shim/import detected
- **WHEN** a repo contains a `CLAUDE.md` file that either holds its own content or imports/references `AGENTS.md` (or vice versa)
- **THEN** the "CLAUDE.md shim/import exists" metric is marked passed and awards 15 points

#### Scenario: Agent file covers testing
- **WHEN** the AI context file (`AGENTS.md`/`CLAUDE.md`) contains a section or explicit mention of how to run/verify tests
- **THEN** the "agent file covers testing" metric is marked passed and awards 10 points

#### Scenario: Agent file covers code style
- **WHEN** the AI context file contains a section or explicit mention of code style/conventions
- **THEN** the "agent file covers code style" metric is marked passed and awards 10 points

#### Scenario: Agent file covers architecture rules
- **WHEN** the AI context file contains a section or explicit mention of architectural rules (e.g. referencing `ARCHITECTURE.md`, module boundaries, or protected areas)
- **THEN** the "agent file covers architecture rules" metric is marked passed and awards 10 points

#### Scenario: Agent file covers ADR/spec rules
- **WHEN** the AI context file contains a section or explicit mention of ADR/spec conventions (e.g. referencing `docs/adr/` or `docs/specs/`)
- **THEN** the "agent file covers ADR/spec rules" metric is marked passed and awards 10 points

#### Scenario: docs/specs directory detected (AI Context)
- **WHEN** scanning a repo that contains a `docs/specs/` directory with at least one file inside
- **THEN** the "docs/specs exists" metric is marked passed and awards 10 points

#### Scenario: docs/plans directory detected (AI Context)
- **WHEN** scanning a repo that contains a `docs/plans/` directory with at least one file inside
- **THEN** the "docs/plans exists" metric is marked passed and awards 5 points

#### Scenario: docs/research directory detected (AI Context)
- **WHEN** scanning a repo that contains a `docs/research/` directory with at least one file inside
- **THEN** the "docs/research exists" metric is marked passed and awards 5 points

#### Scenario: Agent ignore file detected
- **WHEN** scanning a repo that contains a `.agentignore` file, or the AI context file documents a list of paths agents must not modify
- **THEN** the ".agentignore or equivalent exists" metric is marked passed and awards 5 points

### Requirement: Maintainability Category Metrics
The system SHALL measure whether future changes are reviewable and safe, using the following metrics: PR template has checklist (15), PR size guidance present (10), conventional commits used recently (15), large files below threshold (10), TODO/FIXME count reasonable (10), dependency lockfile exists (10), CODEOWNERS exists (10), docs updated recently (10), no generated files mixed with source (10).

#### Scenario: PR template checklist detected
- **WHEN** the pull request template contains checkbox syntax (e.g. `- [ ]`) forming a review checklist
- **THEN** the "PR template has checklist" metric is marked passed and awards 15 points

#### Scenario: PR size guidance detected
- **WHEN** the PR template or CONTRIBUTING.md contains guidance about keeping pull requests small (e.g. mentions of line/file count limits or splitting large changes)
- **THEN** the "PR size guidance present" metric is marked passed and awards 10 points

#### Scenario: Conventional commits used recently
- **WHEN** at least 70% of the most recent 20 commits follow the Conventional Commits format (`type(scope): description`)
- **THEN** the "conventional commits used recently" metric is marked passed and awards 15 points

#### Scenario: Large files below threshold
- **WHEN** no source file in the repo exceeds 800 lines
- **THEN** the "large files below threshold" metric is marked passed and awards 10 points

#### Scenario: TODO/FIXME count reasonable
- **WHEN** the ratio of `TODO`/`FIXME` markers to total source lines is below 0.5% (fewer than 1 per 200 lines)
- **THEN** the "TODO/FIXME count reasonable" metric is marked passed and awards 10 points

#### Scenario: Dependency lockfile detected
- **WHEN** scanning a repo that contains a recognized dependency lockfile (e.g. `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`, `Gemfile.lock`, `go.sum`, `Cargo.lock`, `composer.lock`)
- **THEN** the "dependency lockfile exists" metric is marked passed and awards 10 points

#### Scenario: CODEOWNERS detected (Maintainability)
- **WHEN** scanning a repo that contains a `CODEOWNERS` file
- **THEN** the "CODEOWNERS exists" metric is marked passed and awards 10 points

#### Scenario: Docs updated recently
- **WHEN** at least one file under `docs/` or the root README has a commit touching it within the last 90 days
- **THEN** the "docs updated recently" metric is marked passed and awards 10 points

#### Scenario: No generated files mixed with source
- **WHEN** no generated/build artifacts (e.g. files matching common generated-file markers, or a nested `dist`/`build` output directory) are found inside the source root
- **THEN** the "no generated files mixed with source" metric is marked passed and awards 10 points

### Requirement: OpenSpec Provider Metrics
When `openspec` is in the detected provider set, the system SHALL evaluate OpenSpec-specific metrics spanning multiple categories: an Architecture metric for change-level design docs, an Automation Guard Rails metric for CI-enforced validation, and a Maintainability metric for archive hygiene.

#### Scenario: Change design docs detected (Architecture)
- **WHEN** `openspec` is detected and at least one entry under `openspec/changes/*/design.md` exists
- **THEN** the "OpenSpec design docs present" metric is marked passed

#### Scenario: Validate wired into CI (Automation Guard Rails)
- **WHEN** `openspec` is detected and a CI workflow file contains a step running `openspec validate`
- **THEN** the "OpenSpec validate enforced in CI" metric is marked passed

#### Scenario: Archive hygiene detected (Maintainability)
- **WHEN** `openspec` is detected and `openspec/changes/archive/` contains at least one archived change
- **THEN** the "OpenSpec change archive used" metric is marked passed

### Requirement: Claude Provider Metrics
When `claude` is in the detected provider set, the system SHALL evaluate Claude-specific metrics spanning multiple categories: an Automation Guard Rails metric for configured hooks, a Maintainability metric for documented subagents/skills, and a Documentation metric for documented custom commands.

#### Scenario: Hooks configured (Automation Guard Rails)
- **WHEN** `claude` is detected and `.claude/settings.json` (or `.claude/settings.local.json`) defines at least one hook
- **THEN** the "Claude hooks configured" metric is marked passed

#### Scenario: Custom subagents or skills documented (Maintainability)
- **WHEN** `claude` is detected and `.claude/agents/` or `.claude/skills/` contains at least one definition file
- **THEN** the "Claude subagents/skills documented" metric is marked passed

#### Scenario: Custom commands documented (Documentation)
- **WHEN** `claude` is detected and `.claude/commands/` contains at least one command file
- **THEN** the "Claude custom commands documented" metric is marked passed

### Requirement: Universal Provider Metrics
When `universal` is in the detected provider set, the system SHALL evaluate a Universal-specific AI Context metric checking that `AGENTS.md` covers the sections an agent needs to work unaided.

#### Scenario: AGENTS.md section coverage detected
- **WHEN** `universal` is detected and `AGENTS.md` contains headings matching Setup, Conventions, and Testing (case-insensitive, any heading level)
- **THEN** the "AGENTS.md has required sections" metric is marked passed

### Requirement: No-Provider Fallback Behavior
When the detected provider set is exactly `{ none }`, the system SHALL NOT evaluate any provider-scoped metric. Base AI Context metrics (e.g. "AI context file exists") still run and are expected to fail, reflecting that no dedicated agent-context file was found.

#### Scenario: No provider-scoped metrics run
- **WHEN** the detected provider set is `{ none }`
- **THEN** no `provider`-tagged metric is evaluated, and the AI Context category score reflects only base metrics
