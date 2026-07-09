## MODIFIED Requirements

### Requirement: Human-Readable Report Output

The system SHALL, by default, print a human-readable report to stdout in the following top-to-bottom order: (1) the detected provider(s), (2) each category's earned/max score and percentage followed by its metrics and their pass/fail status, (3) a horizontal divider, (4) the overall earned/max score and letter grade, (5) a Top Improvements section. Each category heading SHALL show its percentage alongside its earned/max score (e.g. `Documentation: 35/110 (31.8%)`). When stdout is a TTY, the report SHALL be color-coded: passed metric marks in green and failed metric marks in red, category and overall earned/max scores colored by their percentage (green at 80%+, yellow at 50-79%, red below 50%), and the overall grade letter colored by grade band (green for A-range, yellow for B/C-range, red for D/F). When stdout is not a TTY, the report SHALL be printed as plain text with no ANSI color codes. When a `--summary` flag is passed, the report SHALL omit each category's individual per-metric pass/fail lines, showing only the category heading (earned/max and percentage); all other sections (providers, divider, overall, Top Improvements) SHALL be unaffected. When a `--detailed` flag is passed (and `--summary` is not), the report SHALL print each *failing* metric's remediation text indented beneath that metric's line; passed metrics and all other sections SHALL be unaffected.

#### Scenario: Report shows detected providers first

- **WHEN** a scan completes with a non-empty detected provider set (e.g. `{ openspec, claude }`)
- **THEN** the printed report states which provider(s) were detected, before the category breakdown

#### Scenario: Report flags no provider detected

- **WHEN** a scan completes with the detected provider set `{ none }`
- **THEN** the printed report states that no agentic provider was detected and that AI Context scoring reflects base metrics only

#### Scenario: Report shows category and metric breakdown

- **WHEN** a scan completes without `--summary`
- **THEN** the printed report lists each of the six categories, after the provider line and before the divider, with its earned/max score, and lists each metric under its category with pass/fail status

#### Scenario: Report shows category percentage

- **WHEN** a scan completes
- **THEN** each category heading in the printed report shows that category's percentage alongside its earned/max score

#### Scenario: Report includes a divider before the summary

- **WHEN** a scan completes
- **THEN** a horizontal divider is printed after the category breakdown and before the overall line

#### Scenario: Report ends with overall score and grade, then Top Improvements

- **WHEN** a scan completes
- **THEN** the overall earned/max score and final letter grade are printed immediately after the divider, followed only by the Top Improvements section if it is non-empty

#### Scenario: Color applied on a TTY

- **WHEN** a scan completes and stdout is a TTY
- **THEN** passed metric marks render in green, failed metric marks render in red, and the overall grade letter is colored according to its grade band

#### Scenario: Color suppressed on a non-TTY

- **WHEN** a scan completes and stdout is not a TTY (e.g. piped to a file or CI log)
- **THEN** the printed report contains no ANSI color escape codes

#### Scenario: Summary flag omits per-metric lines

- **WHEN** the CLI is invoked with `--summary` and a scan completes
- **THEN** the printed report includes the providers line, each category heading with its earned/max/percentage, the divider, the overall line, and Top Improvements section, but no individual per-metric pass/fail lines

#### Scenario: Detailed flag shows remediation for failing metrics

- **WHEN** the CLI is invoked with `--detailed` and a scan completes
- **THEN** each failing metric's line is followed by its remediation text, indented beneath it, while passed metric lines show no remediation text

#### Scenario: Detailed flag has no effect when summary is also set

- **WHEN** the CLI is invoked with both `--summary` and `--detailed`
- **THEN** the printed report has no per-metric lines at all (per the summary behavior), and therefore no remediation text is shown

### Requirement: Top Improvements Section

The human-readable report SHALL include a "Top Improvements" section, printed immediately after the overall score/grade line, as the final section of the report, listing the repo's `topImprovements` (see `readiness-scoring`) in ranked order with each entry's instruction, category, and point value. If `topImprovements` is empty, the section SHALL be omitted entirely, and the overall line SHALL be the last content in the report.

#### Scenario: Top improvements listed as the final section

- **WHEN** a scan completes with a non-empty `topImprovements` list
- **THEN** the printed report includes a "Top Improvements" section immediately after the overall score/grade line, as the last section of the report, listing each entry's instruction, category, and point value in the given order

#### Scenario: Section omitted for a perfect score

- **WHEN** a scan completes with an empty `topImprovements` list (no failing metrics)
- **THEN** the printed report contains no "Top Improvements" section, and the overall line is the last content printed

#### Scenario: Instruction text shown, not description

- **WHEN** a scan completes with a non-empty `topImprovements` list
- **THEN** each printed entry shows the failing metric's imperative instruction (e.g. "Add a CONTRIBUTING.md file"), not its checklist-style description (e.g. "CONTRIBUTING.md exists")

### Requirement: JSON Output Mode

