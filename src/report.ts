import pc from 'picocolors';
import type { ScoringResult } from './scoring.js';
import type { Category } from './metrics/types.js';

const CATEGORY_LABELS: Record<Category, string> = {
  documentation: 'Documentation',
  architecture: 'Architecture',
  testing: 'Testing',
  'automation-guardrails': 'Automation Guard Rails',
  'ai-context': 'AI Context',
  maintainability: 'Maintainability',
};

function percentageColor(percentage: number): (input: string | number) => string {
  if (percentage >= 80) return pc.green;
  if (percentage >= 50) return pc.yellow;
  return pc.red;
}

function gradeColor(grade: string): (input: string | number) => string {
  if (grade.startsWith('A')) return pc.green;
  if (grade.startsWith('B') || grade.startsWith('C')) return pc.yellow;
  return pc.red;
}

export function renderReport(result: ScoringResult): string {
  const lines: string[] = [];

  const { earned, max, percentage, grade } = result.overall;
  const color = percentageColor(percentage);
  lines.push(
    `Overall: ${color(`${earned}/${max}`)} (${color(`${percentage.toFixed(1)}%`)}) — Grade: ${gradeColor(grade)(grade)}`,
  );
  lines.push('');

  if (result.topImprovements.length > 0) {
    lines.push(pc.bold('Top Improvements:'));
    for (const improvement of result.topImprovements) {
      lines.push(
        pc.red(
          `  - ${improvement.description} [${CATEGORY_LABELS[improvement.category]}] (+${improvement.points} pts)`,
        ),
      );
    }
    lines.push('');
  }

  if (result.providers.length === 1 && result.providers[0] === 'none') {
    lines.push('Detected providers: none');
    lines.push(
      'No agentic provider detected (no openspec/, CLAUDE.md/.claude/, or AGENTS.md found) — AI Context scoring reflects base metrics only.',
    );
  } else {
    lines.push(`Detected providers: ${result.providers.join(', ')}`);
  }
  lines.push('');

  for (const category of result.categories) {
    const categoryColor = percentageColor(category.percentage);
    lines.push(
      `${CATEGORY_LABELS[category.category]}: ${categoryColor(`${category.earned}/${category.max}`)} (${categoryColor(`${category.percentage.toFixed(1)}%`)})`,
    );
    for (const metric of category.metrics) {
      const mark = (metric.passed ? pc.green : pc.red)(`[${metric.passed ? 'x' : ' '}]`);
      const providerTag = metric.provider ? ` [${metric.provider}]` : '';
      lines.push(`  ${mark} ${metric.description} (${metric.earned}/${metric.points})${providerTag}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
