import { describe, it, expect } from 'vitest';
import { renderReport } from '../src/report.js';
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
            description: 'CONTRIBUTING.md exists',
            instruction: 'Add a CONTRIBUTING.md file',
            remediation: 'Contribution guidelines set expectations for PRs and review.',
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

describe('renderReport', () => {
  it('orders sections as: providers, categories, divider, overall, top improvements', () => {
    const output = renderReport(buildResult());

    const providersIdx = output.indexOf('Detected providers:');
    const categoryIdx = output.indexOf('Documentation:');
    const dividerIdx = output.indexOf('─'.repeat(40));
    const overallIdx = output.indexOf('Overall:');
    const topIdx = output.indexOf('Top Improvements:');

    expect(providersIdx).toBeGreaterThanOrEqual(0);
    expect(providersIdx).toBeLessThan(categoryIdx);
    expect(categoryIdx).toBeLessThan(dividerIdx);
    expect(dividerIdx).toBeLessThan(overallIdx);
    expect(overallIdx).toBeLessThan(topIdx);
  });

  it('includes a divider between the category breakdown and the overall line', () => {
    const output = renderReport(buildResult());

    expect(output).toContain('─'.repeat(40));
  });

  it('lists top improvements with instruction, category, and points', () => {
    const output = renderReport(buildResult());

    expect(output).toContain('Add a CONTRIBUTING.md file [Documentation] (+25 pts)');
  });

  it('omits the Top Improvements section when the list is empty, leaving the repo link as the last content', () => {
    const output = renderReport(buildResult({ topImprovements: [] }));

    expect(output).not.toContain('Top Improvements:');
    expect(output.trimEnd()).toContain('https://github.com/simmbiote/agenticgrade');
    expect(output.indexOf('Grade: F')).toBeLessThan(
      output.indexOf('https://github.com/simmbiote/agenticgrade'),
    );
  });

  it('includes a link to the repo for remediation details', () => {
    const output = renderReport(buildResult());

    expect(output).toContain('https://github.com/simmbiote/agenticgrade');
  });

  it('shows category percentage alongside earned/max score', () => {
    const output = renderReport(buildResult());

    expect(output).toContain('Documentation: 25/50 (50.0%)');
  });

  it('emits no ANSI escape codes when color is not supported (default test environment)', () => {
    const output = renderReport(buildResult());

    expect(output).not.toMatch(/\x1b\[/);
  });

  it('omits per-metric lines but keeps every other section when summary is true', () => {
    const output = renderReport(buildResult(), { summary: true });

    expect(output).toContain('Overall:');
    expect(output).toContain('Top Improvements:');
    expect(output).toContain('Detected providers:');
    expect(output).toContain('Documentation: 25/50 (50.0%)');
    expect(output).not.toContain('README exists');
    expect(output).not.toContain('CONTRIBUTING.md exists (0/25)');
  });

  it('renders the full per-metric breakdown when summary is unset (regression check)', () => {
    const output = renderReport(buildResult());

    expect(output).toContain('README exists');
    expect(output).toContain('CONTRIBUTING.md exists (0/25)');
  });

  it('shows remediation for failing metrics under --detailed, but not for passing ones', () => {
    const output = renderReport(buildResult(), { detailed: true });

    expect(output).toContain('Contribution guidelines set expectations for PRs and review.');
    expect(output).not.toContain('A README helps contributors get started.');
  });

  it('shows no remediation without --detailed', () => {
    const output = renderReport(buildResult());

    expect(output).not.toContain('Contribution guidelines set expectations for PRs and review.');
  });

  it('shows no per-metric lines or remediation when summary and detailed are both set', () => {
    const output = renderReport(buildResult(), { summary: true, detailed: true });

    expect(output).not.toContain('README exists');
    expect(output).not.toContain('Contribution guidelines set expectations for PRs and review.');
  });
});
