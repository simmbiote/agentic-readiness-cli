# agentlint

Scans a repository and scores its agentic-coding readiness — whether the repo has
what an AI coding agent needs to work well unaided — across six categories:
Documentation, Architecture, Testing, Automation Guard Rails, AI Context, and
Maintainability.

The scan also detects which agentic-tooling provider convention a repo uses
(`openspec`, `claude`, a generic `AGENTS.md`-based `universal` setup, or `none`)
and applies provider-specific bonus metrics on top of the base catalog.

See [docs/METRICS.md](docs/METRICS.md) for the full metric reference — every metric's
description, fix instruction, and remediation explanation in one table.

## Setup

```bash
npm install
npm run build
```

## Run

```bash
npx agentlint scan [path]             # human-readable report, defaults to the current directory
npx agentlint scan [path] --json      # structured JSON output
npx agentlint scan [path] --summary   # condensed report: overall, top improvements, providers, category totals — no per-metric detail
npx agentlint scan [path] --detailed  # expanded report: each failing metric is followed by a remediation explanation
npx agentlint scan [path] --html      # renders a self-contained HTML report and opens it in your browser
```

The human-readable report prints, top to bottom: detected providers, the category/metric breakdown, a divider, then the overall score/grade and Top Improvements — the summary comes last so it's still on screen after a long breakdown, without scrolling.

`--summary` can be combined with `--json` or `--html` to trim per-metric detail the same way: each category omits its individual metric rows/`metrics` array.

`--detailed` can be combined with `--json` or `--html` to include each failing metric's remediation text (a `remediation` field in JSON; an indented explanation in the text/HTML report). Without `--detailed`, JSON metric results have no `remediation` field. `--detailed` has no effect when `--summary` is also set, since `--summary` already omits per-metric output entirely.

### `--html` and `--output`

```bash
npx agentlint scan [path] --html                        # writes a temp HTML file and opens it in your default browser
npx agentlint scan [path] --html --output report.html   # writes the HTML report to the given path instead
npx agentlint scan [path] --json --output report.json   # writes the JSON report to the given path instead of stdout
```

`--html` renders the scan as a self-contained HTML document (inline styles, no external assets) — handy for sharing or printing as a PDF via your browser's print dialog. Its section order is Overall → Top Improvements → providers → categories (unlike the terminal report, an HTML/PDF document has no scrollback problem, so the summary stays at the top).

`--output <path>` redirects `--html` or `--json` output to a file (creating any missing parent directories) instead of opening a browser or printing to stdout, and prints a confirmation naming the file. If both `--html` and `--json` are passed, `--html` takes precedence and `--output` writes the HTML. `--output` has no effect unless `--html` or `--json` is also passed.

During development, run directly against source without building:

```bash
npm run dev -- scan [path]
```

> **Known issue:** `npx agentlint scan [path]` currently exits silently with no output.
> `dist/cli.js`'s main-module check (`import.meta.url === new URL(process.argv[1], 'file:').href`)
> fails when the CLI is invoked through the `node_modules/.bin/agentlint` symlink that `npx`
> uses, because `import.meta.url` resolves through the symlink to a different path than
> `process.argv[1]`. Until that's fixed, run the built CLI directly instead:
>
> ```bash
> npm run build
> node dist/cli.js scan [path]        # e.g. node dist/cli.js scan . to score this repo
> node dist/cli.js scan [path] --json
> ```

## Test

```bash
npm test
```
