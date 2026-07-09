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
            points: 25,
            earned: 25,
            passed: true,
          },
          {
            id: 'b',
            category: 'documentation',
            description: 'CONTRIBUTING.md exists',
            points: 25,
            earned: 0,
            passed: false,
          },
        ],
      },
    ],
    topImprovements: [
      { id: 'b', category: 'documentation', description: 'CONTRIBUTING.md exists', points: 25 },
    ],
    overall: { earned: 25, max: 50, percentage: 50, grade: 'F' },
    ...overrides,
  };
}

describe('renderReport', () => {
  it('orders sections as: overall, top improvements, providers, categories', () => {
    const output = renderReport(buildResult());

    const overallIdx = output.indexOf('Overall:');
    const topIdx = output.indexOf('Top Improvements:');
    const providersIdx = output.indexOf('Detected providers:');
    const categoryIdx = output.indexOf('Documentation:');

    expect(overallIdx).toBeGreaterThanOrEqual(0);
    expect(overallIdx).toBeLessThan(topIdx);
    expect(topIdx).toBeLessThan(providersIdx);
    expect(providersIdx).toBeLessThan(categoryIdx);
  });

  it('lists top improvements with description, category, and points', () => {
    const output = renderReport(buildResult());

    expect(output).toContain('CONTRIBUTING.md exists [Documentation] (+25 pts)');
  });

  it('omits the Top Improvements section when the list is empty', () => {
    const output = renderReport(buildResult({ topImprovements: [] }));

    expect(output).not.toContain('Top Improvements:');
    const overallIdx = output.indexOf('Overall:');
    const providersIdx = output.indexOf('Detected providers:');
    expect(overallIdx).toBeLessThan(providersIdx);
  });

  it('shows category percentage alongside earned/max score', () => {
    const output = renderReport(buildResult());

    expect(output).toContain('Documentation: 25/50 (50.0%)');
  });

  it('emits no ANSI escape codes when color is not supported (default test environment)', () => {
    const output = renderReport(buildResult());

    expect(output).not.toMatch(/\x1b\[/);
  });
});