The system SHALL support a `--json` flag that, when passed, emits the scoring result as structured JSON instead of the human-readable report, and suppresses other non-JSON output. When `--summary` is also passed, each entry in the emitted JSON's `categories` array SHALL omit its `metrics` field, keeping `category`, `earned`, `max`, and `percentage`; the top-level `topImprovements`, `providers`, and `overall` fields SHALL be unaffected. When `--detailed` is also passed, each metric result within `categories[].metrics` SHALL include a `remediation` field; without `--detailed`, metric results SHALL NOT include `remediation`. When an `--output <path>` flag is also passed (and `--html` is not), the system SHALL write the JSON to `<path>` (creating any missing parent directories) instead of printing it to stdout, and SHALL print a confirmation message to stdout naming that path. Without `--output`, `--json` output SHALL continue to print to stdout as before.

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

#### Scenario: JSON written to the given output path

- **WHEN** the CLI is invoked with `--json --output <path>`
- **THEN** a file is written at `<path>` containing the JSON document, and stdout contains a confirmation naming that path instead of the JSON itself

#### Scenario: JSON output creates missing parent directories

- **WHEN** `--output` points into a directory that does not yet exist and `--json` (without `--html`) is passed
- **THEN** the system creates the missing directories before writing the file

### Requirement: Process Exit Code

The system SHALL exit with status code 0 after successfully producing and, if requested, writing or opening a report, regardless of the grade achieved. It SHALL exit with a non-zero status when the scan itself fails to run (e.g., invalid path), or when a requested output file cannot be written (e.g., permission denied, invalid `--output` path), whether that output is HTML or JSON.

#### Scenario: Low grade still exits zero

- **WHEN** a scan completes successfully and the resulting grade is "F"
- **THEN** the CLI process exits with status code 0

#### Scenario: Output write failure exits non-zero

- **WHEN** the CLI is invoked with `--output <path>` (with either `--html` or `--json`) and `<path>` cannot be written (e.g. permission denied)
- **THEN** the CLI exits with a non-zero status and prints an error message

## ADDED Requirements

### Requirement: HTML Report Output

When a `--html` flag is passed, the system SHALL render the scan result as a self-contained HTML document (inline CSS, no external assets) instead of the text or JSON report, in the following top-to-bottom order: (1) the overall earned/max score and letter grade, (2) a Top Improvements section, (3) the detected provider(s), (4) the category/metric breakdown. The HTML SHALL color-code pass/fail status and percentage bands equivalently to the terminal report's color scheme (green/yellow/red), independent of TTY detection. `--summary` and `--detailed` SHALL apply to the HTML output the same way they apply to the text report. When both `--html` and `--json` are passed, `--html` SHALL take precedence and no JSON SHALL be emitted.

#### Scenario: HTML flag renders a full report

- **WHEN** the CLI is invoked with `--html` and a scan completes
- **THEN** the rendered output is a single self-contained HTML document containing, in order, the overall score/grade, a Top Improvements section (if non-empty), the detected providers, and the category/metric breakdown

#### Scenario: HTML summary flag omits per-metric rows

- **WHEN** the CLI is invoked with `--html --summary`
- **THEN** the HTML's category sections show only category headings with earned/max/percentage, with no individual per-metric rows

#### Scenario: HTML detailed flag shows remediation

- **WHEN** the CLI is invoked with `--html --detailed`
- **THEN** each failing metric's row in the HTML is followed by its remediation text, while passing metrics show no remediation text

#### Scenario: HTML takes precedence over JSON

- **WHEN** the CLI is invoked with both `--html` and `--json`
- **THEN** the produced output is the HTML document, and no JSON is emitted

### Requirement: HTML Output Destination

When `--html` is passed together with an `--output <path>` flag, the system SHALL write the rendered HTML to `<path>` (creating any missing parent directories) and print a confirmation message to stdout, without opening a browser. When `--html` is passed without `--output`, the system SHALL write the rendered HTML to a temporary file and attempt to open it in the user's default browser via a platform-appropriate command, printing the temporary file's path regardless of whether opening the browser succeeds. This requirement's file-writing/browser-opening behavior applies only when `--html` is passed; see `JSON Output Mode` for `--output`'s effect when `--json` is passed instead (without `--html`). An `--output` flag passed without either `--html` or `--json` SHALL have no effect.

#### Scenario: HTML written to the given output path

- **WHEN** the CLI is invoked with `--html --output <path>`
- **THEN** a file is written at `<path>` containing the rendered HTML, and stdout contains a confirmation naming that path

#### Scenario: HTML output creates missing parent directories

- **WHEN** `--output` points into a directory that does not yet exist
- **THEN** the system creates the missing directories before writing the file

#### Scenario: HTML opened in browser without --output

- **WHEN** the CLI is invoked with `--html` and no `--output` flag
- **THEN** the rendered HTML is written to a temporary file, the system attempts to open that file in the default browser, and the temporary file's path is printed to stdout

#### Scenario: Output flag ignored without html or json flag

- **WHEN** the CLI is invoked with `--output <path>` but without `--html` and without `--json`
- **THEN** the flag has no effect, and the human-readable report is produced exactly as if `--output` were absent
