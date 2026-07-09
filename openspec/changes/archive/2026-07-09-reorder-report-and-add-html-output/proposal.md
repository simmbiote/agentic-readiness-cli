## Why

The text report currently prints Overall and Top Improvements first, then the full category/metric breakdown — so on any repo with more than a screenful of metrics, the summary scrolls off the top and the user has to scroll back up to see their score and what to fix. Separately, there's no way to get a shareable, printable version of a scan — JSON isn't human-friendly and the terminal report isn't paginated or styled for printing/PDF export.

## What Changes

- Reorder the human-readable report to: (1) detected providers, (2) category/metric breakdown, (3) a horizontal divider, (4) the overall score/grade, (5) Top Improvements. This puts the summary at the bottom, where it's still on screen after a long breakdown, without needing to scroll.
- Add an `--html` flag that renders the scan result as a self-contained HTML document instead of the text/JSON report. The HTML keeps the original top-first order (Overall, Top Improvements, providers, then the category breakdown) since it's a printed/paged document, not a scrolling terminal — the reordering above is specific to the terminal's scrollback problem and doesn't apply here. `--summary` and `--detailed` apply to the HTML output the same way they apply to the text report.
- Add an `--output <path>` flag, meaningful alongside `--html` or `--json`: with `--html`, the HTML is written to that file path (parent directories created as needed) and a confirmation is printed; without `--output`, the HTML is written to a temp file and opened in the user's default browser automatically (making it easy to print as a PDF via the browser's print dialog). With `--json`, `--output` writes the JSON to that file path instead of printing it to stdout, with the same confirmation/parent-directory behavior — JSON has no browser-opening fallback, since opening JSON in a browser isn't a meaningful default. `--output` without either `--html` or `--json` has no effect.
- When both `--html` and `--json` are passed, `--html` takes precedence and no JSON is emitted (so `--output` in that case writes the HTML, not JSON).
- **BREAKING** (report layout only, not JSON shape): the text report's section order changes; any script scraping the text report by position (rather than by label) will need updating. `--json` output is unaffected by the reordering.

## Capabilities

### New Capabilities

(none — this extends the existing `readiness-cli` capability)

### Modified Capabilities

- `readiness-cli`: "Human-Readable Report Output" requirement changes to the new section order plus a divider; "Top Improvements Section" requirement changes to reflect its new bottom position; "JSON Output Mode" requirement changes to support writing to `--output` instead of stdout; "Process Exit Code" requirement changes to cover output file-write failures generally (HTML or JSON). New requirements are added for HTML report content and HTML output destination (file vs. browser).

## Impact

- `src/report.ts`: reorder `renderReport`'s sections; add a divider constant/line.
- New `src/html-report.ts`: `renderHtmlReport(result, options)` producing a self-contained HTML string (inline CSS, no external assets), mirroring the terminal's color bands and honoring `summary`/`detailed`.
- `src/cli.ts`: parse `--html` and `--output <path>`; when `--html` is set, write via `renderHtmlReport` to either the given `--output` path or a temp file, opening the temp file in the browser via a platform-specific `child_process.spawn` (macOS `open`, Windows `cmd /c start`, Linux `xdg-open`) — no new npm dependency; when `--json` is set and `--output` is given, write the serialized JSON to that path instead of `console.log`-ing it.
- `tests/report.test.ts`: update section-order assertions; add divider assertions.
- `tests/cli.test.ts`: add tests for `--html`, `--html --output`, `--json --output`, and `--html` precedence over `--json`.
- `README.md`: document the new section order, `--html`, and `--output` (for both `--html` and `--json`).
- No changes to scoring, detection, or the `scan` subcommand/`--summary`/`--detailed` semantics themselves.
