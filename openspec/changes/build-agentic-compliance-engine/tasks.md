## 1. Project Setup

- [ ] 1.1 Initialize Node.js/TypeScript project (`package.json`, `tsconfig.json`) with a CLI bin entry point
- [ ] 1.2 Add lint/format tooling (e.g., ESLint + Prettier) and a test runner (e.g., Vitest)
- [ ] 1.3 Add a basic `README.md` and `.gitignore`, and initialize the git repo

## 2. File Walker & Git Log Adapter

- [ ] 2.1 Implement a repo file-tree walker that recursively lists files/dirs under a given root
- [ ] 2.2 Exclude `node_modules`, `.git`, `dist`, `build` (and similar) directories from the walk
- [ ] 2.3 Implement a git-log adapter: recent commit subjects (for conventional-commit checks) and last-commit timestamp for a given path (for docs-freshness checks)
- [ ] 2.4 Add unit tests for the walker (including exclusion behavior) and the git-log adapter (against a fixture repo with controlled commit history)

## 3. Provider Detection (provider-detection)

- [ ] 3.1 Implement `openspec` detection (presence of `openspec/` directory)
- [ ] 3.2 Implement `claude` detection (presence of `CLAUDE.md` and/or `.claude/` directory)
- [ ] 3.3 Implement `universal` fallback (`AGENTS.md` present AND no specific provider detected)
- [ ] 3.4 Implement `none` fallback (no specific provider and no `AGENTS.md`)
- [ ] 3.5 Assemble the detected provider set and make it available before metric evaluation
- [ ] 3.6 Add unit tests for each detection rule and for the fallback/co-occurrence edge cases (e.g., `AGENTS.md` + `.claude/` → `{ claude }` only)

## 4. Metrics Catalog (readiness-metrics)

- [ ] 4.1 Define the metric data shape (`id`, `category`, `description`, `points`, `provider?`, `check`)
- [ ] 4.2 Implement Documentation metrics (10): README exists, README setup/run/test sections, CONTRIBUTING.md exists, `docs/specs/`, `docs/plans/`, `docs/research/`, `docs/adr/`, ADR index, PR template, spec/ADR templates
- [ ] 4.3 Implement Architecture metrics (8): `docs/adr/` exists, ADR files exist, ADR index, architecture overview doc, CODEOWNERS, clear source root, module/package boundaries detectable, no very large source files (800-line default threshold)
- [ ] 4.4 Implement Testing metrics (7): test command detected (via manifest/build-file inference), test command documented, CI runs tests, test files exist, coverage config/report, unit/integration structure detectable, tests are required checks
- [ ] 4.5 Implement Automation Guard Rails metrics (8): CI workflow exists, lint command detected, format command detected, typecheck/static analysis detected, security/dependency scan, PR template, conventional commit config, required checks/branch protection hint
- [ ] 4.6 Implement AI Context metrics (10): AGENTS.md exists, CLAUDE.md shim/import, agent file covers testing/code style/architecture rules/ADR-spec rules, `docs/specs`, `docs/plans`, `docs/research`, `.agentignore` or equivalent
- [ ] 4.7 Implement Maintainability metrics (9): PR template checklist, PR size guidance, conventional commits used recently (git-log adapter, 70%-of-last-20 default), large files below threshold, TODO/FIXME count reasonable (0.5% density default), dependency lockfile, CODEOWNERS, docs updated recently (git-log adapter, 90-day default), no generated files mixed with source
- [ ] 4.8 Implement `provider: openspec` metrics: change design docs present (Architecture), `openspec validate` in CI (Automation Guard Rails), change archive used (Maintainability)
- [ ] 4.9 Implement `provider: claude` metrics: hooks configured (Automation Guard Rails), subagents/skills documented (Maintainability), custom commands documented (Documentation)
- [ ] 4.10 Implement `provider: universal` metric: `AGENTS.md` has Setup/Conventions/Testing sections (AI Context)
- [ ] 4.11 Add unit tests for each metric's pass/fail detection using fixture repo trees, including provider-scoped metrics under each detected-provider combination and boundary cases for the heuristic thresholds (799 vs 801 lines, 69% vs 70% conventional-commit ratio, etc.)

## 5. Scoring Engine (readiness-scoring)

- [ ] 5.1 Implement applicability filtering: a metric applies if untagged, or if its `provider` tag is in the detected provider set
- [ ] 5.2 Implement category score aggregation (earned/max points per category, applicable metrics only)
- [ ] 5.3 Implement overall score aggregation (earned/max points across all categories, unweighted)
- [ ] 5.4 Implement letter grade mapping from overall percentage to the A+–F scale
- [ ] 5.5 Assemble the full scoring result structure (per-metric, per-category, overall, grade, detected providers)
- [ ] 5.6 Add unit tests covering applicability filtering, category aggregation, overall aggregation, and grade boundary cases

## 6. CLI (readiness-cli)

- [ ] 6.1 Implement argument parsing: optional repo path (default to cwd), `--json` flag
- [ ] 6.2 Validate the target path exists and is a directory; exit non-zero with an error message if not
- [ ] 6.3 Wire the CLI to run the walker, provider detection, metrics catalog, and scoring engine end-to-end
- [ ] 6.4 Implement the human-readable report renderer (detected providers, per-category breakdown, overall score, grade)
- [ ] 6.5 Implement the `--json` output mode (structured result including providers, no other stdout text)
- [ ] 6.6 Ensure exit code is 0 for any successfully completed scan regardless of grade
- [ ] 6.7 Add integration tests running the CLI against fixture repos (one per provider, plus `none`) and asserting both output modes

## 7. Verification

- [ ] 7.1 Run the CLI against `agentlint-poc` itself and confirm the report renders correctly, including provider detection
- [ ] 7.2 Run the full test suite and confirm all provider, metric, scoring, and CLI tests pass
