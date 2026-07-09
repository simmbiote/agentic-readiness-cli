## MODIFIED Requirements

### Requirement: Human-Readable Report Output

The system SHALL, by default, print a human-readable report to stdout in the following top-to-bottom order: (1) the overall earned/max score and letter grade, (2) a Top Improvements section, (3) the detected provider(s), (4) each category's earned/max score and percentage followed by its metrics and their pass/fail status. Each category heading SHALL show its percentage alongside its earned/max score (e.g. `Documentation: 35/110 (31.8%)`). When stdout is a TTY, the report SHALL be color-coded: passed metric marks in green and failed metric marks in red, category and overall earned/max scores colored by their percentage (green at 80%+, yellow at 50-79%, red below 50%), and the overall grade letter colored by grade band (green for A-range, yellow for B/C-range, red for D/F). When stdout is not a TTY, the report SHALL be printed as plain text with no ANSI color codes.

#### Scenario: Report leads with overall score and grade

- **WHEN** a scan completes
- **THEN** the first content printed in the report is the overall earned/max score and the final letter grade

#### Scenario: Report shows category and metric breakdown

- **WHEN** a scan completes
- **THEN** the printed report lists each of the six categories, after the overall line, Top Improvements section, and provider line, with its earned/max score, and lists each metric under its category with pass/fail status

#### Scenario: Report shows category percentage

- **WHEN** a scan completes
- **THEN** each category heading in the printed report shows that category's percentage alongside its earned/max score

#### Scenario: Report shows detected providers

- **WHEN** a scan completes with a non-empty detected provider set (e.g. `{ openspec, claude }`)
- **THEN** the printed report states which provider(s) were detected, after the Top Improvements section and before the category breakdown

#### Scenario: Report flags no provider detected

- **WHEN** a scan completes with the detected provider set `{ none }`
- **THEN** the printed report states that no agentic provider was detected and that AI Context scoring reflects base metrics only

#### Scenario: Color applied on a TTY

- **WHEN** a scan completes and stdout is a TTY
- **THEN** passed metric marks render in green, failed metric marks render in red, and the overall grade letter is colored according to its grade band

#### Scenario: Color suppressed on a non-TTY

- **WHEN** a scan completes and stdout is not a TTY (e.g. piped to a file or CI log)
- **THEN** the printed report contains no ANSI color escape codes

## ADDED Requirements

### Requirement: Top Improvements Section

The human-readable report SHALL include a "Top Improvements" section, printed immediately after the overall score/grade line and before the detected-providers line, listing the repo's `topImprovements` (see `readiness-scoring`) in ranked order with each entry's description, category, and point value. If `topImprovements` is empty, the section SHALL be omitted entirely.

#### Scenario: Top improvements listed between overall line and providers

- **WHEN** a scan completes with a non-empty `topImprovements` list
- **THEN** the printed report includes a "Top Improvements" section after the overall score/grade line and before the detected-providers line, listing each entry's description, category, and point value in the given order

#### Scenario: Section omitted for a perfect score

- **WHEN** a scan completes with an empty `topImprovements` list (no failing metrics)
- **THEN** the printed report contains no "Top Improvements" section, and the detected-providers line immediately follows the overall score/grade line
