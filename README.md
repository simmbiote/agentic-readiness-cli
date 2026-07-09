# agentlint

Scans a repository and scores its agentic-coding readiness — whether the repo has
what an AI coding agent needs to work well unaided — across six categories:
Documentation, Architecture, Testing, Automation Guard Rails, AI Context, and
Maintainability.

The scan also detects which agentic-tooling provider convention a repo uses
(`openspec`, `claude`, a generic `AGENTS.md`-based `universal` setup, or `none`)
and applies provider-specific bonus metrics on top of the base catalog.

## Setup

```bash
npm install
npm run build
```

## Run

```bash
npx agentlint [path]        # human-readable report, defaults to the current directory
npx agentlint [path] --json # structured JSON output
```

During development, run directly against source without building:

```bash
npm run dev -- [path]
```

> **Known issue:** `npx agentlint [path]` currently exits silently with no output.
> `dist/cli.js`'s main-module check (`import.meta.url === new URL(process.argv[1], 'file:').href`)
> fails when the CLI is invoked through the `node_modules/.bin/agentlint` symlink that `npx`
> uses, because `import.meta.url` resolves through the symlink to a different path than
> `process.argv[1]`. Until that's fixed, run the built CLI directly instead:
>
> ```bash
> npm run build
> node dist/cli.js [path]        # e.g. node dist/cli.js . to score this repo
> node dist/cli.js [path] --json
> ```

## Test

```bash
npm test
```
