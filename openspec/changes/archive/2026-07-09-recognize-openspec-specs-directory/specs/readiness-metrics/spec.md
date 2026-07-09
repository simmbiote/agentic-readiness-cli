## MODIFIED Requirements

### Requirement: Documentation Category Metrics

The system SHALL measure whether repo knowledge is explicit and versioned, using the following metrics: README exists (10), README has setup/run/test sections (15), CONTRIBUTING.md exists (10), `docs/specs/` exists (10), `docs/plans/` exists (10), `docs/research/` exists (10), `docs/adr/` exists (10), ADR index exists (10), PR template exists (10), Spec/ADR templates exist (5). The "`docs/specs/` exists" metric SHALL also pass when `openspec/specs/` exists and the repo's detected provider set includes `openspec`, even if `docs/specs/` does not exist.

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

#### Scenario: openspec/specs directory recognized in place of docs/specs (Documentation)

- **WHEN** scanning a repo with the `openspec` provider detected, that contains an `openspec/specs/` directory but no `docs/specs/` directory
- **THEN** the "docs/specs/ exists" metric is marked passed and awards 10 points

#### Scenario: openspec/specs directory ignored without the openspec provider detected (Documentation)

- **WHEN** scanning a repo without the `openspec` provider detected, that contains an `openspec/specs/` directory but no `docs/specs/` directory
- **THEN** the "docs/specs/ exists" metric is marked failed and awards zero points

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

### Requirement: AI Context Category Metrics

The system SHALL measure whether Claude or other coding agents have explicit repo-level guidance, using the following metrics: AGENTS.md exists (20), CLAUDE.md shim/import exists (15), agent file covers testing (10), agent file covers code style (10), agent file covers architecture rules (10), agent file covers ADR/spec rules (10), `docs/specs` exists (10), `docs/plans` exists (5), `docs/research` exists (5), `.agentignore` or equivalent exists (5). The "`docs/specs` exists" metric SHALL also pass when `openspec/specs/` exists and the repo's detected provider set includes `openspec`, even if `docs/specs/` does not exist.

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

#### Scenario: openspec/specs directory recognized in place of docs/specs (AI Context)

- **WHEN** scanning a repo with the `openspec` provider detected, that contains an `openspec/specs/` directory but no `docs/specs/` directory
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
