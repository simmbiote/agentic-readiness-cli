## ADDED Requirements

### Requirement: CLI Package and Binary Name

The system SHALL be published to npm under the package name `agenticgrade`, and SHALL expose its command-line entry point as a binary named `agenticgrade`. All user-facing strings that name the invoking command (CLI usage/error messages, generated HTML report titles, and any temp-file naming derived from the tool's name) SHALL use `agenticgrade` rather than any prior name.

#### Scenario: Invoked via the published binary name

- **WHEN** the package is installed (locally or globally) and run via `npx agenticgrade scan [path]`
- **THEN** the CLI runs the scan as documented, exactly as it would if invoked via a local `dev` script

#### Scenario: Usage error names the current binary

- **WHEN** the CLI is invoked without the required `scan` subcommand
- **THEN** the printed usage error references `agenticgrade` (not any prior package name) as the command name

#### Scenario: Generated HTML report reflects the current name

- **WHEN** a scan is run with `--html`
- **THEN** the rendered report's `<title>` and any temp-file name derived from the tool's name use `agenticgrade`
