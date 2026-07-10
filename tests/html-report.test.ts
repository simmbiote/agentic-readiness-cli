import { describe, it, expect } from 'vitest';
import { renderHtmlReport } from '../src/html-report.js';
import type { ScoringResult } from '../src/scoring.js';

function buildResult(overrides: Partial<ScoringResult> = {}): ScoringResult {
  return {
    providers: ['none'],
    categories: [
      {
        category: 'documentation',
        earned: 25,
        max: 50,
        percentage: 50,
        metrics: [
          {
            id: 'a',
            category: 'documentation',
            description: 'README exists',
            instruction: 'Add a README.md file',
            remediation: 'A README helps contributors get started.',
            points: 25,
            earned: 25,
            passed: true,
          },
          {
            id: 'b',
            category: 'documentation',
            description: 'CONTRIBUTING.md <exists>',
            instruction: 'Add a CONTRIBUTING.md file',
            remediation: 'Contribution guidelines & expectations for PRs.',
            points: 25,
            earned: 0,
            passed: false,
          },
        ],
      },
    ],
    topImprovements: [
      { id: 'b', category: 'documentation', instruction: 'Add a CONTRIBUTING.md file', points: 25 },
    ],
    overall: { earned: 25, max: 50, percentage: 50, grade: 'F' },
    ...overrides,
  };
}

describe('renderHtmlReport', () => {
  it('renders a self-contained HTML document with overall, top improvements, providers, and categories in order', () => {
    const html = renderHtmlReport(buildResult());

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<style>');

    const overallIdx = html.indexOf('Overall:');
    const topIdx = html.indexOf('Top Improvements');
    const providersIdx = html.indexOf('Detected providers:');
    const categoryIdx = html.indexOf('Documentation:');

    expect(overallIdx).toBeGreaterThanOrEqual(0);
    expect(overallIdx).toBeLessThan(topIdx);
    expect(topIdx).toBeLessThan(providersIdx);
    expect(providersIdx).toBeLessThan(categoryIdx);
  });

  it('lists top improvements with instruction, category, and points', () => {
    const html = renderHtmlReport(buildResult());

    expect(html).toContain('Add a CONTRIBUTING.md file [Documentation] (+25 pts)');
  });

  it('omits per-metric rows but keeps category headings when summary is true', () => {
    const html = renderHtmlReport(buildResult(), { summary: true });

    expect(html).toContain('Documentation:');
    expect(html).not.toContain('README exists');
    expect(html).not.toContain('CONTRIBUTING.md &lt;exists&gt;');
  });

  it('shows remediation for failing metrics under detailed, but not for passing ones', () => {
    const html = renderHtmlReport(buildResult(), { detailed: true });

    expect(html).toContain('Contribution guidelines &amp; expectations for PRs.');
    expect(html).not.toContain('A README helps contributors get started.');
  });

  it('shows no remediation without detailed', () => {
    const html = renderHtmlReport(buildResult());

    expect(html).not.toContain('Contribution guidelines &amp; expectations for PRs.');
  });

  it('escapes HTML-unsafe characters in metric text', () => {
    const html = renderHtmlReport(buildResult());

    expect(html).toContain('CONTRIBUTING.md &lt;exists&gt;');
    expect(html).not.toContain('CONTRIBUTING.md <exists>');
  });

  it('omits the Top Improvements block when the list is empty', () => {
    const html = renderHtmlReport(buildResult({ topImprovements: [] }));

    expect(html).not.toContain('Top Improvements');
  });

  it('includes a link to the repo for remediation details', () => {
    const html = renderHtmlReport(buildResult());

    expect(html).toContain('<a href="https://github.com/simmbiote/agenticgrade">');
  });

  it('titles the report with the current package name', () => {
    const html = renderHtmlReport(buildResult());

    expect(html).toContain('<title>agenticgrade report</title>');
  });
});
