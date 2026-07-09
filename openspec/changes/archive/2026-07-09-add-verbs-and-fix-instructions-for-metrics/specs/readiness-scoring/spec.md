## MODIFIED Requirements

### Requirement: Top Improvements Ranking

The system SHALL compute `topImprovements` as the 5 applicable metrics with `passed: false` having the highest `points` value, across all categories, sorted descending by points; ties SHALL be broken by category order (per `CATEGORIES`) then by within-category order. If fewer than 5 applicable metrics are failing, `topImprovements` SHALL contain all of them. If none are failing, `topImprovements` SHALL be an empty array. Each entry SHALL carry the metric's `instruction` (its imperative fix text, see `readiness-metrics`) rather than its checklist-style `description`.

#### Scenario: Top 5 failing metrics ranked by points

- **WHEN** a repo has more than 5 failing applicable metrics with varying point values
- **THEN** `topImprovements` contains exactly the 5 highest-point failing metrics, in descending point order

#### Scenario: Fewer than 5 failing metrics

- **WHEN** a repo has 3 failing applicable metrics
- **THEN** `topImprovements` contains exactly those 3 metrics, in descending point order

#### Scenario: No failing metrics

- **WHEN** every applicable metric in a repo passes
- **THEN** `topImprovements` is an empty array

#### Scenario: Tie broken by category order

- **WHEN** two failing metrics in different categories share the same point value
- **THEN** the metric in the category that appears earlier in `CATEGORIES` is ranked first

#### Scenario: Entries carry instruction text, not description

- **WHEN** `topImprovements` is computed for a repo with failing metrics
- **THEN** each entry includes the failing metric's `instruction` field, and does not include its `description` field
