# readiness-scoring Specification

## Purpose

Aggregate per-metric outcomes into per-category and overall scores, map the overall score to a letter grade, and produce the structured scoring result — including the repo's detected provider set — consumed by the CLI.

## Requirements

### Requirement: Category Score Aggregation

The system SHALL compute a category score for each of the six categories as the sum of points earned by all passed _applicable_ metrics within that category, alongside the maximum possible score for that category (sum of all _applicable_ metric points in the category, regardless of pass/fail), and that category's percentage (earned/max × 100, or 0 when max is 0). A metric is applicable if it has no `provider` tag, or if its `provider` tag is present in the repo's detected provider set (see `provider-detection` and the Provider-Scoped Metrics requirement in `readiness-metrics`). Metrics whose provider is not detected SHALL be excluded from both the earned and max totals.

#### Scenario: Category score sums passed metric points

- **WHEN** two of three Documentation metrics pass, worth 10 and 15 points respectively, and the third (10 points) fails
- **THEN** the Documentation category score is 25 out of a possible 35

#### Scenario: Category with no passing metrics scores zero

- **WHEN** every applicable metric in a category fails
- **THEN** that category's earned score is 0, and its max possible score equals the sum of all its applicable metric points

#### Scenario: Non-applicable provider metrics excluded from category max

- **WHEN** a category contains a `provider: claude` metric worth 10 points and `claude` is not in the detected provider set
- **THEN** that metric contributes 0 to both the earned and max score for the category

#### Scenario: Category percentage computed from earned and max

- **WHEN** a category's earned score is 25 and its max score is 50
- **THEN** that category's percentage is 50

#### Scenario: Category percentage is zero when max is zero

- **WHEN** a category has no applicable metrics (max is 0)
- **THEN** that category's percentage is 0

### Requirement: Overall Score Aggregation

The system SHALL compute an overall score as the sum of all category earned scores, and an overall maximum as the sum of all category max scores, across all six categories, using each category's applicable-metric totals (see Category Score Aggregation). Categories SHALL NOT be weighted differently from one another. Because provider-scoped metrics are only applicable when their provider is detected, the overall max score is repo-specific and SHALL NOT be compared across repos with different detected providers as if it were a fixed constant.

#### Scenario: Overall score sums all categories

- **WHEN** each of the six categories has an earned score and a max score
- **THEN** the overall earned score equals the sum of all six category earned scores, and the overall max score equals the sum of all six category max scores

#### Scenario: Overall max varies with detected providers

- **WHEN** two repos are scanned, one with `openspec` detected (unlocking extra applicable points) and one with no provider detected
- **THEN** the two repos' overall max scores may differ, reflecting the different sets of applicable metrics

### Requirement: Detected Providers in Scoring Result

The scoring result SHALL include the repo's detected provider set (see `provider-detection`) alongside the per-metric, per-category, and overall totals.

#### Scenario: Scoring result reports detected providers

- **WHEN** a scan detects `{ openspec }` as the provider set
- **THEN** the scoring result includes `providers: ["openspec"]`

### Requirement: Letter Grade Mapping

The system SHALL map the overall score to a letter grade based on the percentage of overall earned score over overall max score, using the scale: A+ (>=97%), A (93-96%), A- (90-92%), B+ (87-89%), B (83-86%), B- (80-82%), C+ (77-79%), C (73-76%), C- (70-72%), D+ (67-69%), D (60-66%), F (<60%).

#### Scenario: Perfect score yields A+

- **WHEN** the overall earned score equals the overall max score (100%)
- **THEN** the reported grade is "A+"

#### Scenario: Zero score yields F

- **WHEN** the overall earned score is 0
- **THEN** the reported grade is "F"

#### Scenario: Boundary percentage maps to correct grade

- **WHEN** the overall percentage is exactly 90%
- **THEN** the reported grade is "A-", consistent with the defined scale boundaries

### Requirement: Scoring Result Structure

The system SHALL produce a scoring result containing, at minimum: per-metric pass/fail status and points, per-category earned/max scores and percentage, the overall earned/max score, the final letter grade, and a `topImprovements` ranked list of the currently-failing applicable metrics with the highest point value (see Top Improvements Ranking).

#### Scenario: Scoring result includes all required fields

- **WHEN** the scoring engine finishes evaluating a repo
- **THEN** the result includes per-metric outcomes, per-category totals and percentage, an overall total, a letter grade, and a `topImprovements` list

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
