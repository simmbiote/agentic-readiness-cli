# readiness-cli Specification

## Purpose

Provide the command-line interface for scanning a repository, driving the full metric catalog against it, and reporting the resulting readiness score either as a human-readable report or as structured JSON.

## Requirements

### Requirement: Scan Target Repo Path

The system SHALL require an explicit `scan` subcommand as the first command-line argument, followed optionally by a local filesystem path to a repository, and SHALL run the full metric catalog against that path. If no path is given after `scan`, it SHALL default to the current working directory. If the CLI is invoked without the `scan` subcommand as the first argument, it SHALL exit with a non-zero status and print a usage error naming `scan` as the required subcommand, without attempting to score.

#### Scenario: Explicit path scanned

- **WHEN** the CLI is invoked as `scan <path>` with `<path>` pointing to a valid directory
- **THEN** the scanner walks that directory and evaluates all metrics against it

#### Scenario: Default to current directory

- **WHEN** the CLI is invoked as `scan` with no path argument
- **THEN** the scanner walks the current working directory

#### Scenario: Invalid path rejected

- **WHEN** the CLI is invoked as `scan <path>` where `<path>` does not exist or is not a directory
- **THEN** the CLI exits with a non-zero status and prints an error message, without attempting to score

#### Scenario: Missing scan subcommand rejected

- **WHEN** the CLI is invoked without `scan` as the first argument (e.g. a bare path, a flag, or no arguments at all)
- **THEN** the CLI exits with a non-zero status and prints a usage error naming `scan` as the required subcommand, without attempting to score

### Requirement: Excluded Directories

The system SHALL exclude common vendored/generated directories (at minimum `node_modules`, `.git`, `dist`, `build`) from the filesystem walk used for metric detection.

#### Scenario: Vendored directory contents ignored

- **WHEN** a repo contains a `node_modules/` directory with files that would otherwise match a metric's detection rule
- **THEN** those files are not considered when evaluating metrics

### Requirement: Human-Readable Report Output

The system SHALL, by default, print a human-readable report to stdout in the following top-to-bottom order: (1) the overall earned/max score and letter grade, (2) a Top Improvements section, (3) the detected provider(s), (4) each category's earned/max score and percentage followed by its metrics and their pass/fail status. Each category heading SHALL show its percentage alongside its earned/max score (e.g. `Documentation: 35/110 (31.8%)`). When stdout is a TTY, the report SHALL be color-coded: passed metric marks in green and failed metric marks in red, category and overall earned/max scores colored by their percentage (green at 80%+, yellow at 50-79%, red below 50%), and the overall grade letter colored by grade band (green for A-range, yellow for B/C-range, red for D/F). When stdout is not a TTY, the report SHALL be printed as plain text with no ANSI color codes. When a `--summary` flag is passed, the report SHALL omit each category's individual per-metric pass/fail lines, showing only the category heading (earned/max and percentage); all other sections (overall, Top Improvements, providers) SHALL be unaffected.

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

### Requirement: Top Improvements Section

The human-readable report SHALL include a "Top Improvements" section, printed immediately after the overall score/grade line and before the detected-providers line, listing the repo's `topImprovements` (see `readiness-scoring`) in ranked order with each entry's description, category, and point value. If `topImprovements` is empty, the section SHALL be omitted entirely.

#### Scenario: Top improvements listed between overall line and providers

- **WHEN** a scan completes with a non-empty `topImprovements` list
- **THEN** the printed report includes a "Top Improvements" section after the overall score/grade line and before the detected-providers line, listing each entry's description, category, and point value in the given order

#### Scenario: Section omitted for a perfect score

- **WHEN** a scan completes with an empty `topImprovements` list (no failing metrics)
- **THEN** the printed report contains no "Top Improvements" section, and the detected-providers line immediately follows the overall score/grade line

### Requirement: JSON Output Mode

The system SHALL support a `--json` flag that, when passed, emits the scoring result as structured JSON to stdout instead of the human-readable report, and suppresses other non-JSON output. When `--summary` is also passed, each entry in the emitted JSON's `categories` array SHALL omit its `metrics` field, keeping `category`, `earned`, `max`, and `percentage`; the top-level `topImprovements`, `providers`, and `overall` fields SHALL be unaffected.

#### Scenario: JSON flag emits structured result

- **WHEN** the CLI is invoked with `--json`
- **THEN** stdout contains a single JSON document representing the scoring result (per-metric, per-category, overall, grade, and detected providers) and no other text

#### Scenario: Summary flag trims per-metric detail from JSON output

- **WHEN** the CLI is invoked with both `--json` and `--summary`
- **THEN** stdout contains a single JSON document whose `categories` entries have no `metrics` field, while `topImprovements`, `providers`, and `overall` are present and complete

### Requirement: Process Exit Code

The system SHALL exit with status code 0 after successfully producing a report, regardless of the grade achieved. It SHALL exit with a non-zero status only when the scan itself fails to run (e.g., invalid path).

#### Scenario: Low grade still exits zero

- **WHEN** a scan completes successfully and the resulting grade is "F"
- **THEN** the CLI process exits with status code 0
