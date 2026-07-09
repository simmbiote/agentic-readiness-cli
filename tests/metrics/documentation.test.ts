import { describe, it, expect, afterEach } from 'vitest';
import { documentationMetrics } from '../../src/metrics/documentation.js';
import { scanFixture, type ScanFixture } from '../helpers/scan.js';

function metric(id: string) {
  const m = documentationMetrics.find((m) => m.id === id);
  if (!m) throw new Error(`metric not found: ${id}`);
  return m;
}

describe('documentation metrics', () => {
  let fx: ScanFixture | undefined;
  afterEach(() => {
    fx?.cleanup();
    fx = undefined;
  });

  it('README exists passes when README.md is present, fails when absent', () => {
    fx = scanFixture({ 'README.md': '# hi' });
    expect(metric('documentation.readme-exists').check(fx.ctx)).toBe(true);
    fx.cleanup();

    fx = scanFixture({});
    expect(metric('documentation.readme-exists').check(fx.ctx)).toBe(false);
  });

  it('README section coverage requires Setup, Run, and Test headings', () => {
    fx = scanFixture({
      'README.md': '# Project\n## Setup\ndo it\n## Run\ngo\n## Test\nnpm test',
    });
    expect(metric('documentation.readme-sections').check(fx.ctx)).toBe(true);
    fx.cleanup();

    fx = scanFixture({ 'README.md': '# Project\n## Setup\ndo it' });
    expect(metric('documentation.readme-sections').check(fx.ctx)).toBe(false);
  });

  it('CONTRIBUTING.md exists', () => {
    fx = scanFixture({ 'CONTRIBUTING.md': '# contributing' });
    expect(metric('documentation.contributing-exists').check(fx.ctx)).toBe(true);
  });

  it('docs/specs, docs/plans, docs/research existence', () => {
    fx = scanFixture({
      'docs/specs/spec1.md': 'x',
      'docs/plans/plan1.md': 'x',
      'docs/research/note.md': 'x',
    });
    expect(metric('documentation.docs-specs-exists').check(fx.ctx)).toBe(true);
    expect(metric('documentation.docs-plans-exists').check(fx.ctx)).toBe(true);
    expect(metric('documentation.docs-research-exists').check(fx.ctx)).toBe(true);
  });

  it('docs/specs passes via plain docs/specs regardless of detected provider', () => {
    fx = scanFixture({ 'docs/specs/spec1.md': 'x' }, ['none']);
    expect(metric('documentation.docs-specs-exists').check(fx.ctx)).toBe(true);
  });

  it('docs/specs passes via openspec/specs when the openspec provider is detected', () => {
    fx = scanFixture({ 'openspec/specs/foo/spec.md': 'x' }, ['openspec']);
    expect(metric('documentation.docs-specs-exists').check(fx.ctx)).toBe(true);
  });

  it('docs/specs fails via openspec/specs when the openspec provider is not detected', () => {
    fx = scanFixture({ 'openspec/specs/foo/spec.md': 'x' }, ['none']);
    expect(metric('documentation.docs-specs-exists').check(fx.ctx)).toBe(false);
  });

  it('docs/adr exists and ADR index exists', () => {
    fx = scanFixture({ 'docs/adr/README.md': 'index', 'docs/adr/0001-use-ts.md': 'x' });
    expect(metric('documentation.docs-adr-exists').check(fx.ctx)).toBe(true);
    expect(metric('documentation.adr-index-exists').check(fx.ctx)).toBe(true);
  });

  it('PR template exists under .github/', () => {
    fx = scanFixture({ '.github/PULL_REQUEST_TEMPLATE.md': '- [ ] done' });
    expect(metric('documentation.pr-template-exists').check(fx.ctx)).toBe(true);
  });

  it('Spec/ADR templates exist', () => {
    fx = scanFixture({ 'docs/adr/template.md': 'template' });
    expect(metric('documentation.spec-adr-templates-exist').check(fx.ctx)).toBe(true);
  });
});
