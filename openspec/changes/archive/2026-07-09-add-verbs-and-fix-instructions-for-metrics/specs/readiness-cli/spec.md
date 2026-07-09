## MODIFIED Requirements

### Requirement: Human-Readable Report Output

The system SHALL, by default, print a human-readable report to stdout in the following top-to-bottom order: (1) the overall earned/max score and letter grade, (2) a Top Improvements section, (3) the detected provider(s), (4) each category's earned/max score and percentage followed by its metrics and their pass/fail status. Each category heading SHALL show its percentage alongside its earned/max score (e.g. `Documentation: 35/110 (31.8%)`). When stdout is a TTY, the report SHALL be color-coded: passed metric marks in green and failed metric marks in red, category and overall earned/max scores colored by their percentage (green at 80%+, yellow at 50-79%, red below 50%), and the overall grade letter colored by grade band (green for A-range, yellow for B/C-range, red for D/F). When stdout is not a TTY, the report SHALL be printed as plain text with no ANSI color codes. When a `--summary` flag is passed, the report SHALL omit each category's individual per-metric pass/fail lines, showing only the category heading (earned/max and percentage); all other sections (overall, Top Improvements, providers) SHALL be unaffected. When a `--detailed` flag is passed (and `--summary` is not), the report SHALL print each *failing* metric's remediation text indented beneath that metric's line; passed metrics and all other sections SHALL be unaffected.

#### Scenario: Report leads with overall score and grade

- **WHEN** a scan completes
- **THEN** the first content printed in the report is the overall earned/max score and the final letter grade

#### Scenario: Report shows category and metric breakdown

- **WHEN** a scan completes without `--summary`
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

#### Scenario: Summary flag omits per-metric lines

- **WHEN** the CLI is invoked with `--summary` and a scan completes
- **THEN** the printed report includes the overall line, Top Improvements section, providers line, and each category heading with its earned/max/percentage, but no individual per-metric pass/fail lines

#### Scenario: Detailed flag shows remediation for failing metrics

- **WHEN** the CLI is invoked with `--detailed` and a scan completes
- **THEN** each failing metric's line is followed by its remediation text, indented beneath it, while passed metric lines show no remediation text

#### Scenario: Detailed flag has no effect when summary is also set

- **WHEN** the CLI is invoked with both `--summary` and `--detailed`
- **THEN** the printed report has no per-metric lines at all (per the summary behavior), and therefore no remediation text is shown

### Requirement: JSON Output Mode

The system SHALL support a `--json` flag that, when passed, emits the scoring result as structured JSON to stdout instead of the human-readable report, and suppresses other non-JSON output. When `--summary` is also passed, each entry in the emitted JSON's `categories` array SHALL omit its `metrics` field, keeping `category`, `earned`, `max`, and `percentage`; the top-level `topImprovements`, `providers`, and `overall` fields SHALL be unaffected. When `--detailed` is also passed, each metric result within `categories[].metrics` SHALL include a `remediation` field; without `--detailed`, metric results SHALL NOT include `remediation`.

#### Scenario: JSON flag emits structured result

- **WHEN** the CLI is invoked with `--json`
- **THEN** stdout contains a single JSON document representing the scoring result (per-metric, per-category, overall, grade, and detected providers) and no other text

#### Scenario: Summary flag trims per-metric detail from JSON output

- **WHEN** the CLI is invoked with both `--json` and `--summary`
- **THEN** stdout contains a single JSON document whose `categories` entries have no `metrics` field, while `topImprovements`, `providers`, and `overall` are present and complete

#### Scenario: Detailed flag adds remediation to JSON output

- **WHEN** the CLI is invoked with both `--json` and `--detailed`
- **THEN** each metric result in the emitted JSON includes a `remediation` field

#### Scenario: Remediation absent from JSON output by default

- **WHEN** the CLI is invoked with `--json` and without `--detailed`
- **THEN** no metric result in the emitted JSON includes a `remediation` field

### Requirement: Top Improvements Section

The human-readable report SHALL include a "Top Improvements" section, printed immediately after the overall score/grade line and before the detected-providers line, listing the repo's `topImprovements` (see `readiness-scoring`) in ranked order with each entry's instruction, category, and point value. If `topImprovements` is empty, the section SHALL be omitted entirely.

#### Scenario: Top improvements listed between overall line and providers

- **WHEN** a scan completes with a non-empty `topImprovements` list
- **THEN** the printed report includes a "Top Improvements" section after the overall score/grade line and before the detected-providers line, listing each entry's instruction, category, and point value in the given order

#### Scenario: Section omitted for a perfect score

- **WHEN** a scan completes with an empty `topImprovements` list (no failing metrics)
- **THEN** the printed report contains no "Top Improvements" section, and the detected-providers line immediately follows the overall score/grade line

#### Scenario: Instruction text shown, not description

- **WHEN** a scan completes with a non-empty `topImprovements` list
- **THEN** each printed entry shows the failing metric's imperative instruction (e.g. "Add a CONTRIBUTING.md file"), not its checklist-style description (e.g. "CONTRIBUTING.md exists")
