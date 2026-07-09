import { describe, it, expect, afterEach } from 'vitest';
import { aiContextMetrics } from '../../src/metrics/ai-context.js';
import { scanFixture, type ScanFixture } from '../helpers/scan.js';

function metric(id: string) {
  const m = aiContextMetrics.find((m) => m.id === id);
  if (!m) throw new Error(`metric not found: ${id}`);
  return m;
}

describe('AI context metrics', () => {
  let fx: ScanFixture | undefined;
  afterEach(() => {
    fx?.cleanup();
    fx = undefined;
  });

  it('AGENTS.md exists', () => {
    fx = scanFixture({ 'AGENTS.md': '# agents' }, ['universal']);
    expect(metric('ai-context.agents-md-exists').check(fx.ctx)).toBe(true);
  });

  it('CLAUDE.md shim/import exists when CLAUDE.md is present', () => {
    fx = scanFixture({ 'CLAUDE.md': '# claude' }, ['claude']);
    expect(metric('ai-context.claude-shim-import-exists').check(fx.ctx)).toBe(true);
  });

  it('CLAUDE.md shim/import exists when AGENTS.md references CLAUDE.md', () => {
    fx = scanFixture({ 'AGENTS.md': 'See CLAUDE.md for tool-specific notes.' }, ['universal']);
    expect(metric('ai-context.claude-shim-import-exists').check(fx.ctx)).toBe(true);
  });

  it('agent file coverage: testing, code style, architecture, ADR/spec', () => {
    fx = scanFixture(
      {
        'AGENTS.md':
          '## Testing\nrun tests\n## Conventions\nfollow style\n## Architecture\nrespect module boundaries\n## Specs\nsee docs/adr',
      },
      ['universal'],
    );
    expect(metric('ai-context.covers-testing').check(fx.ctx)).toBe(true);
    expect(metric('ai-context.covers-code-style').check(fx.ctx)).toBe(true);
    expect(metric('ai-context.covers-architecture-rules').check(fx.ctx)).toBe(true);
    expect(metric('ai-context.covers-adr-spec-rules').check(fx.ctx)).toBe(true);
  });

  it('docs/specs, docs/plans, docs/research existence', () => {
    fx = scanFixture({
      'docs/specs/a.md': 'x',
      'docs/plans/b.md': 'x',
      'docs/research/c.md': 'x',
    });
    expect(metric('ai-context.docs-specs-exists').check(fx.ctx)).toBe(true);
    expect(metric('ai-context.docs-plans-exists').check(fx.ctx)).toBe(true);
    expect(metric('ai-context.docs-research-exists').check(fx.ctx)).toBe(true);
  });

  it('docs/specs passes via plain docs/specs regardless of detected provider', () => {
    fx = scanFixture({ 'docs/specs/a.md': 'x' }, ['none']);
    expect(metric('ai-context.docs-specs-exists').check(fx.ctx)).toBe(true);
  });

  it('docs/specs passes via openspec/specs when the openspec provider is detected', () => {
    fx = scanFixture({ 'openspec/specs/foo/spec.md': 'x' }, ['openspec']);
    expect(metric('ai-context.docs-specs-exists').check(fx.ctx)).toBe(true);
  });

  it('docs/specs fails via openspec/specs when the openspec provider is not detected', () => {
    fx = scanFixture({ 'openspec/specs/foo/spec.md': 'x' }, ['none']);
    expect(metric('ai-context.docs-specs-exists').check(fx.ctx)).toBe(false);
  });

  it('.agentignore or equivalent exists', () => {
    fx = scanFixture({ '.agentignore': 'secrets/' });
    expect(metric('ai-context.agentignore-exists').check(fx.ctx)).toBe(true);
    fx.cleanup();

    fx = scanFixture(
      { 'AGENTS.md': 'Agents must not modify the secrets/ directory.' },
      ['universal'],
    );
    expect(metric('ai-context.agentignore-exists').check(fx.ctx)).toBe(true);
  });
});
