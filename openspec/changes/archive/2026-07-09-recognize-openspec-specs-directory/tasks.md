## 1. Helper

- [x] 1.1 Add `specsDir(ctx)` to `src/metrics/helpers.ts`, mirroring `adrDir(ctx)`: returns `'docs/specs'` if that path exists, else `'openspec/specs'` if that path exists and `ctx.providers.has('openspec')`, else `null`

## 2. Metric Checks

- [x] 2.1 Update `documentation.docs-specs-exists`'s `check` in `src/metrics/documentation.ts` to `(ctx) => specsDir(ctx) !== null`
- [x] 2.2 Update `ai-context.docs-specs-exists`'s `check` in `src/metrics/ai-context.ts` to `(ctx) => specsDir(ctx) !== null`

## 3. Tests

- [x] 3.1 Add tests in `tests/metrics/documentation.test.ts` for `docs-specs-exists`: passes with `openspec/specs/` present and `openspec` provider detected; fails with `openspec/specs/` present but `openspec` provider not detected; still passes with plain `docs/specs/` regardless of provider (regression)
- [x] 3.2 Add equivalent tests in `tests/metrics/ai-context.test.ts` for `docs-specs-exists`
- [x] 3.3 Add a unit test for `specsDir` in `tests/metrics/helpers.test.ts` (if one exists) or alongside the metric tests, covering all three resolution branches

## 4. Verification

- [x] 4.1 Run `npm run build && npm test` and confirm all tests pass
- [x] 4.2 Run `node dist/cli.js scan .` against this repo and confirm "docs/specs/ exists" (Documentation) and "docs/specs exists" (AI Context) now show `[x]` / full points, given this repo's `openspec/specs/` directory and detected `openspec` provider
- [x] 4.3 Run `npm run lint` and confirm it passes
