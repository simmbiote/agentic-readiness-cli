## Context

`renderReport` in `src/report.ts` currently emits, in order: Overall → Top Improvements → Detected providers → category/metric breakdown. On any repo with a non-trivial metric count, the breakdown pushes the summary off the top of the terminal's visible area, so the last thing on screen after a scan is a category's tail end rather than the score. `src/cli.ts` currently supports `--json`, `--summary`, `--detailed`, all operating on the same `ScoringResult` from `runScan`.

## Goals / Non-Goals

**Goals:**
- Put the summary (Overall + Top Improvements) last in the terminal report, separated from the breakdown by a visible divider, so it's the last thing visible without scrolling.
- Add a printable/shareable HTML report via `--html`, reusing the exact same `ScoringResult` and `summary`/`detailed` options the text report already uses.
- Support both "write to a specific file" (`--output <path>`) and "just show me something" (auto-open in browser) without adding a runtime dependency.

**Non-Goals:**
- No PDF generation library — "easy to print as a PDF" means "renders cleanly enough that the browser's own Print → Save as PDF works," not programmatic PDF export.
- No HTML templating engine — one function building a template-literal string is enough for a single static document shape.
- No change to `--json`'s own shape or the scoring/detection pipeline.
- No configurable HTML theme/branding — same fixed color bands as the terminal (green/yellow/red), inline CSS, no external assets or fonts.

## Decisions

**Terminal report order becomes: providers → categories → divider → Overall → Top Improvements. The HTML report keeps the original order: Overall → Top Improvements → providers → categories.**
These are different mediums solving different problems. The terminal reorder exists purely to counteract scrollback (the summary needs to be the *last* thing printed so it's still visible). A generated HTML/PDF document has no scrollback problem — it's read or printed top-to-bottom, and an executive summary belongs first, matching how the tool read before Top Improvements even existed. Forcing the two renderers to share one order would compromise one medium to satisfy the other's unrelated constraint.

**Divider is a fixed-width dim horizontal rule (`'─'.repeat(40)`), not terminal-width-aware.**
Querying `process.stdout.columns` to make the divider span the full terminal width would be more polished but adds an edge case (columns is `undefined` when stdout isn't a TTY, e.g. piped output) for a purely cosmetic detail. A fixed width is simple, always defined, and reads fine either way.

**HTML generation lives in a new `src/html-report.ts`, not folded into `report.ts`.**
`renderReport` returns ANSI-aware plain text; `renderHtmlReport` returns markup with escaping and inline CSS — different enough output shapes that sharing one file would mostly just mean shared imports, not shared logic. Both take the same `(result, options)` shape for symmetry.

**`--html` takes precedence over `--json` when both are passed; no error.**
Consistent with how `--summary`/`--detailed` already silently compose (summary wins over detailed's per-metric expansion) rather than rejecting combinations — this codebase's existing pattern is "define precedence," not "validate mutual exclusivity." Documented behavior, not a silent footgun, since it's spelled out in the spec/README.

**`--output` is meaningful when either `--html` or `--json` is set; passing it alone (with neither) is a documented no-op, not an error.**
Adding validation that rejects `--output` without `--html`/`--json` is more code (and another error message to test) for a low-value guardrail — a user who typos this will simply get the normal text report and can notice the missing file. Kept simple per the "don't overengineer this" instruction.

**`--output` with `--json` writes the file and stops there — no browser-opening fallback, unlike `--html`.**
Opening a `.json` file in a browser has no equivalent benefit to opening an HTML report — most browsers either show raw text or trigger a download, neither of which is "view a report." So `--json` without `--output` keeps its existing stdout behavior (that's already the useful default for a script/pipe), and `--json --output <path>` writes to the file with a confirmation, mirroring `--html --output`'s file-writing half without the file-writing-vs-browser branch. If `--html` and `--json` are both set, `--html` still wins per the existing precedence decision, so `--output` in that combination always refers to the HTML file.

**Browser opening: platform-specific `child_process.spawn`, no `open` npm package.**
```
darwin  → spawn('open', [filePath])
win32   → spawn('cmd', ['/c', 'start', '""', filePath])   // 'start' is a cmd.exe builtin, not an executable
linux/* → spawn('xdg-open', [filePath])
```
`detached: true, stdio: 'ignore'` so the CLI doesn't wait on or inherit the browser process. Opening is best-effort: if `spawn` throws (e.g. `xdg-open` missing in a minimal container), the temp file path is still printed to stdout so the user can open it manually — this does not fail the command (`runScan` already succeeded; failing to auto-open a viewer is a UX miss, not a scan failure).

**Temp file path includes a timestamp** (`agentlint-report-<Date.now()>.html` under `os.tmpdir()`), not a fixed name.
A fixed filename risks a stale browser tab not reloading fresh content when reopened via a second `open` call on some platforms/browsers. A unique name per run avoids that entirely for a few extra characters.

**Output file-write failures (bad `--output` path, permission denied) exit non-zero — for both `--html` and `--json`.**
Treated the same as the existing "invalid path rejected" pattern: the user asked for a specific output and it wasn't produced, so silently exiting 0 would be misleading. This slightly broadens "Process Exit Code" from "only when the scan itself fails to run" to also cover output-write failure, worded generically (not HTML-specific) since the same failure mode now applies to `--json --output` too.

## Risks / Trade-offs

- [Risk] Reordering the text report is a breaking change for any script that scrapes it positionally rather than by label (e.g. "take the second line"). → Mitigation: called out explicitly as **BREAKING** in the proposal; `--json` (the structured, script-friendly path) is completely unaffected.
- [Risk] `xdg-open`/`open`/`start` may not exist or may fail silently in some environments (headless containers, restricted sandboxes, SSH sessions without a display). → Mitigation: best-effort with the temp path always printed as a fallback; this mirrors the existing philosophy that report *generation* success is what the exit code reflects.
- [Risk] Inline CSS with fixed color bands won't respect a user's browser dark-mode preference well if they expect one. → Mitigation: accepted for v1 — a `prefers-color-scheme` media query could be added later without any interface changes; not needed to satisfy "print it as a PDF."

## Migration Plan

No data migration. Update `README.md`'s example output/usage to match the new order and document `--html`/`--output`. Existing `--json` integrations are unaffected.
