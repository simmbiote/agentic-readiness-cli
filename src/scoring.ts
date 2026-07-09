import type { ScanContext } from './context.js';
import type { Category, Metric } from './metrics/types.js';
import { CATEGORIES } from './metrics/types.js';
import type { ProviderId } from './providers.js';

export interface MetricResult {
  id: string;
  category: Category;
  description: string;
  points: number;
  earned: number;
  passed: boolean;
  provider?: string;
}

export interface CategoryScore {
  category: Category;
  earned: number;
  max: number;
  percentage: number;
  metrics: MetricResult[];
}

export type TopImprovement = Pick<MetricResult, 'id' | 'category' | 'description' | 'points'>;

export interface ScoringResult {
  providers: ProviderId[];
  categories: CategoryScore[];
  topImprovements: TopImprovement[];
  overall: {
    earned: number;
    max: number;
    percentage: number;
    grade: string;
  };
}

const GRADE_BOUNDARIES: Array<[number, string]> = [
  [97, 'A+'],
  [93, 'A'],
  [90, 'A-'],
  [87, 'B+'],
  [83, 'B'],
  [80, 'B-'],
  [77, 'C+'],
  [73, 'C'],
  [70, 'C-'],
  [67, 'D+'],
  [60, 'D'],
  [0, 'F'],
];

export function gradeFromPercentage(percentage: number): string {
  for (const [min, grade] of GRADE_BOUNDARIES) {
    if (percentage >= min) return grade;
  }
  return 'F';
}

export function isMetricApplicable(metric: Metric, providers: Set<ProviderId>): boolean {
  return !metric.provider || providers.has(metric.provider);
}

export function scoreRepo(ctx: ScanContext, metrics: Metric[]): ScoringResult {
  const applicable = metrics.filter((m) => isMetricApplicable(m, ctx.providers));

  const categories: CategoryScore[] = CATEGORIES.map((category) => {
    const categoryMetrics = applicable.filter((m) => m.category === category);
    const results: MetricResult[] = categoryMetrics.map((m) => {
      const passed = m.check(ctx);
      return {
        id: m.id,
        category: m.category,
        description: m.description,
        points: m.points,
        earned: passed ? m.points : 0,
        passed,
        provider: m.provider,
      };
    });
    const earned = results.reduce((sum, r) => sum + r.earned, 0);
    const max = results.reduce((sum, r) => sum + r.points, 0);
    const percentage = max === 0 ? 0 : (earned / max) * 100;
    return { category, earned, max, percentage, metrics: results };
  });

  const overallEarned = categories.reduce((sum, c) => sum + c.earned, 0);
  const overallMax = categories.reduce((sum, c) => sum + c.max, 0);
  const percentage = overallMax === 0 ? 0 : (overallEarned / overallMax) * 100;

  const topImprovements = categories
    .flatMap((c) => c.metrics)
    .filter((m) => !m.passed)
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map(({ id, category, description, points }) => ({ id, category, description, points }));

  return {
    providers: Array.from(ctx.providers),
    categories,
    topImprovements,
    overall: {
      earned: overallEarned,
      max: overallMax,
      percentage,
      grade: gradeFromPercentage(percentage),
    },
  };
}
