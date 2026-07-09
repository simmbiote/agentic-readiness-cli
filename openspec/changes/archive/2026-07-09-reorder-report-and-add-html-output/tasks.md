## 1. Text Report: Reorder + Divider

- [x] 1.1 In `src/report.ts`, reorder `renderReport` to: providers → categories → divider → overall → Top Improvements
- [x] 1.2 Add a divider constant (e.g. `const DIVIDER = '─'.repeat(40);`) rendered dim via `pc.dim`, printed between the category breakdown and the overall line
- [x] 1.3 Update `tests/report.test.ts`'s ordering test to assert providers → categories → divider → overall → Top Improvements
- [x] 1.4 Add a test asserting the divider line is present between the breakdown and the overall line
- [x] 1.5 Update the "omitted for a perfect score" test to assert the overall line is the last content when `topImprovements` is empty

## 2. HTML Report Rendering

- [x] 2.1 Create `src/html-report.ts` exporting `renderHtmlReport(result: ScoringResult, options?: { summary?: boolean; detailed?: boolean }): string`
- [x] 2.2 Build a self-contained HTML document (inline `<style>`, no external assets) in order: overall score/grade, Top Improvements (if non-empty), detected providers, category/metric breakdown
- [x] 2.3 Color-code pass/fail and percentage bands via CSS classes mirroring the terminal's green/yellow/red thresholds, applied unconditionally (no TTY check needed for HTML)
- [x] 2.4 Respect `summary` (omit per-metric rows, headings only) and `detailed` (show remediation text under failing metric rows) options
- [x] 2.5 Add a small `escapeHtml` helper and apply it to all interpolated text (descriptions, instructions, remediation, provider names)
- [x] 2.6 Add `tests/html-report.test.ts` covering: full structure/order, `summary` omits per-metric rows, `detailed` shows remediation only for failing metrics, HTML-escaping of a metric string containing `<`/`&`

## 3. CLI: `--html` and `--output` Flags

- [x] 3.1 Add `--html` and `--output <path>` to `parseArgs` in `src/cli.ts` (`--output` consumes the following argv token as its value)
- [x] 3.2 In `main`, when `html` is set: call `renderHtmlReport(result, { summary, detailed })`; this takes precedence over `json` (check `html` before `json`)
- [x] 3.3 Extract a small shared helper (e.g. `writeOutputFile(path, content)`) that resolves the path, creates missing parent directories (`mkdirSync(path.dirname(resolved), { recursive: true })`), writes the file, and returns success/failure — used by both the HTML and JSON `--output` paths
- [x] 3.4 When `html` and `output` are both set: write the HTML via the shared helper, print a confirmation message (e.g. `Wrote HTML report to <path>`), return 0; on write failure, print an error message and return 1
- [x] 3.5 When `html` is set without `output`: write to `path.join(os.tmpdir(), \`agentlint-report-${Date.now()}.html\`)`, print the temp file path, then attempt to open it via a platform-specific `child_process.spawn` (macOS `open`, Windows `cmd /c start "" <path>`, other `xdg-open`) with `detached: true, stdio: 'ignore'`, wrapped in try/catch so a spawn failure doesn't affect the exit code
- [x] 3.6 When `json` (and not `html`) and `output` are both set: serialize the JSON (respecting the existing `summary`/`detailed` trimming logic) and write it via the shared helper instead of `console.log`; print a confirmation message (e.g. `Wrote JSON report to <path>`), return 0; on write failure, print an error message and return 1
- [x] 3.7 When `output` is set without `html` and without `json`: no-op (ignore the flag; proceed with the normal text report)
- [x] 3.8 Update the usage error message to include `[--html] [--output <path>]`

## 4. CLI Tests

- [x] 4.1 Add a test: `--html` writes a temp HTML file (starts with `<!doctype html>`) and attempts to open it, instead of printing raw HTML to stdout (adjusted to match the finalized "write temp file + open browser" design rather than the originally-drafted "prints HTML to stdout")
- [x] 4.2 Add a test: `--html --output <tmpfile>` writes the file (assert file contents via `readFileSync`) and prints a confirmation containing the path
- [x] 4.3 Add a test: `--html --output` into a nested, not-yet-existing directory creates the directory and succeeds
- [x] 4.4 Add a test: `--html --json` produces HTML, not JSON (`--html` precedence), and `--output` in that combination writes the HTML
- [x] 4.5 Add a test: `--json --output <tmpfile>` writes valid JSON to the file (parse it back and assert shape) and prints a confirmation containing the path, with nothing printed to stdout except the confirmation
- [x] 4.6 Add a test: `--json --output` into a nested, not-yet-existing directory creates the directory and succeeds
- [x] 4.7 Add a test: `--output <path>` without `--html` and without `--json` has no effect (output matches the plain text report)
- [x] 4.8 Add a test: `--html --output` to an unwritable path (e.g. a path under a file, not a directory) exits non-zero with an error message
- [x] 4.9 Add a test: `--json --output` to an unwritable path exits non-zero with an error message

## 5. Documentation

- [x] 5.1 Update `README.md`'s example report order to match providers → categories → divider → overall → Top Improvements (README had no literal example output block, so added a descriptive sentence stating the order instead)
- [x] 5.2 Document `--html` and `--output` in `README.md`'s usage section, including: `--html --output` writes a file, `--html` alone opens the browser, `--json --output` writes a file, `--json` alone prints to stdout (unchanged), and the PDF-printing use case for `--html`

## 6. Verification

- [x] 6.1 Run `npm run build && npm test` and confirm all tests pass
- [x] 6.2 Run `node dist/cli.js scan .` and visually confirm the new order (providers, categories, divider, overall, Top Improvements)
- [x] 6.3 Run `node dist/cli.js scan . --html --output /tmp/agentlint-report.html` and open the file manually to confirm it renders correctly with color bands
- [x] 6.4 Run `node dist/cli.js scan . --html` (no `--output`) and confirm it opens in the default browser and prints the temp file path
- [x] 6.5 Run `node dist/cli.js scan . --json --output /tmp/agentlint-report.json` and confirm the file contains valid JSON and stdout shows only the confirmation message
- [x] 6.6 Run `npm run lint` and confirm it passes
