## MODIFIED Requirements

### Requirement: Metric Catalog Structure

The system SHALL define a metrics catalog grouped into exactly six categories: Documentation, Architecture, Testing, Automation Guard Rails, AI Context, and Maintainability. Each metric in the catalog SHALL have a unique id, a category, a point value greater than zero, a human-readable checklist-style description, an imperative instruction describing the concrete fix when the metric fails, a remediation explanation of what the check means and what is expected to satisfy it, an optional `provider` tag, and a detection rule that operates on a scanned repo file tree.

#### Scenario: Catalog covers all six categories

- **WHEN** the metrics catalog is loaded
- **THEN** it contains at least one metric for each of Documentation, Architecture, Testing, Automation Guard Rails, AI Context, and Maintainability

#### Scenario: Metric ids are unique

- **WHEN** the metrics catalog is loaded
- **THEN** no two metrics share the same id

#### Scenario: Every metric has an instruction

- **WHEN** the metrics catalog is loaded
- **THEN** every metric has a non-empty `instruction` string distinct from its `description`

#### Scenario: Every metric has a remediation explanation

- **WHEN** the metrics catalog is loaded
- **THEN** every metric has a non-empty `remediation` string distinct from its `description` and `instruction`
