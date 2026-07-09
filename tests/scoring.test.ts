import { describe, it, expect, afterEach } from 'vitest';
import { createScanContext } from '../src/context.js';
import { gradeFromPercentage, isMetricApplicable, scoreRepo } from '../src/scoring.js';
import type { Metric } from '../src/metrics/types.js';
import { createFixture, type Fixture } from './helpers/fixture.js';

describe('gradeFromPercentage', () => {
  it.each([
    [100, 'A+'],
    [97, 'A+'],
    [96, 'A'],
    [93, 'A'],
    [90, 'A-'],
    [83, 'B'],
    [70, 'C-'],
    [60, 'D'],
    [59.9, 'F'],
    [0, 'F'],
  ])('%d%% maps to %s', (pct, grade) => {
    expect(gradeFromPercentage(pct)).toBe(grade);
  });
});

describe('isMetricApplicable', () => {
  const base: Metric = {
    id: 'x',
    category: 'documentation',
    description: 'x',
    points: 10,
    check: () => true,
  };

  it('is true for an untagged metric regardless of providers', () => {
    expect(isMetricApplicable(base, new Set())).toBe(true);
    expect(isMetricApplicable(base, new Set(['claude']))).toBe(true);
  });

  it('is true for a tagged metric only when its provider is detected', () => {
    const tagged = { ...base, provider: 'claude' as const };
    expect(isMetricApplicable(tagged, new Set(['claude']))).toBe(true);
    expect(isMetricApplicable(tagged, new Set(['openspec']))).toBe(false);
  });
});

describe('scoreRepo', () => {
  let fixture: Fixture | undefined;

  afterEach(() => {
    fixture?.cleanup();
    fixture = undefined;
  });

  it('sums earned/max per category and excludes non-applicable provider metrics', () => {
    fixture = createFixture({});
    const ctx = createScanContext(fixture.root, new Set(['claude']));

    const metrics: Metric[] = [
      { id: 'a', category: 'documentation', description: 'a', points: 10, check: () => true },
      { id: 'b', category: 'documentation', description: 'b', points: 15, check: () => false },
      {
        id: 'c',
        category: 'documentation',
        description: 'c',
        points: 10,
        provider: 'claude',
        check: () => true,
      },
      {
        id: 'd',
        category: 'documentation',
        description: 'd',
        points: 10,
        provider: 'openspec',
        check: () => true,
      },
    ];

    const result = scoreRepo(ctx, metrics);
    const doc = result.categories.find((c) => c.category === 'documentation')!;

    expect(doc.earned).toBe(20);
    expect(doc.max).toBe(35);
    expect(doc.percentage).toBeCloseTo((20 / 35) * 100);
    expect(doc.metrics.map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });

  it('reports a category percentage of 0 when the category has no applicable metrics', () => {
    fixture = createFixture({});
    const ctx = createScanContext(fixture.root, new Set(['none']));
    const metrics: Metric[] = [
      { id: 'a', category: 'testing', description: 'a', points: 10, check: () => true },
    ];

    const result = scoreRepo(ctx, metrics);
    const doc = result.categories.find((c) => c.category === 'documentation')!;

    expect(doc.max).toBe(0);
    expect(doc.percentage).toBe(0);
  });

  it('aggregates overall totals across all six categories and reports providers', () => {
    fixture = createFixture({});
    const ctx = createScanContext(fixture.root, new Set(['none']));
    const metrics: Metric[] = [
      { id: 'a', category: 'documentation', description: 'a', points: 10, check: () => true },
      { id: 'b', category: 'testing', description: 'b', points: 20, check: () => false },
    ];

    const result = scoreRepo(ctx, metrics);

    expect(result.providers).toEqual(['none']);
    expect(result.overall.earned).toBe(10);
    expect(result.overall.max).toBe(30);
    expect(result.overall.grade).toBe(gradeFromPercentage((10 / 30) * 100));
  });

  it('ranks the top 5 failing metrics by points, descending', () => {
    fixture = createFixture({});
    const ctx = createScanContext(fixture.root, new Set(['none']));
    const metrics: Metric[] = [
      { id: 'a', category: 'documentation', description: 'a', points: 5, check: () => false },
      { id: 'b', category: 'documentation', description: 'b', points: 20, check: () => false },
      { id: 'c', category: 'testing', description: 'c', points: 15, check: () => false },
      { id: 'd', category: 'testing', description: 'd', points: 10, check: () => false },
      { id: 'e', category: 'architecture', description: 'e', points: 25, check: () => false },
      { id: 'f', category: 'architecture', description: 'f', points: 1, check: () => false },
      { id: 'g', category: 'maintainability', description: 'g', points: 30, check: () => true },
    ];

    const result = scoreRepo(ctx, metrics);

    expect(result.topImprovements.map((m) => m.id)).toEqual(['e', 'b', 'c', 'd', 'a']);
  });

  it('includes all failing metrics when fewer than 5 fail', () => {
    fixture = createFixture({});
    const ctx = createScanContext(fixture.root, new Set(['none']));
    const metrics: Metric[] = [
      { id: 'a', category: 'documentation', description: 'a', points: 10, check: () => false },
      { id: 'b', category: 'testing', description: 'b', points: 20, check: () => false },
      { id: 'c', category: 'architecture', description: 'c', points: 5, check: () => true },
    ];

    const result = scoreRepo(ctx, metrics);

    expect(result.topImprovements.map((m) => m.id)).toEqual(['b', 'a']);
  });

  it('reports an empty topImprovements list when every metric passes', () => {
    fixture = createFixture({});
    const ctx = createScanContext(fixture.root, new Set(['none']));
    const metrics: Metric[] = [
      { id: 'a', category: 'documentation', description: 'a', points: 10, check: () => true },
    ];

    const result = scoreRepo(ctx, metrics);

    expect(result.topImprovements).toEqual([]);
  });

  it('breaks ties by category order', () => {
    fixture = createFixture({});
    const ctx = createScanContext(fixture.root, new Set(['none']));
    const metrics: Metric[] = [
      { id: 'a', category: 'testing', description: 'a', points: 10, check: () => false },
      { id: 'b', category: 'documentation', description: 'b', points: 10, check: () => false },
    ];

    const result = scoreRepo(ctx, metrics);

    expect(result.topImprovements.map((m) => m.id)).toEqual(['b', 'a']);
  });
});
