## Context

The package currently ships as `agentlint`, but that name is already taken on
the npm registry by an unrelated package, so this project cannot publish under
it. `agenticgrade` is unclaimed on npm and matches what the tool does (grades a
repo's agentic-coding readiness). This is a straight rename with no behavior,
architecture, or dependency changes — no design decisions are really at stake,
but the checklist below records what has to move together so nothing is missed
across the tasks that follow.

## Goals / Non-Goals

**Goals:**
- Publish under an available npm name (`agenticgrade`) with a matching CLI
  binary name.
- Keep every user-facing string (README, CLI usage/error text, HTML report
  title, temp-file naming) consistent with the new name — no leftover
  `agentlint` references outside of historical changelogs/archived OpenSpec
  changes.

**Non-Goals:**
- No change to scoring logic, metric catalog, CLI flags, or output formats.
- No change to the repository/GitHub project name (`agentic-readiness-cli`) —
  only the published npm package and CLI binary name change.
- Not preserving an `agentlint` compatibility alias/shim — this is a
  pre-first-publish rename, so there's no installed base to keep working.

## Decisions

- **Rename in place rather than publish a second package.** Since `agentlint`
  has never been published under this project (npm view shows it belongs to a
  different, unrelated project), there's no existing user base to redirect;
  a straight rename is simpler than maintaining two package names or a
  deprecation shim.
- **Binary name matches package name exactly (`agenticgrade`).** Keeps
  `npx agenticgrade` intuitive and avoids the confusion of a package/bin name
  mismatch.
- **No `agentlint`-name compatibility bin alias.** Since the package has not
  been published yet, there are no existing installs to support; adding an
  alias would just be dead weight.

## Risks / Trade-offs

- [Some string reference to `agentlint` is missed (docs, error text, HTML
  title)] → Mitigation: grep the full repo for the literal string `agentlint`
  (case-insensitive) as a final task-list step and confirm zero matches
  outside of archived OpenSpec change history, which is an immutable record
  and intentionally left as-is.
- [`agenticgrade` becomes unavailable on npm between now and publish] →
  Mitigation: this is a pre-existing risk of any name choice; not mitigated
  further here since it was confirmed available at proposal time.

## Migration Plan

This ships as a single change with no gradual rollout: update the name
everywhere in one commit/PR, run the full test suite, and publish the first
npm release as `agenticgrade`. There is no previously published version to
migrate users off of, so no deprecation notice or transition period is needed.

## Open Questions

- None — scope is a straight rename confirmed by checking npm availability of
  `agenticgrade` and confirming `agentlint` is already taken by an unrelated
  package.
