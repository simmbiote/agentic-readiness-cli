## ADDED Requirements

### Requirement: Generated Metrics Reference Table

The system SHALL provide a script (invoked via `npm run docs:metrics`) that reads the metric catalog and writes a Markdown reference file to `docs/METRICS.md`, containing one table row per metric with columns: Category, Metric, Points, Description, Instruction, and Remediation, grouped by category in the same order as the report (`CATEGORIES`). The generated file SHALL be derived entirely from the catalog (`src/metrics/*.ts`) — it SHALL NOT contain hand-authored content that the catalog does not already provide.

#### Scenario: Table includes every metric

- **WHEN** `npm run docs:metrics` is run
- **THEN** `docs/METRICS.md` contains exactly one table row for every metric in the catalog, with no omissions or duplicates

#### Scenario: Table rows show all five text fields

- **WHEN** `npm run docs:metrics` is run
- **THEN** each row includes that metric's category, id, points, description, instruction, and remediation

#### Scenario: Table grouped by category in report order

- **WHEN** `npm run docs:metrics` is run
- **THEN** rows are grouped by category, ordered the same as the six categories appear in the human-readable report

### Requirement: README Links to Metrics Reference

The project's `README.md` SHALL contain a link to `docs/METRICS.md`.

#### Scenario: README references the metrics table

- **WHEN** a reader views `README.md`
- **THEN** it contains a link pointing to `docs/METRICS.md`
